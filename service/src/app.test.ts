import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "./app";
import { createStore } from "./store";

describe("flag routes", () => {
  it("GET /flags returns the seeded flags", async () => {
    const res = await request(createApp()).get("/flags");
    expect(res.status).toBe(200);
    expect(res.body.map((f: { key: string }) => f.key)).toContain("new-checkout");
  });

  it("GET /flags/:key returns 404 for an unknown flag", async () => {
    const res = await request(createApp()).get("/flags/nope");
    expect(res.status).toBe(404);
  });

  it("PUT /flags/:key toggles a flag", async () => {
    const res = await request(createApp(createStore()))
      .put("/flags/new-checkout")
      .send({ enabled: true });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ key: "new-checkout", enabled: true });
  });
});
