import express from "express";
import routeShop from "./auth/index.js";
import { checkApiKey, checkPermission } from "../auth/checkAuth.js";
import apiKeyController from "../controllers/apiKey.controller.js";

const router = express.Router();

// Only admin create api key (testing)
router.post("/api-keys", apiKeyController.create);

// Check apiKey
router.use(checkApiKey);

// Check permission
router.use(checkPermission("0000"));

//
router.use("/shop", routeShop);

export default router;
