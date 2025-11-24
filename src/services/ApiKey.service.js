import * as crypto from "crypto";
import apiKeyModel from "../models/apiKey.model.js";
class ApiKeyService {
  async create() {
    // Random key
    const randomKey = crypto.randomBytes(32).toString("hex");

    // Save key
    const newObjKey = await apiKeyModel.create({
      key: randomKey,
      permissions: ["0000"],
    });

    return newObjKey ? newObjKey : null;
  }

  async findOneByKey({ key }) {
    // await this.create();
    const objKey = await apiKeyModel.findOne({ key, status: true }).lean();
    return objKey;
  }
}

export default new ApiKeyService();
