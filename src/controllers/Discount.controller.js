import { CreatedResponse, OkResponse } from "../core/success.response.js";
import DiscountCodeService from "../services/DiscountCode.service.js";

class DiscountCodeController {
  async createDiscountCode(req, res, next) {
    const newDiscountCode = await DiscountCodeService.createDiscountCode({
      ...req.body,
      shop: req.keyStore.user,
    });
    new CreatedResponse({
      message: "Discount code created successfully",
      metadata: newDiscountCode,
    }).send(res);
  }

  async getDiscountAmount(req, res, next) {
    const { code, shopId, products } = req.body;
    const userId = req.keyStore.user;
    const discountAmount = await DiscountCodeService.getDiscountAmount({
      code,
      userId,
      shopId,
      products,
    });
    new OkResponse({
      message: "Get discount amount successfully",
      metadata: discountAmount,
    }).send(res);
  }

  async getAllDiscountCodeByShop(req, res, next) {
    const discountCodes = await DiscountCodeService.getAllDiscountCodeByShop({
      shopId: req.keyStore.user,
    });
    new OkResponse({
      message: "Get all discount code of shop successfully",
      metadata: discountCodes,
    }).send(res);
  }

  async getAllProductsWithDiscountCode(req, res, next) {
    const { code, shopId } = req.query;
    const products = await DiscountCodeService.getAllProductsWithDiscountCode({
      code,
      shopId,
    });
    new OkResponse({
      message: "Get all products with discount code successfully",
      metadata: products,
    }).send(res);
  }
}

export default new DiscountCodeController();
