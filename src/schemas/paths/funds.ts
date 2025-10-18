import { ErrorSchema, FundArraySchema, FundSchema } from "../openapi.js";

// ---------- Params & request bodies (path-level only) ----------
export const FundIdParams = {
  type: "object",
  properties: {
    id: {
      type: "string",
      format: "uuid",
      examples: ["234975db-472b-42fb-ae45-d07a65405fa0"],
    },
  },
  required: ["id"],
} as const;

export const FundCreateBodySchema = {
  type: "object",
  required: ["name", "vintage_year", "target_size_usd", "status"],
  properties: {
    name: { type: "string", examples: ["Titanbay Growth Fund VII"] },
    vintage_year: { type: "integer", examples: [2025] },
    target_size_usd: { type: "number", examples: [500000000.0] },
    status: {
      type: "string",
      enum: ["Fundraising", "Investing", "Closed"],
      examples: ["Fundraising"],
    },
  },
  examples: [
    {
      name: "Titanbay Growth Fund VII",
      vintage_year: 2025,
      target_size_usd: 500000000.0,
      status: "Fundraising",
    },
  ],
} as const;

export const FundUpdateBodySchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      format: "uuid",
      examples: ["234975db-472b-42fb-ae45-d07a65405fa0"],
    },
    name: { type: "string", examples: ["Titanbay Growth Fund I"] },
    vintage_year: { type: "integer", examples: [2024] },
    target_size_usd: { type: "number", examples: [300000000.0] },
    status: {
      type: "string",
      enum: ["Fundraising", "Investing", "Closed"],
      examples: ["Investing"],
    },
  },
  required: ["id", "name", "vintage_year", "target_size_usd", "status"],
  examples: [
    {
      id: "234975db-472b-42fb-ae45-d07a65405fa0",
      name: "Titanbay Growth Fund I",
      vintage_year: 2021,
      target_size_usd: 400000000.0,
      status: "Closed",
    },
  ],
} as const;

// ---------- Operation schemas ----------
export const ListFundsSchema = {
  operationId: "listFunds",
  tags: ["Funds"],
  summary: "List all funds",
  response: {
    200: { description: "OK", ...FundArraySchema },
  },
} as const;

export const GetFundByIdSchema = {
  operationId: "getFundById",
  tags: ["Funds"],
  summary: "Get a fund by id",
  params: FundIdParams,
  response: {
    200: { description: "OK", ...FundSchema },
    404: { description: "Not found", ...ErrorSchema },
  },
} as const;

export const CreateFundSchema = {
  operationId: "createFund",
  tags: ["Funds"],
  summary: "Create a fund",
  body: FundCreateBodySchema,
  response: {
    201: { description: "Created", ...FundSchema },
    400: { description: "Bad request", ...ErrorSchema },
    409: { description: "Conflict (e.g., duplicate name)", ...ErrorSchema },
  },
} as const;

export const UpdateFundSchema = {
  operationId: "updateFund",
  tags: ["Funds"],
  summary: "Update a fund (id in body)",
  body: FundUpdateBodySchema,
  response: {
    200: { description: "OK", ...FundSchema },
    400: { description: "Bad request", ...ErrorSchema },
    404: { description: "Not found", ...ErrorSchema },
    409: { description: "Conflict", ...ErrorSchema },
  },
} as const;
