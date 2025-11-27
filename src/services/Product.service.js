import { BadRequestError } from "../core/error.response.js";
import {
  ClothingModel,
  ElectronicModel,
  FurnitureModel,
  ProductModel,
} from "../models/product.model.js";
import { InventoryRepository } from "../models/repositories/inventory.repo.js";
import ProductRepository from "../models/repositories/product.repo.js";

// Registry mapping type → model con
const ProductTypeModel = {
  clothing: ClothingModel,
  electronic: ElectronicModel,
  furniture: FurnitureModel,
};

// Define base Product class
class Product {
  constructor(payload) {
    Object.assign(this, payload);
  }

  async createProduct(productSpecificId) {
    const productData = {
      _id: productSpecificId || undefined, // nếu có id từ subclass thì dùng, không thì tự sinh
      name: this.name,
      thumb: this.thumb,
      desc: this.desc,
      price: this.price,
      quantity: this.quantity,
      type: this.type,
      shop: this.shop,
      attributes: this.attributes, // reference đến document con
    };

    const newProduct = await ProductModel.create(productData);
    if (!newProduct) throw new BadRequestError("Create product failed");
    return newProduct;
  }
}

// Product Factory + Strategy để tạo sản phẩm cụ thể
class ProductService {
  static async createProduct({ type, payload }) {
    const productModel = ProductTypeModel[type];

    if (!productModel) {
      throw new BadRequestError(`Invalid product type: ${type}`);
    }

    // Tạo document con trước (Clothing/Electronic/Furniture)
    const newSpecificProduct = await productModel.create({
      ...payload.attributes,
      shop: payload.shop,
    });

    if (!newSpecificProduct) {
      throw new BadRequestError(`Create ${type.toLowerCase()} failed`);
    }

    // Tạo document Product chính, truyền _id của document con làm reference
    const product = new Product(payload);
    const newProduct = await product.createProduct(newSpecificProduct._id);

    // Sau khi tạo thành công thì cập nhật inventory
    if (newProduct) {
      await InventoryRepository.create({
        shop: payload.shop,
        location: "Viet Nam",
        product: newProduct._id,
        stock: newProduct.quantity,
      });
    }

    return newProduct;
  }

  static async updateProduct({ type, id, payload }) {
    // Nếu có attributes thì cập nhật trong cub-class nữa
    if (payload?.attributes) {
      const subProductModel = ProductTypeModel[type];

      if (!subProductModel) {
        throw new BadRequestError(`Invalid product type: ${type}`);
      }

      await ProductRepository.findOneAndUpdate({
        id,
        model: subProductModel,
        payload: payload.attributes,
      });
    }

    // Nếu có quantity thì cập nhật inventory
    if (payload?.quantity) {
    }

    // Cập nhật Product bình thường
    return await ProductRepository.findOneAndUpdate({
      id,
      model: ProductModel,
      payload: payload,
    });
  }

  static async findAllDraftForShop({ shopId, limit = 50, skip = 0 }) {
    return await ProductRepository.findAllDraftForShop({
      query: { shop: shopId, isDraft: true },
      limit,
      skip,
    });
  }

  static async findAllPublishedForShop({ shopId, limit = 50, skip = 0 }) {
    return await ProductRepository.findAllDraftForShop({
      query: { shop: shopId, isPublished: true },
      limit,
      skip,
    });
  }

  static async findAllProductsForUser({
    page = 1,
    limit = 50,
    sort = "ctime",
    filters = { isPublished: true },
    select = ["name", "price", "thumb", "shop", "type"],
  }) {
    return await ProductRepository.findAllProductsForUser({
      page,
      sort,
      limit,
      select,
      filters,
    });
  }

  static async findProductForUser({
    id,
    unSelect = ["__v", "createdAt", "updatedAt"],
  }) {
    return await ProductRepository.findProductForUser({
      id,
      unSelect,
    });
  }

  static async searchProductsByUser({ keySearch, limit = 50, skip = 0 }) {
    return await ProductRepository.searchProductsByUser({
      keySearch,
      limit,
      skip,
    });
  }

  static async publishProductByShop({ productId, shopId }) {
    return await ProductRepository.publishProductByShop({ productId, shopId });
  }

  static async unPublishProductByShop({ productId, shopId }) {
    return await ProductRepository.unPublishProductByShop({
      productId,
      shopId,
    });
  }
}

export default ProductService;
