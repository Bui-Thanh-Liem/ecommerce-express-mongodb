import express from "express";
import { authentication } from "../../auth/checkAuth.js";
import DiscountController from "../../controllers/Discount.controller.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";

const router = express.Router();

router.post("/amount", asyncHandler(DiscountController.getDiscountAmount));

router.get(
  "/list-product-code",
  asyncHandler(DiscountController.getAllProductsWithDiscountCode)
);

// =================== Protected routes ===================
router.use(authentication);

/**
 * @desc Create new Discount code
 * @route POST /
 * @body {string} code
 * @body {string} shop
 * @body {string} desc
 * @body {string} type
 * @body {number} value
 * @body {string} endDate
 * @body {number} maxUses
 * @body {string} isActive
 * @body {number} usesCount
 * @body {number} usersUsed
 * @body {string} startDate
 * @body {string} appliesTo
 * @body {string} productIds
 * @body {string} minOrderValue
 * @body {string} minOrderValue
 * @body {string} maxUsesPerUser
 */
router.post("/", asyncHandler(DiscountController.createDiscountCode));

/**
 * @desc Get all discount code of shop
 * @route GET /shop/:id
 * @params {string} id
 * @body {string} shop
 * @body {string} desc
 */
router.get("/shop", asyncHandler(DiscountController.getAllDiscountCodeByShop));

export default router;
