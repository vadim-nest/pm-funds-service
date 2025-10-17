import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { FundIdParamAsFund, InvestmentCreateBody } from "../lib/validation.js";
import { HttpError } from "../lib/error.js";
import { serializeInvestment } from "../lib/serializers.js";

export default async function investmentsRoutes(app: FastifyInstance) {
  // List all investments for a fund
  app.get<{
    Params: { fund_id: string };
  }>("/funds/:fund_id/investments", async (req) => {
    const params = FundIdParamAsFund.parse(req.params);

    // Ensure fund exists (404 if not)
    const fund = await prisma.fund.findUnique({ where: { id: params.fund_id } });
    if (!fund) throw new HttpError(404, "NOT_FOUND", "Fund not found");

    const rows = await prisma.investment.findMany({
      where: { fund_id: params.fund_id },
      orderBy: { investment_date: "asc" },
    });
    return rows.map(serializeInvestment);
  });

  // Create investment for a fund
  app.post<{
    Params: { fund_id: string };
    Body: unknown;
  }>("/funds/:fund_id/investments", async (req, reply) => {
    const params = FundIdParamAsFund.parse(req.params);
    const body = InvestmentCreateBody.parse(req.body);

    // Ensure fund exists
    const fund = await prisma.fund.findUnique({ where: { id: params.fund_id } });
    if (!fund) throw new HttpError(404, "NOT_FOUND", "Fund not found");

    // Ensure investor exists
    const investor = await prisma.investor.findUnique({ where: { id: body.investor_id } });
    if (!investor) throw new HttpError(404, "NOT_FOUND", "Investor not found");

    const created = await prisma.investment.create({
      data: {
        fund_id: params.fund_id,
        investor_id: body.investor_id,
        amount_usd: body.amount_usd.toFixed(2),
        investment_date: new Date(body.investment_date),
      },
    });

    reply.code(201);
    return serializeInvestment(created);
  });
}
