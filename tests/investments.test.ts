import request from "supertest";
import { startTestServer, stopTestServer } from "./helpers/server.js";

let base: string;
let app: any;

beforeAll(async () => {
  app = await startTestServer();
  const address = app.server.address();
  base = `http://127.0.0.1:${typeof address === "object" ? address.port : 0}`;
});

afterAll(async () => {
  if (app) await stopTestServer(app);
});

describe("Investments", () => {
  it("GET /funds/:fund_id/investments lists investments", async () => {
    const funds = await request(base).get("/funds");
    const fundId = funds.body[0].id;

    const res = await request(base).get(`/funds/${fundId}/investments`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /funds/:fund_id/investments creates an investment (201)", async () => {
    // ensure an investor
    const inv = await request(base).post("/investors").send({
      name: "Test Inv",
      investor_type: "Family Office",
      email: "test.inv@example.com",
    });
    const investorId = inv.body.id;

    const funds = await request(base).get("/funds");
    const fundId = funds.body[0].id;

    const res = await request(base)
      .post(`/funds/${fundId}/investments`)
      .send({ investor_id: investorId, amount_usd: 42.5, investment_date: "2025-02-01" });

    expect(res.status).toBe(201);
    expect(res.body.amount_usd).toBe(42.5);
  });

  it("404 when fund not found /investments", async () => {
    const res = await request(base)
      .post(`/funds/550e8400-e29b-41d4-a716-446655440999/investments`)
      .send({
        investor_id: "550e8400-e29b-41d4-a716-446655440000",
        amount_usd: 1,
        investment_date: "2025-01-01",
      });
    expect(res.status).toBe(404);
  });

  it("404 when investor not found", async () => {
    const funds = await request(base).get("/funds");
    const fundId = funds.body[0].id;

    const res = await request(base)
      .post(`/funds/${fundId}/investments`)
      .send({
        investor_id: "550e8400-e29b-41d4-a716-446655440999",
        amount_usd: 1,
        investment_date: "2025-01-01",
      });
    expect(res.status).toBe(404);
  });

  it("400 invalid uuid or negative amount", async () => {
    const funds = await request(base).get("/funds");
    const fundId = funds.body[0].id;

    const badUuid = await request(base)
      .post(`/funds/not-a-uuid/investments`)
      .send({ investor_id: "not-a-uuid", amount_usd: 1, investment_date: "2025-01-01" });
    expect(badUuid.status).toBe(400);

    const inv = await request(base).post("/investors").send({
      name: "Neg Inv",
      investor_type: "Institution",
      email: "neg.inv@example.com",
    });

    const neg = await request(base)
      .post(`/funds/${fundId}/investments`)
      .send({ investor_id: inv.body.id, amount_usd: -5, investment_date: "2025-01-01" });
    expect(neg.status).toBe(400);
  });
});
