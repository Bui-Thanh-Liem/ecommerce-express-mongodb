import express from "express";
import { authentication } from "../../auth/checkAuth.js";
import authController from "../../controllers/Auth.controller.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";

const router = express.Router();

// Public routes
router.post("/signup", asyncHandler(authController.signup));
router.post("/login", asyncHandler(authController.login));

// Protected routes
router.use(authentication);

// Private routes
router.post("/refresh-token", asyncHandler(authController.refreshToken));
router.post("/logout", asyncHandler(authController.logout));

export default router;
