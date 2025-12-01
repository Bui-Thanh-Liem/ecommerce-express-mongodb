import { CreatedResponse, OkResponse } from "../core/success.response.js";
import CommentService from "../services/Comment.service.js";

class CommentController {
  //
  async addToComment(req, res, next) {
    new CreatedResponse({
      message: "Create new Comment success",
      metadata: await CommentService.addToComment(req.body),
    }).send(res);
  }

  //
  async getCommentsByParentId(req, res, next) {
    new OkResponse({
      message: "Get comments by parent ID success",
      metadata: await CommentService.getCommentsByParentId(req.query),
    }).send(res);
  }

  //
  async deleteCommentById(req, res, next) {
    new OkResponse({
      message: "Delete comment by ID success",
      metadata: await CommentService.deleteCommentById(req.query),
    }).send(res);
  }
}

export default new CommentController();
