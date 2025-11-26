import { CreatedResponse, OkResponse } from "../core/success.response.js";
import ProductFactory from "../services/Product.service.js";

class ProductController {
  async create(req, res, next) {
    const newProduct = await ProductFactory.createProduct({
      type: req.body.type,
      payload: {
        ...req.body,
        shop: req.keyStore.user,
      },
    });

    new CreatedResponse({
      message: "Product created successfully",
      metadata: newProduct,
    }).send(res);
  }

  async update(req, res, next) {
    const updated = await ProductFactory.updateProduct({
      id: req.params.id,
      type: req.body.type,
      payload: {
        ...req.body,
        shop: req.keyStore.user,
      },
    });

    new OkResponse({
      message: "Product updated successfully",
      metadata: updated,
    }).send(res);
  }

  async publishProductByShop(req, res, next) {
    const { id: productId } = req.params;

    const result = await ProductFactory.publishProductByShop({
      productId,
      shopId: req.keyStore.user,
    });

    new OkResponse({
      message: "Product published successfully",
      metadata: result,
    }).send(res);
  }

  async unPublishProductByShop(req, res, next) {
    const { id: productId } = req.params;

    const result = await ProductFactory.unPublishProductByShop({
      productId,
      shopId: req.keyStore.user,
    });

    new OkResponse({
      message: "Product unpublished successfully",
      metadata: result,
    }).send(res);
  }

  async searchProductsByUser(req, res, next) {
    const keySearch = req.params.q;

    const products = await ProductFactory.searchProductsByUser({
      keySearch,
    });

    new OkResponse({
      message: "Search products successfully",
      metadata: products,
    }).send(res);
  }

  async findAllDraftForShop(req, res, next) {
    const products = await ProductFactory.findAllDraftForShop({
      shopId: req.keyStore.user,
    });
    new OkResponse({
      message: "Get draft products for shop successfully",
      metadata: products,
    }).send(res);
  }

  async findAllPublishedForShop(req, res, next) {
    const products = await ProductFactory.findAllPublishedForShop({
      shopId: req.keyStore.user,
    });
    new OkResponse({
      message: "Get published products for shop successfully",
      metadata: products,
    }).send(res);
  }

  async findAllProductsForUser(req, res, next) {
    const { page, limit } = req.query;
    const products = await ProductFactory.findAllProductsForUser({
      limit,
      page,
    });
    new OkResponse({
      message: "Get products for user successfully",
      metadata: products,
    }).send(res);
  }

  async findProductForUser(req, res, next) {
    const product = await ProductFactory.findProductForUser({
      id: req.params.id,
    });
    new OkResponse({
      message: "Get product for user successfully",
      metadata: product,
    }).send(res);
  }
}

export default new ProductController();
