import keyTokenModel from "../models/keyToken.model.js";

class KeyTokenService {
  async create({ userid, publicKey, refreshToken }) {
    try {
      const filter = { user: userid };
      const update = {
        publicKey: publicKey.toString(),
        refreshToken,
        refreshTokenUsed: [],
      };
      const options = { upsert: true, new: true, returnDocument: "after" };

      const tokens = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  }

  async findByUserId(userId) {
    return await keyTokenModel.findOne({ user: userId }).lean();
  }

  async remove({ keyStore }) {
    return await keyTokenModel.deleteOne({ _id: keyStore._id });
  }
}

export default new KeyTokenService();
