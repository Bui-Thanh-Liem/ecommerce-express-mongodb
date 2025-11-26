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

// not found
app.use((req, res, next) => {
  return res.status(404).json({
    code: 404,
    message: "Not Found!",
  });
});

// handling error
app.use((err, req, res, next) => {
  //
  const isDev = process.env.NODE_ENV === "development";

  //
  const stack = err.stack || "";
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  //
  return res.status(status).json({
    message,
    code: status,
    status: "error",
    stack: isDev ? stack : undefined,
  });
});

export default app;
