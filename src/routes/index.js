import express from "express";
import { checkApiKey, checkPermission } from "../auth/checkAuth.js";
import apiKeyController from "../controllers/apiKey.controller.js";
import routeShop from "./auth/index.js";
import productShop from "./product/index.js";

const router = express.Router();

// Only admin create api key (testing)
router.post("/api-keys", apiKeyController.create);

// Check apiKey
router.use(checkApiKey);

// Check permission
router.use(checkPermission("0000"));

//
router.use("/shop", routeShop);
router.use("/product", productShop);

export default router;
