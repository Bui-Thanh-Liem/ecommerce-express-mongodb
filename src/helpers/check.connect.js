import mongoose from "mongoose";
import os from "os";

const _SECOND = 15000;

// count Connect
export function countConnection() {
  const numConnections = mongoose.connections.length;
  console.log("numConnections:::", numConnections);
  // to do ...
}

// check over load
export function checkOverload() {
  setInterval(() => {
    const numConnections = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;

    //

    console.log("numCores:::", numCores);
    console.log("numConnections:::", numConnections);
    console.log(`memoryUsage::: ${memoryUsage / 1024 / 1024} MB`);
  }, _SECOND); // monitor every 5 seconds
}
