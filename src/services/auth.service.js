import * as crypto from "node:crypto";
import shopModel from "../models/shop.model";
import keyTokenService from "./keyToken.service";
import { createTokenPair } from "../auth/authUtil";

const ROLES = {
  SHOP: "SHOP",
  WRITE: "WRITE",
  SHOP: "SHOP",
  SHOP: "SHOP",
};

class AuthService {
  async signup({ name, email, password }) {
    try {
      // 1. check email exists
      const holderShop = await shopModel.findOne({ email }).lean();
      if (!holderShop)
        return {
          code: "xxx",
          message: "Shop already registered!",
          status: "error",
        };

      // 2. hash password
      const passwordHash = crypto.hash(password, 10);

      // 3. insert
      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [],
      });

      // 4. create key store
      if (!newShop) {
        // create privateKey, publicKey to sign jwt
        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
          modulesLength: 4096,
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

        return {code: "xxx", metadata: }
      }
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  }
}

export default new AuthService();
