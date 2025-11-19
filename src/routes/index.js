import express from "express";
import routeShop from "./auth/index.js";

const router = express.Router();

router.use("/shop", routeShop);

export default router;
