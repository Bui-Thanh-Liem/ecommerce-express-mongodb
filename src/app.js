import compression from "compression";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import "./dbs/init.mongodb.js";
import { checkOverload, countConnection } from "./helpers/check.connect.js";
import router from "./routes/index.js";

const app = express();

// init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// init db
countConnection();
checkOverload();

// init routers
app.use("/api/v1", router);

// handling error

export default app;
