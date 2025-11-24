import * as bcrypt from "bcrypt";
import * as crypto from "node:crypto";
import { createTokenPair } from "../auth/authUtil.js";
import {
  BadRequestError,
  ConflictRequestError,
} from "../core/error.response.js";
import shopModel from "../models/shop.model.js";
import { getInfoData } from "../utils/index.js";
import keyTokenService from "./keyToken.service.js";

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

      const publicKeyString = await keyTokenService.create({
        userid: newShop._id,
        publicKey,
      });

      if (!publicKeyString) {
        throw new BadRequestError("publicKeyString error");
      }

      // Create token pair
      const tokens = await createTokenPair({
        payload: { userId: newShop._id },
        publicKey: publicKeyString,
        privateKey,
      });

      return {
        code: "xxx",
        metadata: {
          shop: getInfoData({
            obj: newShop,
            fields: ["_id", "email", "roles"],
          }),
          tokens,
        },
      };
    }
  }
}

export default new AuthService();
