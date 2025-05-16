// apps/api/tests/integration/streams.int.test.ts

import request from "supertest";
import app from "../src/app";
import config from "../src/config";

describe("Streams E2E flow", () => {
  let token: string;
  let employeeId: string;

  beforeAll(async () => {
    // 1) Login as a test user
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "barahona0498@gmail.com", password: "MyStr0ngP@ssword!@1234" })
      .expect(200);
    token = res.body.accessToken;
    // extract sub from token or hardcode testuser ID
    employeeId = "testuser"; 
  });

  it("should register, list, unregister, and no longer list", async () => {
    // 2) Register (punch in)
    await request(app)
      .post("/streams/register")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("streamArn");
      });

    // 3) List online: should contain our user
    await request(app)
      .get("/streams/online")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .then((res) => {
        const ids = res.body.map((s: any) => s.employeeId);
        expect(ids).toContain(employeeId);
      });

    // 4) Unregister (punch out)
    await request(app)
      .post("/streams/unregister")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .then((res) => {
        expect(res.body.success).toBe(true);
      });

    // 5) List online again: should NOT contain our user
    await request(app)
      .get("/streams/online")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .then((res) => {
        const ids = res.body.map((s: any) => s.employeeId);
        expect(ids).not.toContain(employeeId);
      });
  });
});
