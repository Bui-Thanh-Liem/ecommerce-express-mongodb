import { CreatedResponse, OkResponse } from "../core/success.response.js";
import authService from "../services/auth.service.js";

class AuthController {
  async signup(req, res, next) {
    const result = await authService.signup(req.body);
    new CreatedResponse({
      message: "Shop created successfully",
      metadata: result,
    }).send(res);
  }

  async login(req, res, next) {
    const result = await authService.login(req.body);
    new OkResponse({
      message: "Shop logged in successfully",
      metadata: result,
    }).send(res);
  }

  async logout(req, res, next) {
    const result = await authService.logout({ keyStore: req.keyStore });
    new OkResponse({
      message: "Shop logged out successfully",
      metadata: result,
    }).send(res);
  }
}

export default new AuthController();
