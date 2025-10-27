import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma.js";
import { Uuid } from "../lib/validation.js";

function allocateManagementFees(
    totalFeeAmount: number,
    investments: Array<{ investor_id: string; investor_name: string; amount: number }>
): Array<{ investor_id: string; investor_name: string; fee: number; percentage: number }> {
    return [];
}

export default function analyticsRoutes(app: FastifyInstance) {
    app.get<{ Params: { fund_id: string } }>(
        "/funds/:fund_id/analytics",
        async (req: FastifyRequest<{ Params: { fund_id: string } }>, reply: FastifyReply) => {
            const fundId = Uuid.parse(req.params.fund_id);

            const fund = await prisma.fund.findUnique({ where: { id: fundId } });
            if (!fund) {
                reply.code(404).send({ error: "Fund not found" });
                return;
            }

            const investments = await prisma.investment.findMany({
                where: { fund_id: fundId },
            });

            const investorsData = [];
            for (const investment of investments) {
                const investor = await prisma.investor.findUnique({
                    where: { id: investment.investor_id },
                });
                if (investor) {
                    investorsData.push({
                        investor_id: investor.id,
                        investor_name: investor.name,
                        investor_type: investor.investor_type,
                        amount: Number(investment.amount_usd),
                    });
                }
            }

            let totalRaised = 0;
            for (let i = 0; i < investorsData.length; i++) {
                totalRaised = totalRaised + investorsData[i].amount;
            }

            const utilizationPct = (totalRaised / Number(fund.target_size_usd)) * 100;

            const avgInvestment = totalRaised / investments.length;

            const byInvestor: Record<
                string,
                { investor_id: string; investor_name: string; total: number }
            > = {};
            for (const inv of investorsData) {
                if (!byInvestor[inv.investor_id]) {
                    byInvestor[inv.investor_id] = {
                        investor_id: inv.investor_id,
                        investor_name: inv.investor_name,
                        total: 0,
                    };
                }
                byInvestor[inv.investor_id].total += inv.amount;
            }

            const byType: Record<string, { count: number; total: number }> = {};
            investorsData.forEach((inv) => {
                const type = inv.investor_type;
                if (!byType[type]) {
                    byType[type] = { count: 0, total: 0 };
                }
                byType[type].count++;
                byType[type].total += inv.amount;
            });

            const uniqueInvestors = Object.keys(byInvestor).length;

            const topInvestorsList = Object.values(byInvestor)
                .sort((a, b) => b.total - a.total)
                .slice(0, 5);

            const topInvestors = topInvestorsList.map((inv, idx) => {
                const percentage = (inv.total / totalRaised) * 100;
                return {
                    investor_id: inv.investor_id,
                    investor_name: inv.investor_name,
                    total_invested: inv.total,
                    percentage: Math.round(percentage * 100) / 100,
                    rank: idx + 1,
                };
            });

            const byInvestorTypeResult: Record<
                string,
                { count: number; total: number; percentage: number }
            > = {};
            for (const type in byType) {
                byInvestorTypeResult[type] = {
                    count: byType[type].count,
                    total: byType[type].total,
                    percentage: Math.round((byType[type].total / totalRaised) * 100 * 100) / 100,
                };
            }

            const managementFeeRate = 0.02;
            const totalManagementFee = totalRaised * managementFeeRate;

            const investmentsForFees = topInvestorsList.map((inv) => ({
                investor_id: inv.investor_id,
                investor_name: inv.investor_name,
                amount: inv.total,
            }));

            const feeAllocations = allocateManagementFees(totalManagementFee, investmentsForFees);

            return {
                fund_id: fund.id,
                total_raised: totalRaised,
                target_size: Number(fund.target_size_usd),
                utilization_pct: Math.round(utilizationPct * 100) / 100,
                investor_count: uniqueInvestors,
                average_investment: Math.round(avgInvestment * 100) / 100,
                top_investors: topInvestors,
                by_investor_type: byInvestorTypeResult,
                fee_distribution: {
                    total_management_fee: Math.round(totalManagementFee * 100) / 100,
                    by_investor: feeAllocations,
                },
            };
        }
    );
}

