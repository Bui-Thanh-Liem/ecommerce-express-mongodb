import { sendDiscordLog } from "../libs/discord/sendLogFromApp.js";
import commentModel from "../models/comment.model.js";

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
    sendDiscordLog(comment);

    return comment;
  }
}

export default new CommentService();
