import express from "express";
import CommentController from "../../controllers/Comment.controller.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";

const router = express.Router();

router.post("/", asyncHandler(CommentController.addToComment));

export default router;
