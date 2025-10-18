export const ErrorSchema = {
  $id: "ErrorSchema",
  type: "object",
  properties: {
    error: {
      type: "object",
      properties: {
        type: { type: "string", examples: ["VALIDATION_ERROR", "CONFLICT", "NOT_FOUND"] },
        message: {
          type: "string",
          examples: ["Invalid request", "Resource already exists", "Not found"],
        },
        details: { type: "array", items: { type: "object" } }, // optional
      },
      required: ["type", "message"],
    },
  },
  required: ["error"],
} as const;

// ---------- Fund entity (response shape) ----------
export const FundSchema = {
  $id: "FundSchema",
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    vintage_year: { type: "integer" },
    target_size_usd: { type: "number" },
    status: { type: "string", enum: ["Fundraising", "Investing", "Closed"] },
    created_at: { type: "string", format: "date-time" },
  },
  required: ["id", "name", "vintage_year", "target_size_usd", "status", "created_at"],
} as const;

export const InvestorSchema = {
  $id: "InvestorSchema",
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    investor_type: { type: "string", enum: ["Individual", "Institution", "Family Office"] },
    email: { type: "string", format: "email" },
    created_at: { type: "string", format: "date-time" },
  },
  required: ["id", "name", "investor_type", "email", "created_at"],
  additionalProperties: false,
} as const;

export const InvestmentSchema = {
  $id: "InvestmentSchema",
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    investor_id: { type: "string", format: "uuid" },
    fund_id: { type: "string", format: "uuid" },
    amount_usd: { type: "number" },
    investment_date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
  },
  required: ["id", "investor_id", "fund_id", "amount_usd", "investment_date"],
  additionalProperties: false,
} as const;

// Common responses
export const FundArraySchema = {
  $id: "FundArraySchema",
  type: "array",
  items: { $ref: "FundSchema#" },
} as const;

export const InvestorArraySchema = {
  $id: "InvestorArraySchema",
  type: "array",
  items: { $ref: "InvestorSchema#" },
} as const;

export const InvestmentArraySchema = {
  $id: "InvestmentArraySchema",
  type: "array",
  items: { $ref: "InvestmentSchema#" },
} as const;
