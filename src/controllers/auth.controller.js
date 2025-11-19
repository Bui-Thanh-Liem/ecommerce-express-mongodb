class AuthController {
  signup(req, res, next) {
    try {
      console.log(`[P]:::signup:::`, req.body);

      
      return res.status(200).json({
        code: "2001",
        metadata: { userid: 1 },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
