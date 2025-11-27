import { ForbiddenRequestError } from "../core/error.response.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import ApiKeyService from "../services/apiKey.service.js";
import JWT from "jsonwebtoken";
import keyTokenService from "../services/KeyToken.service.js";

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-key",
  AUTHORIZATION: "authorization",
};

export async function checkApiKey(req, res, next) {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({
        message: "Forbidden Error (miss)",
      });
    }

    // Check api
    const objKey = await ApiKeyService.findOneByKey({ key });

    if (!objKey) {
      return res.status(403).json({
        message: "Forbidden Error (wrong)",
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

export const authentication = asyncHandler(async (req, res, next) => {
  // 1. Check userId in req.headers
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    throw new ForbiddenRequestError("Forbidden Error: missing client id");
  }

  // 2. Check keyStore with userId
  const keyStore = await keyTokenService.findByUserId(userId);
  if (!keyStore) {
    throw new ForbiddenRequestError("Forbidden Error: client id not found");
  }

  // 3. Check accessToken missing
  const accessToken = req.headers[HEADER.AUTHORIZATION]?.replace("Bearer ", "");
  if (!accessToken) {
    throw new ForbiddenRequestError("Forbidden Error: missing access token");
  }

  // 4. Check accessToken valid
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId) {
      throw new ForbiddenRequestError("Forbidden Error: invalid access token");
    }

    req.keyStore = keyStore;
    next();
  } catch (error) {
    throw error;
  }
});
