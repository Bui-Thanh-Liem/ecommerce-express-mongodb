import { model, Schema } from "mongoose";

//
const DOCUMENT_NAME = "key";
const COLLECTION_NAME = "keys";

// Declare the Schema of the Mongo model
var keyTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "shop",
    },
    publicKey: {
      type: String,
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    refreshTokenUsed: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

// Export the model
const keyTokenModel = model(DOCUMENT_NAME, keyTokenSchema);
export default keyTokenModel;
