import commentModel from "../models/comment.model.js";

class CommentService {
  /**
   * Add comment [user, shop]
   *
   * get a list [user, shop]
   *
   * delete comment [user, shop, admin]
   */

  async addToComment({ productionId, userId, content, parentId = null }) {
    const comment = new commentModel({
      userId,
      content,
      parentId,
      productionId,
    });

    // Nested set logic can be added here
    let rightValue = 0;
    if (parentId) {
      // Logic for nested comments (e.g., updating left/right values)
    } else {
      // Logic for top-level comments
      const maxRightComment = await commentModel
        .findOne({ productionId, parentId: null })
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
    return comment;
  }
}

export default new CommentService();
