import shopModel from "../models/shop.model.js";

class ShopService {
  async findOneByEmail({
    email,
    select = { email: 1, password: 1, status: 1, roles: 1 },
  }) {
    return await shopModel.findOne({ email }, select).lean();
  }

  async findOneById({
    id,
    select = { email: 1, password: 1, status: 1, roles: 1 },
  }) {
    return await shopModel.findOne({ _id: id }, select).lean();
  }
}

export default new ShopService();
