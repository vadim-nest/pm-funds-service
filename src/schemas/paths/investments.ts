import { InvestmentArraySchema, InvestmentSchema, ErrorSchema } from "../openapi.js";

const FUND_ID_EXAMPLE = "5aa17986-c7e4-4467-b2a1-abc4ee54583e";
const INVESTOR_ID_EXAMPLE = "4280e0d2-7b63-44b4-b389-0423979b437c";

// Params
export const FundIdParamsSchema = {
  type: "object",
  properties: {
    fund_id: { type: "string", format: "uuid", examples: [FUND_ID_EXAMPLE] },
  },
  required: ["fund_id"],
} as const;

// GET /funds/:fund_id/investments
export const ListInvestmentsForFundSchema = {
  operationId: "listInvestmentsForFund",
  tags: ["Investments"],
  summary: "List all investments for a fund",
  params: FundIdParamsSchema,
  response: {
    200: { description: "OK", ...InvestmentArraySchema },
    404: { description: "Fund not found", ...ErrorSchema },
  },
} as const;

// POST /funds/:fund_id/investments
export const CreateInvestmentForFundSchema = {
  operationId: "createInvestmentForFund",
  tags: ["Investments"],
  summary: "Create an investment for a fund",
  params: FundIdParamsSchema,
  body: {
    type: "object",
    required: ["investor_id", "amount_usd", "investment_date"],
    properties: {
      investor_id: { type: "string", format: "uuid", examples: [INVESTOR_ID_EXAMPLE] },
      amount_usd: { type: "number", examples: [75000000.0] },
      investment_date: {
        type: "string",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
        examples: ["2024-09-22"],
      },
    },
    examples: [
      {
        investor_id: INVESTOR_ID_EXAMPLE,
        amount_usd: 75000000.0,
        investment_date: "2024-09-22",
      },
    ],
  },
  response: {
    201: { description: "Created", ...InvestmentSchema },
    400: { description: "Bad request (UUID/date/amount)", ...ErrorSchema },
    404: { description: "Fund or investor not found", ...ErrorSchema },
  },
} as const;
