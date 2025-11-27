import express from "express";
import { checkApiKey, checkPermission } from "../auth/checkAuth.js";
import apiKeyController from "../controllers/ApiKey.controller.js";
import routeShop from "./auth/index.js";
import routeProduct from "./product/index.js";
import routeDiscount from "./discount/index.js";

const router = express.Router();

// Only admin create api key (testing)
router.post("/api-keys", apiKeyController.create);

// Check apiKey
router.use(checkApiKey);

// Check permission
router.use(checkPermission("0000"));

//
router.use("/shop", routeShop);
router.use("/product", routeProduct);
router.use("/discount", routeDiscount);

export default router;
