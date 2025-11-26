import { CreatedResponse } from "../core/success.response.js";
import apiKeyService from "../services/apiKey.service.js";

class ApiKeyController {
  async create(req, res, next) {
    const objKey = await apiKeyService.create();
    new CreatedResponse({
      message: "API key created successfully",
      metadata: objKey,
    }).send(res);
  }
}

export default new ApiKeyController();
