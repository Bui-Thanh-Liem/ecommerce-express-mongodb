import express from "express";
import CommentController from "../../controllers/Comment.controller.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";

const router = express.Router();

router.post("/", asyncHandler(CommentController.addToComment));

router.get("/", asyncHandler(CommentController.getCommentsByParentId));

router.delete("/", asyncHandler(CommentController.deleteCommentById));

export default router;
