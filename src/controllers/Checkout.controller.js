import { OkResponse } from "../core/success.response.js";
import CheckoutService from "../services/Checkout.service.js";

export class CheckoutController {
  static async checkoutReview(req, res, next) {
    new OkResponse({
      message: "Checkout order success",
      metadata: await CheckoutService.checkoutReview(req.body),
    }).send(res);
  }
}
