import apiKeyModel from "../models/apiKey.model";

class ApiKeyService {
  async create({ key }) {
    try {
      const publicKeyString = publicKey.toString();

      const tokens = await apiKeyModel.create({
        key,
      });

      return tokens ? publicKeyString : null;
    } catch (error) {
      return error;
    }
  }
}

export default new ApiKeyService();
