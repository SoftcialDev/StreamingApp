import { RedisClient } from "./client";
import RedisMock from "ioredis-mock";

describe("RedisClient", () => {
  let client: RedisClient;

  beforeAll(() => {
    // inject the mock instance
    client = new RedisClient(new RedisMock());
  });

  it("should set and get a stream mapping", async () => {
    await client.setStream("emp1", "stream-emp1");
    const name = await client.getStream("emp1");
    expect(name).toBe("stream-emp1");
  });

  it("should manage onlineEmployees set", async () => {
    await client.markOnline("emp2");
    let list = await client.listOnline();
    expect(list).toContain("emp2");

    await client.markOffline("emp2");
    list = await client.listOnline();
    expect(list).not.toContain("emp2");
  });
});
