import keyTokenModel from "../models/keyToken.model.js";

class KeyTokenService {
  async create({ userid, publicKey, privateKey, refreshToken }) {
    try {
      const filter = { user: userid };
      const update = {
        publicKey: publicKey.toString(),
        privateKey: privateKey.toString(),
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

  async updateRefreshTokenUsed({ userId, refreshTokenUsed, refreshToken }) {
    console.log({ userId, refreshTokenUsed, refreshToken });

    return await keyTokenModel.updateOne(
      { user: userId },
      {
        $addToSet: { refreshTokenUsed },
        $set: { refreshToken },
      }
    );
  }

  async findByUserId(userId) {
    return await keyTokenModel.findOne({ user: userId }).lean();
  }

  async findByRefreshTokenUsed(refreshToken) {
    return await keyTokenModel
      .findOne({ refreshTokenUsed: refreshToken })
      .lean();
  }

  async findByRefreshToken(refreshToken) {
    return await keyTokenModel.findOne({ refreshToken }).lean();
  }

  async removeById(id) {
    return await keyTokenModel.deleteOne({ _id: id });
  }

  async removeByUserId(userId) {
    return await keyTokenModel.deleteOne({ user: userId });
  }
}

export default new KeyTokenService();
