import express from "express";
import routeShop from "./auth/index.js";
import { checkApiKey, checkPermission } from "../auth/checkAuth.js";

const router = express.Router();

// Check apiKey
router.use(checkApiKey);

// Check permission
router.use(checkPermission("0000"));

//
router.use("/shop", routeShop);

export default router;
