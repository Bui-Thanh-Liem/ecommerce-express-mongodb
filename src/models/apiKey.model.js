import { model, Schema } from "mongoose";

//
const DOCUMENT_NAME = "apiKey";
const COLLECTION_NAME = "apiKeys";

// Declare the Schema of the Mongo model
var apiKeySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      require: true,
      default: ["0000", "0001", "0002"],
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

// Export the model
const apiKeyModel = model(DOCUMENT_NAME, apiKeySchema);
export default apiKeyModel;
