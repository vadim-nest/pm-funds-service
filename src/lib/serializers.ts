import type { Fund, Investor, Investment } from "@prisma/client";

// Convert Prisma Decimal to JS number safely
const dec = (v: any): number => (typeof v === "number" ? v : Number(v?.toString?.() ?? v));

// ISO date-time with Z, date (YYYY-MM-DD)
const iso = (d: Date) => d.toISOString();
const ymd = (d: Date) => iso(d).split("T")[0];

export function serializeFund(row: Fund) {
  return {
    id: row.id,
    name: row.name,
    vintage_year: row.vintage_year,
    target_size_usd: dec(row.target_size_usd),
    status: row.status, // 'Fundraising' | 'Investing' | 'Closed'
    created_at: iso(row.created_at),
  };
}

export function serializeInvestor(row: Investor) {
  return {
    id: row.id,
    name: row.name,
    investor_type: row.investor_type === "Family_Office" ? "Family Office" : row.investor_type,
    email: row.email,
    created_at: iso(row.created_at),
  };
}

export function serializeInvestment(row: Investment) {
  return {
    id: row.id,
    investor_id: row.investor_id,
    fund_id: row.fund_id,
    amount_usd: dec(row.amount_usd),
    investment_date: ymd(row.investment_date),
  };
}
