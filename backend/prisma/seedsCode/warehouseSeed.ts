import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Initializing Warehouse Seed...");

  const warehouses = [
    { id: 1, name: "FestaHouse", location: "Chennai, TN" },
    { id: 2, name: "Kone", location: "Chennai, TN" },
    { id: 3, name: "Bangalore", location: "Bangalore, KA" },
    { id: 4, name: "Coimbatore", location: "Coimbatore, TN" },
    { id: 5, name: "Hyderabad", location: "Hyderabad, TS" },
    { id: 6, name: "Madurai", location: "Madurai, TN" },
    { id: 7, name: "Puzhal", location: "Chennai, TN" },
    { id: 8, name: "Salem", location: "Salem, TN" },
  ];

  for (const w of warehouses) {
    const result = await prisma.warehouse.upsert({
      where: { id: w.id },
      update: {
        name: w.name,
        location: w.location,
      },
      create: w,
    });
    console.log(`✅ ${result.id === w.id ? 'Synced' : 'Created'}: ${result.name}`);
  }

  console.log("\n✨ Warehouse table is now up to date.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });