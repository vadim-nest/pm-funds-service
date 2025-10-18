import type { Fund, Investment, Investor, Prisma } from "@prisma/client";

const toNumber = (v: Prisma.Decimal | number | string): number => {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  return v.toNumber(); // Prisma.Decimal
};

const yyyymmdd = (d: Date): string => d.toISOString().slice(0, 10);

export function serializeFund(row: Fund) {
  return {
    id: row.id,
    name: row.name,
    vintage_year: row.vintage_year,
    target_size_usd: toNumber(row.target_size_usd as unknown as Prisma.Decimal | number | string),
    status: row.status,
    created_at: row.created_at, // Fastify will JSON-serialize Date → ISO string
  };
}

export function serializeInvestor(row: Investor) {
  return {
    id: row.id,
    name: row.name,
    investor_type: row.investor_type,
    email: row.email,
    created_at: row.created_at,
  };
}

export function serializeInvestment(row: Investment) {
  return {
    id: row.id,
    investor_id: row.investor_id,
    fund_id: row.fund_id,
    amount_usd: toNumber(row.amount_usd as unknown as Prisma.Decimal | number | string),
    // Your schema wants YYYY-MM-DD; format it:
    investment_date: yyyymmdd(row.investment_date),
  };
}
