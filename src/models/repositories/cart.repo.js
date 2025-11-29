import cartModel from "../cart.model.js";

export class CartRepository {
  static async findOneById(id) {
    return await cartModel.findOne({ _id: id, state: "active" });
  }
}
