import { model, Schema } from "mongoose";

//
const DOCUMENT_NAME = "order";
const COLLECTION_NAME = "orders";

// Declare the Schema of the Mongo model
var orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    checkout: {
      type: Object,
      required: true,
    },
    /**
      totalPrice: 0, // Tổng tiền hàng
      feeShip: 0, // Phí vận chuyển
      totalDiscount: 0, // Tổng tiền giảm giá
      totalCheckout: 0, // Tổng tiền thanh toán
     */
    shipping: {
      type: Object,
      required: true,
    },
    /**
      street, 
      city, 
      state:, 
      country, 
     */
    payment: {
      type: Object,
      required: true,
    },
    products: {
      type: Array,
      default: [],
    },
    trackingNumber: {
      type: String,
      unique: true,
      default: "#" + Date.now(),
    },
    status: {
      type: String,
      enum: [
        "waiting_for_confirmation",
        "confirmed",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      default: "waiting_for_confirmation",
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

// Export the model
const orderModel = model(DOCUMENT_NAME, orderSchema);
export default orderModel;
