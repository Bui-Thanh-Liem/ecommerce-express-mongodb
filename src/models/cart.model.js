import { model, Schema } from "mongoose";

//
const DOCUMENT_NAME = "cart";
const COLLECTION_NAME = "carts";

// Declare the Schema of the Mongo model
var cartSchema = new Schema(
  {
    state: {
      type: String,
      enum: ["active", "completed", "failed", "pending"],
      default: "active",
    },
    products: {
      type: Array,
      default: [],
    },
    countProducts: {
      type: Number,
      default: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

cartSchema.pre("save", function (next) {
  // this.products có thể là array
  this.countProducts = this.products.length;
  next();
});

cartSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  // Nếu có update products
  if (update.products || update.$set?.products) {
    const products = update.products || update.$set.products;

    if (Array.isArray(products)) {
      // Cập nhật lại countProducts
      this.set({ countProducts: products.length });
    }
  }

  next();
});

// Export the model
const cartModel = model(DOCUMENT_NAME, cartSchema);
export default cartModel;
