import * as bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import * as crypto from "node:crypto";
import { createTokenPair } from "../auth/authUtil.js";
import {
  BadRequestError,
  ConflictRequestError,
  ForbiddenRequestError,
} from "../core/error.response.js";
import shopModel from "../models/shop.model.js";
import { getInfoData } from "../utils/index.js";
import keyTokenService from "./KeyToken.service.js";
import ShopService from "./Shop.service.js";

const ROLES = {
  SHOP: "SHOP",
  WRITE: "WRITE",
};

class AuthService {
  async signup({ email, password }) {
    // 1. check email exists
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) throw new ConflictRequestError("Shop already registered!");

    // 2. hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. insert
    const newShop = await shopModel.create({
      email,
      password: passwordHash,
      roles: [ROLES.WRITE],
    });

    // 4. create key store
    if (newShop) {
      // create privateKey, publicKey to sign jwt
      const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      });

      // Create token pair
      const tokens = await createTokenPair({
        payload: { userId: newShop._id },
        privateKey,
      });

      // Save publicKey to keystore
      const publicKeyString = await keyTokenService.create({
        publicKey,
        privateKey,
        userid: newShop._id,
        refreshToken: tokens.refreshToken,
      });

      if (!publicKeyString) {
        throw new BadRequestError("publicKeyString error");
      }

      return {
        shop: getInfoData({
          obj: newShop,
          fields: ["_id", "email", "roles"],
        }),
        tokens,
      };
    }
  }

  async login({ email, password }) {
    // 1. check email exists
    const foundShop = await ShopService.findOneByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered!");

    // 2. check password
    const match = await bcrypt.compare(password, foundShop.password);
    if (!match) throw new BadRequestError("Authentication failed!");

    // 3. create token pair
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    // Create token pair
    const tokens = await createTokenPair({
      payload: { userId: foundShop._id },
      privateKey,
    });

    const publicKeyString = await keyTokenService.create({
      publicKey,
      privateKey,
      userid: foundShop._id,
      refreshToken: tokens.refreshToken,
    });

    if (!publicKeyString) {
      throw new BadRequestError("publicKeyString error");
    }

    return {
      shop: getInfoData({
        obj: foundShop,
        fields: ["_id", "email", "roles"],
      }),
      tokens,
    };
  }

  async refreshToken({ refreshToken }) {
    // 1. check refreshToken used
    const foundTokenUsed = await keyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    if (foundTokenUsed) {
      //
      const decodeUser = JWT.verify(refreshToken, foundTokenUsed.publicKey);
      console.log({ userId: decodeUser.userId }); // Đưa vào danh sách bất thường (tại sao lại lấy refreshToken đã dùng)

      //
      await keyTokenService.removeByUserId(decodeUser.userId);

      //
      throw new ForbiddenRequestError(
        "Something wrong happen. Please login again."
      );
    }

    // 2. check refreshToken valid
    const holderToken = await keyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) {
      throw new ForbiddenRequestError("Shop not registered!");
    }

    // 3. verify refreshToken
    const decodeUser = JWT.verify(refreshToken, holderToken.publicKey);
    const foundShop = await ShopService.findOneById({ id: decodeUser.userId });
    if (!foundShop) {
      throw new ForbiddenRequestError("Shop not registered!");
    }

    // 4. create new token pair
    const tokens = await createTokenPair({
      payload: { userId: foundShop._id },
      privateKey: holderToken.privateKey,
    });

    // 5. update refreshToken in key store
    await keyTokenService.updateRefreshTokenUsed({
      userId: foundShop._id,
      refreshTokenUsed: refreshToken, // add to list used
      refreshToken: tokens.refreshToken, // replace with new one
    });

    return {
      shop: getInfoData({ fields: ["_id", "email", "roles"], obj: foundShop }),
      tokens,
    };
  }

  async logout({ keyStore }) {
    return await keyTokenService.removeById({ keyStore });
  }
}

export default new AuthService();
