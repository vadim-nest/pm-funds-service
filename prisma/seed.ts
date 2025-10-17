import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Upsert Funds
  const fund1 = await prisma.fund.upsert({
    where: { name: "Titanbay Growth Fund I" },
    update: {},
    create: {
      name: "Titanbay Growth Fund I",
      vintage_year: 2024,
      target_size_usd: "250000000.00",
      status: "Fundraising",
    },
  });

  const fund2 = await prisma.fund.upsert({
    where: { name: "Titanbay Growth Fund II" },
    update: {},
    create: {
      name: "Titanbay Growth Fund II",
      vintage_year: 2025,
      target_size_usd: "500000000.00",
      status: "Investing",
    },
  });

  // Upsert Investors
  const inv1 = await prisma.investor.upsert({
    where: { email: "investments@gsam.com" },
    update: {},
    create: {
      name: "Goldman Sachs Asset Management",
      investor_type: "Institution",
      email: "investments@gsam.com",
    },
  });

  const inv2 = await prisma.investor.upsert({
    where: { email: "privateequity@calpers.ca.gov" },
    update: {},
    create: {
      name: "CalPERS",
      investor_type: "Institution",
      email: "privateequity@calpers.ca.gov",
    },
  });

  const inv3 = await prisma.investor.upsert({
    where: { email: "sophia.lee@example.com" },
    update: {},
    create: {
      name: "Sophia Lee",
      investor_type: "Individual",
      email: "sophia.lee@example.com",
    },
  });

  // Create some investments if none exist
  const existing = await prisma.investment.findFirst();
  if (!existing) {
    await prisma.investment.createMany({
      data: [
        {
          fund_id: fund1.id,
          investor_id: inv1.id,
          amount_usd: "50000000.00",
          investment_date: new Date("2024-03-15"),
        },
        {
          fund_id: fund1.id,
          investor_id: inv2.id,
          amount_usd: "75000000.00",
          investment_date: new Date("2024-09-22"),
        },
        {
          fund_id: fund2.id,
          investor_id: inv3.id,
          amount_usd: "1000000.00",
          investment_date: new Date("2025-01-02"),
        },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed complete.");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
