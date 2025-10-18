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

describe("Investors", () => {
  it("GET /investors returns seeded investors", async () => {
    const res = await request(base).get("/investors");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /investors creates (201) and 409 on duplicate email", async () => {
    const body = { name: "Dup", investor_type: "Individual", email: "dup@example.com" };
    const ok = await request(base).post("/investors").send(body);
    expect(ok.status).toBe(201);

    const dup = await request(base).post("/investors").send(body);
    expect(dup.status).toBe(409);
  });
});
