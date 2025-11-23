import * as bcrypt from "bcrypt";
import * as crypto from "node:crypto";
import shopModel from "../models/shop.model.js";
import keyTokenService from "./keyToken.service.js";
import { createTokenPair } from "../auth/authUtil.js";

const ROLES = {
  SHOP: "SHOP",
  WRITE: "WRITE",
};

class AuthService {
  async signup({ name, email, password }) {
    try {
      // 1. check email exists
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop)
        return {
          code: "xxx",
          message: "Shop already registered!",
          status: "error",
        };

      // 2. hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // 3. insert
      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [ROLES.WRITE],
      });

      // 4. create key store
      if (newShop) {
        // create privateKey, publicKey to sign jwt
        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
          modulusLength: 4096,
        });

        console.log({ privateKey, publicKey }); // save collections keyToken

        const publicKeyString = await keyTokenService.create({
          userid: newShop._id,
          publicKey,
        });

        if (!publicKeyString) {
          return {
            code: "xxx",
            message: "publicKeyString error",
            status: "error",
          };
        }

        const tokens = createTokenPair({
          payload: { userId: newShop._id },
          publicKey,
          privateKey,
        });

        return { code: "xxx", metadata: { user: newShop, tokens } };
      }
    } catch (error) {
      console.log("error:::", error);

      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  }
}

export default new AuthService();
