import {
  BadRequestError,
  ConflictRequestError,
} from "../core/error.response.js";
import discountCodeModel from "../models/discount.model.js";
import { DiscountCodeRepository } from "../models/repositories/discountCode.repo.js";
import ProductRepository from "../models/repositories/product.repo.js";

class DiscountCodeService {
  // Create discount code
  async createDiscountCode({
    code,
    shop,
    name,
    desc,
    type,
    value,
    endDate,
    maxUses,
    isActive,
    usesCount,
    usersUsed,
    startDate,
    appliesTo,
    productIds,
    minOrderValue,
    maxUsesPerUser,
  }) {
    // Kiểm tra thời gian
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today < start || today > end) {
      throw new BadRequestError("Discount code has expired!");
    }

    if (start >= end) {
      throw new BadRequestError("Discount code has expired!");
    }

    // check tồn tại
    const foundDiscount = await DiscountCodeRepository.findOneByFilter({
      code,
      shop,
    });

    //
    if (foundDiscount && foundDiscount.isActive) {
      throw new ConflictRequestError("Discount exists!");
    }

    //
    if (!["all", "specific"].includes(appliesTo) && appliesTo) {
      throw new BadRequestError(`AppliesTo invalid - ${appliesTo}`);
    }

    //
    if (appliesTo === "specific" && !productIds?.length) {
      throw new BadRequestError(
        `AppliesTo ${appliesTo} is required productIds`
      );
    }

    // Tạo discount
    return await discountCodeModel.create({
      code,
      shop,
      name,
      desc,
      type,
      value,
      startDate: start,
      endDate: end,
      maxUses,
      isActive,
      usesCount,
      usersUsed,
      appliesTo,
      productIds: appliesTo === "all" ? [] : productIds,
      minOrderValue,
      minOrderValue: minOrderValue ?? 0,
      maxUsesPerUser,
    });
  }

  // Get all products with discount code
  async getAllProductsWithDiscountCode({ code, shopId }) {
    // check tồn tại
    const foundDiscount = await this.checkExist({ shop: shopId, code });

    // Check appliesTo === 'all' or "specific"
    const { appliesTo, productIds } = foundDiscount;
    let products = [];
    if (appliesTo === "all") {
      // all => all products in shop
      products = await ProductRepository.findAllProductsForUser({
        filters: {
          shop: shopId,
          isPublished: true,
        },
        page: 1,
        limit: 50,
        sort: "ctime",
        select: ["name"],
      });
    }

    if (appliesTo === "specific") {
      // specific => productIds
      products = await ProductRepository.findAllProductsForUser({
        filters: {
          _id: { $in: [productIds] },
          isPublished: true,
        },
        page: 1,
        limit: 50,
        sort: "ctime",
        select: ["name"],
      });
      console.log("products:::", products);
    }

    return products;
  }

  // Get all discount code of shop
  async getAllDiscountCodeByShop({ shopId }) {
    return await DiscountCodeRepository.findAllDiscountCodeSelect({
      page: 1,
      limit: 50,
      filters: { shop: shopId },
      model: discountCodeModel,
      select: ["name", "code", "value"],
    });
  }

  // Get discount amount
  async getDiscountAmount({ code, userId, shopId, products }) {
    // check tồn tại
    const foundDiscount = await this.checkExist({ shop: shopId, code });

    //
    const {
      type,
      value,
      endDate,
      maxUses,
      isActive,
      startDate,
      usersUsed,
      minOrderValue,
      maxUsesPerUser,
    } = foundDiscount;

    //
    if (!isActive) throw new ConflictRequestError("Discount expired!");

    // = 0 là hết mã rồi
    if (!maxUses) throw new ConflictRequestError("Discount are out!");

    // Kiểm tra thời gian
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today < start || today > end) {
      throw new BadRequestError("Discount code has expired!");
    }

    // Kiểm tra giá trị tôi thiểu của giỏ hàng (đê đủ điều kiên sử dụng)
    let totalOrder = 0;
    if (!minOrderValue) {
      //
      totalOrder = products.reduce((acc, val) => {
        return acc + val.quantity * val.price;
      }, 0);

      //
      if (totalOrder < minOrderValue) {
        throw new BadRequestError(
          `Discount requires a minium order value of ${minOrderValue}`
        );
      }
    }

    // Kiểm tra xem discount này sử dụng tối đa bao nhiêu lần trên một user
    if (!maxUsesPerUser) {
      const userUsedDiscount = usersUsed.find((u) => u._id === userId);

      // Nếu user này đã sử dụng rồi thì kiêm tra thêm xem maxUsesPerUser
      if (userUsedDiscount) {
        console.log("maxUsesPerUser :::", maxUsesPerUser);
        console.log("userUsedDiscount :::", userUsedDiscount);
      }
    }

    const amount = type === "fixed_amount" ? value : totalOrder * (value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  // Delete discount
  async deleteDiscount(shop, code) {
    // Kiểm tra tồn tại, rồi kiểm tra cho sử dụng ở đâu không, có ràng buộc gì không trước khi xoá
    const foundDiscount = await this.checkExist({ shop, code });
    if (foundDiscount) {
      console.log("Kiểm tra ràng buộc trước khi xoá");
    }

    // Xoá
    return await discountCodeModel.findOneAndDelete({ shop, code });
  }

  async cancelDiscount({ userId }) {
    // Kiểm tra tồn tại
    const foundDiscount = await this.checkExist({ shop, code });

    //
    return await discountCodeModel.findByIdAndUpdate(
      { _id: foundDiscount._id },
      {
        $pull: {
          usersUsed: userId,
        },
        $inc: {
          maxUses: 1,
          usesCount: -1,
        },
      }
    );
  }

  // PRIVATE
  async checkExist({ shop, code }) {
    // check tồn tại
    const foundDiscount = await DiscountCodeRepository.findOneByFilter({
      code,
      shop,
    });

    //
    if (!foundDiscount) {
      throw new ConflictRequestError("Discount doesn't exists!");
    }

    return foundDiscount;
  }
}

export default new DiscountCodeService();
