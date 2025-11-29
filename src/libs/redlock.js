import Redis from "ioredis";
import Redlock from "redlock";
import config from "../config/config.env.js";

// 1) Kết nối tới Redis (1 node hoặc mảng nodes)
const redis1 = new Redis({ host: config.redis.host, port: config.redis.port });
// nếu có nhiều node:
// const redis2 = new Redis(...); const redis3 = new Redis(...);

export const redlock = new Redlock(
  // list Redis clients
  [redis1 /*, redis2, redis3 */],
  {
    // tùy chỉnh
    retryCount: 10, // số lần thử khi không lấy được lock
    retryDelay: 300, // ms giữa các lần thử
    retryJitter: 50, // jitter để tránh stampede
    // automaticExtensionThreshold: ??? (tùy version) - dùng manual extend nếu cần
  }
);

// B đang giữ lock
// A vào tài nguyên B đang làm
// redlock thử 10 lần giành khoá , mỗi lần delay 300ms
// Tôi đa A phải đợi 3s nếu TTL B === max
