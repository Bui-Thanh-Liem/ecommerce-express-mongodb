const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

export function apiKey(req, res, next) {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({
        message: "Forbidden Error",
      });
    }

    // Check api
    
    
  } catch (error) {}
}
