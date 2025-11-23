import keyTokenModel from "../models/keyToken.model.js";

class KeyTokenService {
  async create({ userid, publicKey }) {
    try {
      const publicKeyString = publicKey.toString();
      console.log("publicKey:::", publicKey);
      console.log("publicKeyString:::", publicKeyString);

      const tokens = await keyTokenModel.create({
        user: userid,
        publicKey: publicKeyString,
      });

      return tokens ? publicKeyString : null;
    } catch (error) {
      return error;
    }
  }
}

export default new KeyTokenService();
