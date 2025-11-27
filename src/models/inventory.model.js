import { model, Schema } from "mongoose";

//
const DOCUMENT_NAME = "inventory";
const COLLECTION_NAME = "inventories";

// Declare the Schema of the Mongo model
var inventorySchema = new Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "shop",
    },
    product: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "product",
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

// Create index
inventorySchema.index({ shop: 1, product: 1 });

// Export the model
const inventoryModel = model(DOCUMENT_NAME, inventorySchema);
export default inventoryModel;
