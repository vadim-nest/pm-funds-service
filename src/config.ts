export const config = {
  isProd: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  rate: {
    enabled: process.env.NODE_ENV !== "test",
    max: Number(process.env.RATE_LIMIT_MAX ?? "100"),
    window: process.env.RATE_LIMIT_WINDOW ?? "1 minute",
  },
} as const;
