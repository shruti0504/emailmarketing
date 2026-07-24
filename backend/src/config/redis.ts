import { Redis } from "ioredis";
import { env } from "./env.js";

const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
    })
  : new Redis({
      host: "127.0.0.1",
      port: 6379,
      maxRetriesPerRequest: null,
    });

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (error) => {
  console.log("❌ Redis error", error);
});

export default redis;