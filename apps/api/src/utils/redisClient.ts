// apps/api/src/utils/redisClient.ts
import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const host = process.env.REDIS_HOST  || "127.0.0.1";
const port = Number(process.env.REDIS_PORT) || 6379;
const password = process.env.REDIS_PASSWORD || undefined;

export const redis = new Redis({ host, port, password });

redis.on("connect", () => {
  console.log(`✅ Connected to Redis at ${host}:${port}`);
});
redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});
