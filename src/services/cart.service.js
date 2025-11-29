import { NotFoundError } from "../core/error.response.js";
import cartModel from "../models/cart.model.js";
import ProductRepository from "../models/repositories/product.repo.js";
import { stringToObjectId } from "../utils/index.js";

class CartService {
  //
  async createUserCart({ userId, product }) {
    //
    const query = { userId, state: "active" };
    const updateOrInsert = {
      $addToSet: {
        products: product,
      },
    };
    const option = { upsert: true, new: true };

    //
    return await cartModel.findOneAndUpdate(query, updateOrInsert, option);
  }

  //
  async updateUserCartQuantity({ userId, product }) {
    const { _id, quantity } = product;

    //
    const updated = await cartModel.updateOne(
      { userId, state: "active", "products._id": _id },
      { $inc: { "products.$.quantity": quantity } }
    );

    //
    if (updated.modifiedCount === 0) {
      return await cartModel.updateOne(
        { userId, state: "active" },
        { $push: { products: product } }
      );
    }

    return updated;
  }

  //
  async getListUserCart({ userId }) {
    return cartModel.findOne({ userId }).lean();
  }

  //
  async addToCart({ userId, product }) {
    // Kiểm tra cart đã được tạo hay chưa ?
    const userCart = await cartModel.findOne({ userId });

    // Kiểm tra sản phẩm
    const { _id: productId, quantity } = product;
    const foundProd = await ProductRepository.findOneById({
      id: productId,
      select: ["_id", "name", "price", "thumb", "shop"],
    });
    if (!foundProd) throw new NotFoundError("Product not exists!");

    if (!userCart) {
      // Nếu chưa có thì tạo cart
      return await this.createUserCart({
        product: { ...foundProd, quantity },
        userId,
      });
    }

    // Nếu có cart rồi mà products = [] thì thêm product vào thôi
    if (userCart.countProducts === 0) {
      userCart.products = [{ ...foundProd, quantity }];
      return await userCart.save();
    }

    // Nếu giỏ hàng tồn tại, và có sản phẩm này thì cập nhật quantity thôi
    return await this.updateUserCartQuantity({
      userId,
      product: { ...foundProd, quantity },
    });
  }

  // Cập nhật giỏ hàng
  /**
   *
   * @body {object} shopOrderIds // [{shopId, itemProducts:[quantity, price, shopId, oldQuantity, productId], version}]
   */
  async addToCartV2({ userId, shopOrderIds }) {
    // overview
    const { productId, oldQuantity, quantity } =
      shopOrderIds[0]?.itemProducts[0];

    // Check product
    const foundProduct = await ProductRepository.findOneById({
      id: productId,
      select: ["_id", "name", "price", "thumb", "shop"],
    });
    if (!foundProduct) throw new NotFoundError("Product not exists!");

    // Check shopId
    if (foundProduct.shop.toString() !== shopOrderIds[0]?.shopId) {
      throw new NotFoundError("Product don't belong to the shop!");
    }

    // Nếu client gửi lên products.quantity = 0 thì xoá product ra khỏi giỏ hàng
    if (quantity === 0) {
      console.log("delete :::", userId, productId);
      return await this.deleteProductItem({ userId, productId });
    }

    //
    return await this.updateUserCartQuantity({
      userId,
      product: {
        _id: stringToObjectId(productId),
        quantity: quantity - oldQuantity,
      },
    });
  }

  //
  async deleteProductItem({ userId, productId }) {
    const query = { userId, state: "active" };
    const updateSet = {
      $pull: {
        products: { _id: stringToObjectId(productId) },
      },
    };

    return await cartModel.updateOne(query, updateSet);
  }
}

export default new CartService();
