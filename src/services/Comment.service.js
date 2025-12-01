import { sendDiscordLog } from "../libs/discord/sendLogFromApp.js";
import commentModel from "../models/comment.model.js";
import { ProductModel } from "../models/product.model.js";

class CommentService {
  /**
   * Add comment [user, shop]
   *
   * get a list [user, shop]
   *
   * delete comment [user, shop, admin]
   */

  async addToComment({ productId, userId, content, parentId = null }) {
    const comment = new commentModel({
      userId,
      content,
      parentId,
      productId,
    });

    // Nested set logic can be added here
    let rightValue = 0;
    if (parentId) {
      // Logic for nested comments (e.g., updating left/right values)
      console.log({ productId, userId, content, parentId });

      //
      const parentComment = await commentModel.findById(parentId);
      if (!parentComment) throw new Error("Parent comment not found");

      // temporary right value
      rightValue = parentComment.right;

      // Update right values of existing comments
      await commentModel.updateMany(
        { productId, right: { $gte: rightValue } }, // R của cha và các R lớn hơn
        { $inc: { right: 2 } }
      );

      // Update left values of existing comments
      await commentModel.updateMany(
        { productId, left: { $gt: rightValue } }, // L nào > R của cha (R ở A sẽ tới L của B)
        { $inc: { left: 2 } }
      );
    } else {
      // Logic for top-level comments
      const maxRightComment = await commentModel
        .findOne({ productId, parentId: null })
        .sort("-right")
        .exec();

      if (maxRightComment) {
        rightValue = maxRightComment.right + 1;
      } else {
        rightValue = 1;
      }
    }

    //
    comment.left = rightValue;
    comment.right = rightValue + 1;

    await comment.save();

    //
    // sendDiscordLog(comment);

    return comment;
  }

  async getCommentsByParentId({
    productId,
    parentId = null,
    limit = 50,
    skip = 0,
  }) {
    //
    if (parentId) {
      const parentComment = await commentModel.findById(parentId);
      if (!parentComment) throw new Error("Parent comment not found");

      const comments = await commentModel
        .find({
          productId,
          left: { $gt: parentComment.left },
          right: { $lt: parentComment.right },
        })
        .select({ content: 1, right: 1, left: 1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return comments;
    }

    const comments = await commentModel
      .find({
        productId,
        parentId: null,
      })
      .select({ content: 1, right: 1, left: 1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return comments;
  }

  async deleteCommentById({ commentId, productId }) {
    //
    const foundProduct = await ProductModel.findById(productId);
    if (!foundProduct) throw new Error("Product not found");

    //
    const comment = await commentModel.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    //
    const leftValue = comment.left;
    const rightValue = comment.right;

    // Tính width
    const width = rightValue - leftValue + 1;

    // Xóa comment và các con của nó
    await commentModel.deleteMany({
      productId,
      left: { $gte: leftValue, $lte: rightValue },
    });

    // Cập nhật lại left và right của các comment còn lại
    await commentModel.updateMany(
      {
        productId,
        left: { $gt: rightValue },
      },
      {
        $inc: { left: -width },
      }
    );

    await commentModel.updateMany(
      {
        productId,
        right: { $gt: rightValue },
      },
      {
        $inc: { right: -width },
      }
    );

    return true;
  }
}

export default new CommentService();
