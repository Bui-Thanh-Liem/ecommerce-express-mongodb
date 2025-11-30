class InventoryService {
  async reservationInventory({ productId, quantity, cartId }) {
    const query = { product: productId, stock: { $gte: quantity } };
    const updateSet = {
      $inc: {
        stock: -quantity,
      },
      $push: {
        reservations: {
          cartId,
          quantity,
          productId,
          createOn: new Date(),
        },
      },
    };
    const options = { upset: true, new: true };

    return await inventoryModel.updateOne(query, updateSet, options);
  }

  async rollbackInventory({ productId, cartId, quantity }) {
    const updateSet = {
      $inc: { stock: quantity },
      $pull: {
        reservations: {
          cartId,
          quantity,
          productId,
        },
      },
    };

    return await inventoryModel.updateOne({ productId }, updateSet, {
      new: true,
    });
  }
}

export default new InventoryService();
