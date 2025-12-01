import { model, Schema } from "mongoose";

//
const DOCUMENT_NAME = "comment";
const COLLECTION_NAME = "comments";

// Declare the Schema of the Mongo model
var commentSchema = new Schema(
  {
    productionId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "product",
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    content: {
      type: String,
      required: true,
    },
    left: {
      type: Number,
      default: 0,
    },
    right: {
      type: Number,
      default: 0,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "comment",
      default: null,
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

// Export the model
const commentModel = model(DOCUMENT_NAME, commentSchema);
export default commentModel;
