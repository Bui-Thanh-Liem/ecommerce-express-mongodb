import inventoryModel from "../inventory.model.js";

export class InventoryRepository {
  static async create({ shop, product, location, stock }) {
    return await inventoryModel.findOneAndUpdate(
      { shop, product },
      { $setOnInsert: { shop, product, location }, $inc: { stock } },
      { upsert: true, new: true }
    );
  }
}
