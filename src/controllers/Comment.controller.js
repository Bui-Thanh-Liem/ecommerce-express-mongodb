import { CreatedResponse } from "../core/success.response.js";
import CommentService from "../services/Comment.service.js";

class CommentController {
  //
  async addToComment(req, res, next) {
    new CreatedResponse({
      message: "Create new Comment success",
      metadata: await CommentService.addToComment(req.body),
    }).send(res);
  }
}

export default new CommentController();
