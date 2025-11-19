import app from "./src/app.js";
import configEnv from "./src/config/config.env.js";

const PORT = configEnv.app.port;

const server = app.listen(PORT, () => {
  console.log(`WSV eCommerce start with port ${PORT}`);
});

process.on("SIGINT", () => {
  server.close(() => console.log("Exit server Express"));
});
