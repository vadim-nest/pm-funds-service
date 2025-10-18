import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { InvestorCreateBody, toPrismaInvestorType } from "../lib/validation.js";
import { serializeInvestor } from "../lib/serializers.js";
import { ListInvestorsSchema, CreateInvestorSchema } from "../schemas/paths/investors.js";

export default async function investorsRoutes(app: FastifyInstance) {
  app.get("/investors", { schema: ListInvestorsSchema }, async () => {
    const rows = await prisma.investor.findMany({ orderBy: { created_at: "asc" } });
    return rows.map(serializeInvestor);
  });

  app.post<{ Body: unknown }>(
    "/investors",
    { schema: CreateInvestorSchema },
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
