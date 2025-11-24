import authService from "../services/auth.service.js";

class AuthController {
  async signup(req, res, next) {
    console.log(`[P]:::signup:::`, req.body);
    const result = await authService.signup(req.body);
    return res.status(200).json(result);
  }
}

export default new AuthController();
