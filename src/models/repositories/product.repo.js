import { Types } from "mongoose";
import {
  getSelectData,
  getUnSelectData,
  removeFalsyObj,
  stringToObjectId,
  updateNestedObjParser,
} from "../../utils/index.js";
import { ProductModel } from "../product.model.js";

class ProductRepository {
  //
  static async findOneAndUpdate({ id, payload, model, isNew = true }) {
    //
    const nested = updateNestedObjParser(removeFalsyObj(payload));

    return await model.findByIdAndUpdate(id, nested, {
      new: isNew,
    });
  }

  //
  static async findAllDraftForShop({ query, limit, skip }) {
    return await this.queryProducts({ query, limit, skip });
  }

  //
  static async findAllPublishedForShop({ query, limit, skip }) {
    return await this.queryProducts({ query, limit, skip });
  }

  //
  static async queryProducts({ query, limit, skip }) {
    return await ProductModel.find(query)
      .populate("shop", "name email _id")
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();
  }

  //
  static async searchProductsByUser({ keySearch, limit, skip }) {
    const regexSearch = new RegExp(keySearch, "i");
    return await ProductModel.find(
      { $text: { $search: regexSearch }, isPublished: true },
      { score: { $meta: "textScore" } } // project score field
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();
  }

  //
  static async publishProductByShop({ productId, shopId }) {
    return await this.togglePublishProduct({
      productId,
      shopId,
      publish: true,
    });
  }

  //
  static async unPublishProductByShop({ productId, shopId }) {
    return await this.togglePublishProduct({
      productId,
      shopId,
      publish: false,
    });
  }

  //
  static async togglePublishProduct({ productId, shopId, publish }) {
    const foundProduct = await ProductModel.findOne({
      _id: stringToObjectId(productId),
      shop: shopId,
    });

    if (!foundProduct) return null;

    foundProduct.isDraft = !publish;
    foundProduct.isPublished = publish;

    return await foundProduct.save();
  }

  //
  static async findAllProductsForUser({ page, limit, sort, filters, select }) {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { createdAt: -1 } : { updatedAt: -1 };

    return await ProductModel.find(filters)
      .select(getSelectData(select))
      .populate("shop", "name email _id")
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  //
  static async findOneById({ id, select = ["name"] }) {
    return await ProductModel.findOne({ _id: id, isPublished: true })
      .select(getSelectData(select))
      .lean()
      .exec();
  }

  //
  static async findProductForUser({ id, unSelect }) {
    return await ProductModel.findOne({ _id: id, isPublished: true })
      .select(getUnSelectData(unSelect))
      .populate("shop", "name email _id")
      .lean()
      .exec();
  }
}

export default ProductRepository;
