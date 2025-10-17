import { z } from "zod";

// enums as per spec
export const FundStatus = z.enum(["Fundraising", "Investing", "Closed"]);
export const InvestorTypeInput = z.enum(["Individual", "Institution", "Family Office"]);

export const Uuid = z.string().uuid();

const Year = z.number().int().gte(1900).lte(2100);
const PositiveMoney = z.number().finite().positive();

// YYYY-MM-DD (with real date check)
export const YmdDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => {
    const d = new Date(s);
    return !Number.isNaN(d.getTime()) && s === d.toISOString().slice(0, 10);
  }, "Invalid date (expected YYYY-MM-DD)");

// ---- Body schemas ----
export const FundCreateBody = z.object({
  name: z.string().min(1),
  vintage_year: Year,
  target_size_usd: PositiveMoney,
  status: FundStatus,
});

export const FundUpdateBody = z.object({
  id: Uuid,
  name: z.string().min(1),
  vintage_year: Year,
  target_size_usd: PositiveMoney,
  status: FundStatus,
});

export const InvestorCreateBody = z.object({
  name: z.string().min(1),
  investor_type: InvestorTypeInput,
  email: z.string().email(),
});

export const InvestmentCreateBody = z.object({
  investor_id: Uuid,
  amount_usd: PositiveMoney,
  investment_date: YmdDate,
});

// ---- Param schemas ----
export const FundIdParam = z.object({ id: Uuid });
export const FundIdParamAsFund = z.object({ fund_id: Uuid });

// ---- Helpers to map incoming strings to Prisma enums ----
export function toPrismaInvestorType(s: z.infer<typeof InvestorTypeInput>) {
  return s === "Family Office" ? "Family_Office" : s;
}
