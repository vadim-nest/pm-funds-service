import { InvestorArraySchema, InvestorSchema, ErrorSchema } from "../openapi.js";

export const ListInvestorsSchema = {
  operationId: "listInvestors",
  tags: ["Investors"],
  summary: "List all investors",
  response: {
    200: { description: "OK", ...InvestorArraySchema },
  },
} as const;

export const CreateInvestorSchema = {
  operationId: "createInvestor",
  tags: ["Investors"],
  summary: "Create a new investor",
  body: {
    type: "object",
    required: ["name", "investor_type", "email"],
    properties: {
      name: { type: "string", examples: ["Horizon Ridge Family Office"] },
      investor_type: {
        type: "string",
        enum: ["Individual", "Institution", "Family Office"],
        examples: ["Family Office"],
      },
      // use a reserved TLD to avoid clashing with real domains
      email: { type: "string", format: "email", examples: ["ops@horizonridge.example"] },
    },
    examples: [
      {
        name: "Horizon Ridge Family Office",
        investor_type: "Family Office",
        email: "ops@horizonridge.example",
      },
    ],
  },
  response: {
    201: {
      description: "Created",
      ...InvestorSchema,
      examples: [
        {
          id: "a1f8b4da-6b11-4c77-9f26-5d8d1a3a9c52",
          name: "Horizon Ridge Family Office",
          investor_type: "Family Office",
          email: "ops@horizonridge.example",
          created_at: "2024-10-01T12:00:00Z",
        },
      ],
    },
    400: { description: "Bad request", ...ErrorSchema },
    409: { description: "Conflict (duplicate email)", ...ErrorSchema },
  },
} as const;
