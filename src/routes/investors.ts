import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { InvestorCreateBody, toPrismaInvestorType } from "../lib/validation.js";
import { serializeInvestor } from "../lib/serializers.js";
import { InvestorSchema, InvestorArraySchema } from "../schemas/openapi.js";

export default async function investorsRoutes(app: FastifyInstance) {
  app.get(
    "/investors",
    {
      schema: {
        tags: ["Investors"],
        summary: "List all investors",
        response: { 200: InvestorArraySchema },
      },
    },
    async () => {
      const rows = await prisma.investor.findMany({ orderBy: { created_at: "asc" } });
      return rows.map(serializeInvestor);
    },
  );

  app.post<{ Body: unknown }>(
    "/investors",
    {
      schema: {
        tags: ["Investors"],
        summary: "Create a new investor",
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            investor_type: { type: "string", enum: ["Individual", "Institution", "Family Office"] },
            email: { type: "string", format: "email" },
          },
          required: ["name", "investor_type", "email"],
        },
        response: {
          201: InvestorSchema,
          409: { type: "object", properties: { error: { type: "object" } } },
        },
      },
    },
    async (req, reply) => {
      const body = InvestorCreateBody.parse(req.body);
      const created = await prisma.investor.create({
        data: {
          name: body.name,
          investor_type: toPrismaInvestorType(body.investor_type),
          email: body.email,
        },
      });
      reply.code(201);
      return serializeInvestor(created);
    },
  );
}
