/**
 * RedisClient: typed Redis client for stream/session management.
 *
 * This module exports both a singleton RedisClient for production and the
 * RedisClient class to inject a mocked client for testing.
 *
 * Behavior differs by NODE_ENV:
 * - In 'test', no real connection is opened and logging is suppressed.
 * - In other environments, connects to Redis and logs connection events.
 */

import Redis, { Redis as RedisInstance } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

interface RedisConfig {
  /**
   * Full connection string, e.g. redis://:password@hostname:6379/0
   */
  url?: string;
  /**
   * Redis host (default: 127.0.0.1)
   */
  host?: string;
  /**
   * Redis port (default: 6379)
   */
  port?: number;
  /**
   * Redis password, if any
   */
  password?: string;
}

// Build Redis connection options from environment variables
const config: RedisConfig = {
  url: process.env.REDIS_URL,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
  password: process.env.REDIS_PASSWORD,
};

// Instantiate Redis client only in non-test environments
let client: RedisInstance;
if (process.env.NODE_ENV !== "test") {
  client = config.url
    ? new Redis(config.url)
    : new Redis({
        host: config.host || "127.0.0.1",
        port: config.port || 6379,
        password: config.password,
      });

  // Log connection success
  client.on("connect", () => {
    console.log(`✅ Connected to Redis at ${client.options.host}:${client.options.port}`);
  });

  // Log errors
  client.on("error", (err) => {
    console.error("❌ Redis error:", err);
  });
} else {
  // In test mode, use a placeholder; actual client will be injected by tests
  client = undefined as any;
}

/**
 * Typed Redis client for stream/session management.
 *
 * Use this class directly to inject a mock Redis instance in tests:
 *   const client = new RedisClient(new RedisMock());
 */
export class RedisClient {
  /**
   * Create a new RedisClient.
   * @param redis - a Redis instance (real or mock). Defaults to singleton client.
   */
  constructor(private readonly redis: RedisInstance = client) {}

  /**
   * Map employee ID to stream name in the 'streams' hash.
   * @param employeeId - unique identifier of the employee
   * @param streamName - name of the KVS stream
   */
  async setStream(employeeId: string, streamName: string): Promise<void> {
    await this.redis.hset("streams", employeeId, streamName);
  }

  /**
   * Retrieve the stream name for a given employee.
   * @param employeeId - unique identifier of the employee
   * @returns the stream name or null if not found
   */
  async getStream(employeeId: string): Promise<string | null> {
    return this.redis.hget("streams", employeeId);
  }

  /**
   * Mark an employee as online by adding to the 'onlineEmployees' set.
   * @param employeeId - unique identifier of the employee
   */
  async markOnline(employeeId: string): Promise<void> {
    await this.redis.sadd("onlineEmployees", employeeId);
  }

  /**
   * Mark an employee as offline by removing from the 'onlineEmployees' set.
   * @param employeeId - unique identifier of the employee
   */
  async markOffline(employeeId: string): Promise<void> {
    await this.redis.srem("onlineEmployees", employeeId);
  }

  /**
   * List all currently online employees.
   * @returns array of employee IDs
   */
  async listOnline(): Promise<string[]> {
    return this.redis.smembers("onlineEmployees");
  }
}

/**
 * Default singleton RedisClient instance for production usage.
 *
 * In tests, import the class and inject RedisMock instead.
 */
export const redisClient = new RedisClient();
