import request from "supertest";
import { startTestServer, stopTestServer } from "./helpers/server.js";

let base: string;

describe("Funds", () => {
  let app: any;

  beforeAll(async () => {
    app = await startTestServer();
    const address = app.server.address();
    base = `http://127.0.0.1:${typeof address === "object" ? address.port : 0}`;
  });

  afterAll(async () => {
    if (app) await stopTestServer(app);
  });

  it("GET /funds returns seeded funds", async () => {
    const res = await request(base).get("/funds");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("created_at");
  });

  it("POST /funds creates a fund (201)", async () => {
    const res = await request(base).post("/funds").send({
      name: "Test Fund",
      vintage_year: 2025,
      target_size_usd: 1234.56,
      status: "Fundraising",
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Fund");
    expect(res.body.target_size_usd).toBe(1234.56);
  });

  it("PUT /funds updates a fund", async () => {
    // create first
    const created = await request(base)
      .post("/funds")
      .send({ name: "ToUpdate", vintage_year: 2024, target_size_usd: 100, status: "Investing" });
    const id = created.body.id;

    const upd = await request(base)
      .put("/funds")
      .send({ id, name: "Updated", vintage_year: 2024, target_size_usd: 200, status: "Closed" });

    expect(upd.status).toBe(200);
    expect(upd.body.name).toBe("Updated");
    expect(upd.body.status).toBe("Closed");
  });

  it("GET /funds/:id gets a fund or 404", async () => {
    const list = await request(base).get("/funds");
    const id = list.body[0].id;
    const ok = await request(base).get(`/funds/${id}`);
    expect(ok.status).toBe(200);

    const bad = await request(base).get(`/funds/550e8400-e29b-41d4-a716-446655440999`);
    expect(bad.status).toBe(404);
  });

  it("POST /funds 400 on bad body", async () => {
    const res = await request(base).post("/funds").send({ name: "", status: "Nope" });
    expect(res.status).toBe(400);
  });
});
