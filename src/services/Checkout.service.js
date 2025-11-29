import { BadRequestError, NotFoundError } from "../core/error.response.js";
import { CartRepository } from "../models/repositories/cart.repo";
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
        priceRaw: checkoutOrder, // tiền trước khi giảm giá
        priceApplyDiscount: checkoutOrder, // tiền sau khi giảm giá
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
}

export default new CheckoutService();
