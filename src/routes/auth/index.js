import express from "express";
import authController from "../../controllers/auth.controller.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";

const router = express.Router();

router.post("/signup", asyncHandler(authController.signup));

export default router;
