import inventoryModel from "../inventory.model.js";

export class InventoryRepository {
  static async create({ shop, product, location, stock }) {
    return await inventoryModel.findOneAndUpdate(
      { shop, product },
      { $setOnInsert: { shop, product, location }, $inc: { stock } },
      { upsert: true, new: true }
    );
  }

  static async reservationInventory({ productId, quantity, cartId }) {
    const query = { product: productId, stock: { $gte: quantity } };
    const updateSet = {
      $inc: {
        stock: -quantity,
      },
      $push: {
        reservations: {
          cartId,
          quantity,
          createOn: new Date(),
        },
      },
    };
    const options = { upset: true, new: true };

    return await inventoryModel.findOneAndUpdate(query, updateSet, options);
  }
}
