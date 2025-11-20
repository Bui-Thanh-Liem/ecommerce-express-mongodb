import authService from "../services/auth.service.js";

class AuthController {
  async signup(req, res, next) {
    try {
      console.log(`[P]:::signup:::`, req.body);
      const result = await authService.signup(req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
