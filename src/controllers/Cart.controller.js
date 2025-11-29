import { CreatedResponse, OkResponse } from "../core/success.response.js";
import CartService from "../services/cart.service.js";

class CartController {
  //
  async addToCart(req, res, next) {
    new CreatedResponse({
      message: "Create new Cart success",
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  }

  //
  async update(req, res, next) {
    new OkResponse({
      message: "Update cart success",
      metadata: await CartService.addToCartV2(req.body),
    }).send(res);
  }

  //
  async deleteProductItem(req, res, next) {
    new OkResponse({
      message: "Delete cart success",
      metadata: await CartService.deleteProductItem(req.body),
    }).send(res);
  }

  //
  async listToCart(req, res, next) {
    new OkResponse({
      message: "List cart success",
      metadata: await CartService.getListUserCart(req.query),
    }).send(res);
  }
}

export default new CartController();
