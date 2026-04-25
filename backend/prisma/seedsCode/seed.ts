import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function initializeInventory() {
  console.log("📦 Initializing Inventory across all warehouses...");

  // 1. Get all existing Warehouse IDs and Product MNs
  const warehouses = await prisma.warehouse.findMany({ select: { id: true } });
  const products = await prisma.product.findMany({ select: { mn: true } });

  let count = 0;

  for (const wh of warehouses) {
    for (const prod of products) {
      // 2. Use upsert to avoid "Unique Constraint" errors if some links exist
      await prisma.warehouseInventory.upsert({
        where: {
          warehouseId_productMn: {
            warehouseId: wh.id,
            productMn: prod.mn,
          },
        },
        update: {}, // Don't change existing stock levels
        create: {
          warehouseId: wh.id,
          productMn: prod.mn,
          physicalQty: 0,   // Start at zero
          reservedQty: 0,   // Start at zero
          minimumQty: 10,   // Set a default production safety stock
        },
      });
      count++;
    }
  }

  console.log(`✅ Successfully initialized ${count} inventory slots.`);
}
async function main() {
  initializeInventory()
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });