import { BadRequestError, NotFoundError } from "../core/error.response.js";
import { redlock } from "../libs/redlock.js";
import orderModel from "../models/order.model.js";
import { CartRepository } from "../models/repositories/cart.repo.js";
import { InventoryRepository } from "../models/repositories/inventory.repo.js";
import ProductRepository from "../models/repositories/product.repo.js";
import DiscountCodeService from "./DiscountCode.service.js";
import inventoryService from "./inventory.service.js";

class CheckoutService {
  async checkoutReview({ cartId, userId, shopOrderIds = [] }) {
    // Kiểm tra cart có tồn tại hay không
    const foundCart = await CartRepository.findOneById(cartId);
    if (!foundCart) throw new NotFoundError("Cart not exists!");

    // Khởi tạo đơn hàng
    const checkoutOrder = {
      totalPrice: 0, // Tổng tiền hàng
      feeShip: 0, // Phí vận chuyển
      totalDiscount: 0, // Tổng tiền giảm giá
      totalCheckout: 0, // Tổng tiền thanh toán
    };
    const shopOrderIdsNew = [];

    // Tính tổng tiền bill
    for (let i = 0; i < shopOrderIds.length; i++) {
      const { shopId, shopDiscounts = [], itemProducts = [] } = shopOrderIds[i];

      // Kiểm tra sản phẩm hợp lệ
      const validProductServer = await ProductRepository.checkProductByServer({
        products: itemProducts,
      });
      if (!validProductServer) throw new BadRequestError("Order wrong !!!");

      // Tổng tiền tất cả sản phẩm trong một shop
      const checkoutPrice = validProductServer.reduce((acc, prod) => {
        return acc + prod.quantity * prod.price;
      }, 0);

      // Tổng tiền trước khi xử lý
      checkoutOrder.totalPrice += checkoutPrice;

      //
      const itemCheckout = {
        shopId,
        shopDiscounts,
        priceRaw: checkoutPrice, // tiền trước khi giảm giá
        priceApplyDiscount: checkoutPrice, // tiền sau khi giảm giá
        itemProducts: validProductServer,
      };

      // Nếu shopDiscounts tồn tại và > 0 thì kiểm tra xem có hợp lệ hay không
      if (shopDiscounts.length > 0) {
        // Một discount thôi
        const { totalPrice, discount } =
          await DiscountCodeService.getDiscountAmount({
            shopId,
            userId,
            code: shopDiscounts[0].code,
            products: validProductServer,
          });

        // Tổng cộng giảm giá
        checkoutOrder.totalDiscount += discount;

        // Nếu tiền giảm giá > 0 thì mới apply
        if (discount > 0) {
          itemCheckout.priceApplyDiscount = checkoutPrice - discount;
        }
      }

      // Tổng thanh toán cuối cùng
      checkoutOrder.totalCheckout += itemCheckout.priceApplyDiscount;
      shopOrderIdsNew.push(itemCheckout);
    }

    //
    return {
      shopOrderIds,
      checkoutOrder,
      shopOrderIdsNew,
    };
  }

  async orderByUser({
    cartId,
    userId,
    shopOrderIds,
    userAddress = {},
    userPayment = {},
  }) {
    //
    const { checkoutOrder, shopOrderIdsNew } = await this.checkoutReview({
      cartId,
      userId,
      shopOrderIds,
    });

    // Xử lý trừ tồn kho với redlock
    const products = shopOrderIdsNew.flatMap((order) => order.itemProducts);
    const locks = [];
    const successful = []; // lưu ds sản phẩm đã trừ tồn

    try {
      // ===== 1. Acquire lock tất cả sản phẩm =====
      for (const { productId } of products) {
        const lock = await redlock.acquire(
          [`locks:inventory:${productId}`],
          3000
        );
        locks.push(lock);
      }

      // ===== 2. Critical Section =====
      for (const { productId, quantity } of products) {
        const reservation = await inventoryService.reservationInventory({
          productId,
          quantity,
          cartId,
        });

        if (reservation.modifiedCount <= 0) {
          throw new BadRequestError(`Sản phẩm ${productId} không đủ tồn`);
        }

        // Ghi lại để rollback nếu sau đó sản phẩm khác fail
        successful.push({ productId, quantity });
      }

      // Tạo đơn hàng ở đây (chưa xóa giỏ hàng)
      const newOrder = await orderModel.create({
        userId,
        checkout: checkoutOrder,
        shipping: userAddress,
        payment: userPayment,
        products,
      });

      // Xóa giỏ hàng
      await CartRepository.deleteById(cartId);

      // ===== 3. Thành công =====
      return {
        message: "Đặt hàng thành công",
        success: true,
      };
    } catch (err) {
      console.error("Lỗi trong checkout:", err);

      // ===== 4. ROLLBACK =====
      for (const { productId, quantity } of successful) {
        try {
          await inventoryService.rollbackInventory({
            productId,
            quantity,
            cartId,
          });
        } catch (e) {
          console.error("Rollback fail:", e);
        }
      }

      throw new BadRequestError("Không thể đặt hàng, tồn kho không đủ.");
    } finally {
      // ===== 5. RELEASE LOCK =====
      for (const lock of locks) {
        try {
          await lock.release();
        } catch {}
      }
    }
  }

  async getOrderByUser({ userId, orderId }) {
    const foundOrder = await orderModel.findOne({ _id: orderId, userId });
    if (!foundOrder) throw new NotFoundError("Order not found");
    return foundOrder;
  }

  async getOrdersByUser({ userId, limit = 50, skip = 0 }) {
    return await orderModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  }

  async cancelOrderByUser({ userId, orderId }) {
    const foundOrder = await orderModel.findOne({ _id: orderId, userId });
    if (!foundOrder) throw new NotFoundError("Order not found");
    if (foundOrder.status === "cancelled") {
      throw new BadRequestError("Order already cancelled");
    }

    // Cập nhật trạng thái hủy đơn
    foundOrder.status = "cancelled";
    await foundOrder.save();
    return foundOrder;
  }

  async updateOrderStatusBySystem({ orderId, status }) {
    const foundOrder = await orderModel.findOne({ _id: orderId });
    if (!foundOrder) throw new NotFoundError("Order not found");
    foundOrder.status = status;
    await foundOrder.save();
    return foundOrder;
  }
}

export default new CheckoutService();
