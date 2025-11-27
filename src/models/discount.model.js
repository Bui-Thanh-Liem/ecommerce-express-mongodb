import { model, Schema } from "mongoose";

//
const DOCUMENT_NAME = "discount";
const COLLECTION_NAME = "discounts";

// Declare the Schema of the Mongo model
var discountCodeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "fixed_amount",
      enum: ["fixed_amount", "percentage"],
    },
    value: {
      type: Number, // 10_000 || 8%
      required: true,
    },
    code: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxUses: {
      type: Number, // Số lượng discount được áp dụng
      required: true,
    },
    usesCount: {
      type: Number, // Số lượng discount đã được sử dụng
      default: 0,
    },
    usersUsed: {
      type: Array, // Ai đã sử dụng
      default: [],
    },
    maxUsesPerUser: {
      type: Number, // Số lượng tối đa cho phép được 1 user sử dụng
      default: 0,
    },
    minOrderValue: {
      type: Number, // Giá trị tối thiểu để có thể app dụng
      required: true,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "shop",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    appliesTo: {
      type: String,
      default: "all",
      enum: ["all", "specific"],
    },
    productIds: {
      type: Array, // Sản phẩm nào được áp dụng
      default: [],
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

// Export the model
const discountCodeModel = model(DOCUMENT_NAME, discountCodeSchema);
export default discountCodeModel;
