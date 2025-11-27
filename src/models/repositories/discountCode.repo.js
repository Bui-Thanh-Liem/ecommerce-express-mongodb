import { getSelectData, getUnSelectData } from "../../utils/index.js";
import discountCodeModel from "../discount.model.js";

export class DiscountCodeRepository {
  static async findOneByFilter(filter) {
    return await discountCodeModel.findOne(filter).lean();
  }

  static async findAllDiscountCodeUnSelect({
    page,
    limit,
    model,
    filters,
    unSelect,
    sort = "ctime",
  }) {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { createdAt: -1 } : { updatedAt: -1 };

    return await model
      .find(filters)
      .select(getUnSelectData(unSelect))
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }

  static async findAllDiscountCodeSelect({
    page,
    limit,
    model,
    filters,
    select,
    sort = "ctime",
  }) {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { createdAt: -1 } : { updatedAt: -1 };

    return await model
      .find(filters)
      .select(getSelectData(select))
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }
}
