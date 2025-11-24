import ApiKeyService from "../services/apiKey.service.js";

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

export async function checkApiKey(req, res, next) {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({
        message: "Forbidden Error",
      });
    }

    // Check api
    const objKey = await ApiKeyService.findOneByKey({ key });
    if (!objKey) {
      return res.status(403).json({
        message: "Forbidden Error",
      });
    }

    //
    req.objKey = objKey;
    next();
  } catch (error) {
    next(error);
  }
}

export function checkPermission(permission) {
  return (req, res, next) => {
    const permissions = req.objKey.permissions || [];

    //
    if (!permissions.length) {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    //
    console.log("permissions:::", permissions);
    const valid = permissions.includes(permission);

    //
    if (!valid) {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    return next();
  };
}
