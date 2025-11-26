import { model, Schema } from "mongoose";

//
const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

// Declare the Schema of the Mongo model
var inventorySchema = new Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shop",
    },
    product: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    location: {
      type: String,
      default: "unKnow",
    },
    stock: { type: Number, required: true },
    reservations: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

// Export the model
const inventoryModel = model(DOCUMENT_NAME, inventorySchema);
export default inventoryModel;
