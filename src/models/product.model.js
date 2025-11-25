import { model, Schema } from "mongoose";

//
const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

// Declare the Schema of the Mongo model
var ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
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
      type: Number,
      required: true,
      enum: ["Electronics", "clothing", "Furniture"],
    },
    shop: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
    attributes: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

const ClothingSchema = new Schema(
  {
    size: String,
    material: String,
    brand: { type: String, required: true },
  },
  { collection: "Clothing", timestamps: true }
);

const ElectronicSchema = new Schema(
  {
    material: { type: String, required: true },
    manufacturer: { type: String, required: true },
    color: String,
  },
  { collection: "Electronics", timestamps: true }
);

// Export the model
const ProductModel = model(DOCUMENT_NAME, ProductSchema);
export default ProductModel;
