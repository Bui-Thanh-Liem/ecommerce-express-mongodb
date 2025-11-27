import cartModel from "../models/cart.model";

class CartService {
  //
  async createUserCart({ userId, product }) {
    const query = { userId, state: "active" };
    const updateOrInsert = {
      $addToSet: {
        products: [product],
      },
    };
    const option = { upset: true, new: true };

    return await cartModel.findOneAndUpdate(query, updateOrInsert, option);
  }

  //
  async updateUserCartQuantity({ userId, product }) {
    const query = { userId, state: "active" };
    const updateOrInsert = {
      $addToSet: {
        products: [product],
      },
    };
    const option = { upset: true, new: true };

    return await cartModel.findOneAndUpdate(query, updateOrInsert, option);
  }

  //
  async addToCart({ userId, product }) {
    // Kiểm tra cart đã được tạo hay chưa ?
    const userCart = await cartModel.findOne({ userId });
    if (!userCart) {
      // Nếu chưa có thì tạo cart
      return await this.createUserCart({ product, userId });
    }

    // Nếu có cart rồi mà products = [] thì thêm product vào thôi
    if (userCart.countProducts === 0) {
      userCart.products = [product];
      return await userCart.save();
    }

    // Nếu có cart rồi mà products = [] thì thêm product vào thôi
  }
}

export default new CartService({ user });
