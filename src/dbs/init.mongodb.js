import mongoose from "mongoose";
import config from "../config/config.env.js";

const connectString = `mongodb://${config.db.host}:${config.db.port}/${config.db.name}`;
console.log("connectString:::", connectString);

class Database {
  constructor() {
    this.connect();
  }

  // Connect
  connect() {
    mongoose
      .connect(connectString, {
        maxPoolSize: 50,
      })
      .then(() => console.log("Connected mongodb"))
      .catch((err) => console.log("Error Connect"));

    if (process.env.NODE_ENV === "development") {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();
export default instanceMongodb;
