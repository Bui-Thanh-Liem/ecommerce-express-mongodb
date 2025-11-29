import express from "express";
import CartController from "../../controllers/Cart.controller.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";

const router = express.Router();

router.post("/", asyncHandler(CartController.addToCart));
router.delete("/", asyncHandler(CartController.deleteProductItem));
router.post("/update", asyncHandler(CartController.update));
router.get("/", asyncHandler(CartController.listToCart));

export default router;
