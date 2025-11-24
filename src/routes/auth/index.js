import express from "express";
import authController from "../../controllers/auth.controller.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";
import { authentication } from "../../auth/checkAuth.js";

const router = express.Router();

router.post("/signup", asyncHandler(authController.signup));

router.post("/login", asyncHandler(authController.login));

router.use(authentication);

router.post("/logout", asyncHandler(authController.logout));

export default router;
