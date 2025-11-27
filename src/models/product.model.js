import { model, Schema } from "mongoose";
import { toSlug } from "../utils/index.js";

//
const DOCUMENT_NAME = "product";
const COLLECTION_NAME = "products";

// Declare the Schema of the Mongo model
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    thumb: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["electronic", "clothing", "furniture"],
    },
    shop: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "shop",
    },
    attributes: { type: Schema.Types.Mixed, required: true },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10, // 4.6666 => 47 => 4.7
    },
    variations: {
      type: [String],
      default: [],
    },
    isDraft: { type: Boolean, default: true, index: true, select: false },
    isPublished: { type: Boolean, default: false, index: true, select: false },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

// Create text index for search
productSchema.index({ name: "text", description: "text" });

// Add slug field before saving
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = toSlug(this.name);
  }
  next();
});

// Define Clothing Schema
const clothingSchema = new Schema(
  {
    shop: { type: Schema.Types.ObjectId, required: true, ref: "shop" },
    size: String,
    material: String,
    brand: { type: String, required: true },
  },
  { collection: "clothing", timestamps: true }
);

// Define Electronic Schema
const electronicSchema = new Schema(
  {
    shop: { type: Schema.Types.ObjectId, required: true, ref: "shop" },
    material: { type: String, required: true },
    manufacturer: { type: String, required: true },
    color: String,
  },
  { collection: "electronics", timestamps: true }
);

// Define Furniture Schema
const furnitureSchema = new Schema(
  {
    shop: { type: Schema.Types.ObjectId, required: true, ref: "shop" },
    material: { type: String, required: true },
    dimensions: String,
    weight: Number,
  },
  { collection: "furniture", timestamps: true }
);

// Export the model
export const ProductModel = model(DOCUMENT_NAME, productSchema);
export const ClothingModel = model("clothing", clothingSchema);
export const FurnitureModel = model("furniture", furnitureSchema);
export const ElectronicModel = model("electronic", electronicSchema);
