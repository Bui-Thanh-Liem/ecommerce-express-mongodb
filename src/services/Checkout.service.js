import { BadRequestError, NotFoundError } from "../core/error.response.js";
import { CartRepository } from "../models/repositories/cart.repo.js";
import ProductRepository from "../models/repositories/product.repo.js";
import DiscountCodeService from "./DiscountCode.service.js";

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

    // Kiểm tra lại xem có vượt tồn kho hay không
    const products = shopOrderIds.flatMap((order) => order.itemProducts);
    console.log("products :::", products);
  }
}

export default new CheckoutService();

async function protectedTask() {
  let lock;
  try {
    // lấy lock với TTL = 2000 ms
    lock = await redlock.acquire(["locks:resource:123"], 2000);
    console.log("Đã lấy lock");

    // --- critical section ---
    await doSomethingCritical();
    // -------------------------

    await lock.release();
    console.log("Đã release lock");
  } catch (err) {
    // Thường ở đây là lỗi không lấy được lock hoặc lỗi trong critical section
    console.error("Lỗi khi xử lý có lock:", err);
    // nếu lock tồn tại vẫn cố release trong finally (nếu cần)
  } finally {
    if (lock) {
      try {
        await lock.release();
      } catch (e) {
        /* release có thể fail nếu TTL hết */
      }
    }
  }
}
