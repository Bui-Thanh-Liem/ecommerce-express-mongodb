import express from "express";
import { authentication } from "../../auth/checkAuth.js";
import ProductController from "../../controllers/Product.controller.js";
import { asyncHandler } from "../../helpers/asyncHandler.js";

const router = express.Router();

/**
 * @desc Search products by user
 * @route GET /search/:q
 * @query {number} skip
 * @query {number} limit
 * @params {string} q
 */
router.get("/search/:q", asyncHandler(ProductController.searchProductsByUser));

/**
 * @desc Get product by user
 * @route GET /:id
 */
router.get("/:id", asyncHandler(ProductController.findProductForUser));

/**
 * @desc Get all published products for users
 * @route GET /
 * @query {number} skip
 * @query {number} limit
 */
router.get("/", asyncHandler(ProductController.findAllProductsForUser));

// =================== Protected routes ===================
router.use(authentication);

/**
 * @desc Create new product
 * @route POST /
 * @body {string} name
 * @body {string} thumb
 * @body {string} desc
 * @body {number} price
 * @body {number} quantity
 * @body {string} type - Clothing | Electronic | Furniture
 * @body {object} attributes - specific attributes based on product type
 */
router.post("/", asyncHandler(ProductController.create));

/**
 * @desc Update a product
 * @route PATCH /:id
 * @body {string} name
 * @body {string} thumb
 * @body {string} desc
 * @body {number} price
 * @body {number} quantity
 * @body {string} type - Clothing | Electronic | Furniture
 * @body {object} attributes - specific attributes based on product type
 */
router.patch("/:id", asyncHandler(ProductController.update));

/**
 * @desc Publish product for shop
 * @route POST /publish/:id
 * @params {string} id

 */
router.post(
  "/publish/:id",
  asyncHandler(ProductController.publishProductByShop)
);

/**
 * @desc UnPublish product for shop
 * @route POST /unpublish/:id
 * @params {string} id

 */
router.post(
  "/unpublish/:id",
  asyncHandler(ProductController.unPublishProductByShop)
);

/**
 * @desc Get all draft products for a shop
 * @route GET /drafts/all
 * @query {number} skip
 * @query {number} limit
 */
router.get("/drafts/all", asyncHandler(ProductController.findAllDraftForShop));

/**
 * @desc Get all published products for a shop
 * @route GET /published/all
 * @query {number} skip
 * @query {number} limit
 */
router.get(
  "/published/all",
  asyncHandler(ProductController.findAllPublishedForShop)
);

export default router;
