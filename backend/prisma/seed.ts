import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding suppliers...");

  await prisma.supplier.createMany({
    data: [
      {
        name: "Sunrise Tech Solutions",
        contactPerson: "Arun Prakash",
        phone: "9876501234",
        email: "sales@sunrisetech.in",
        address: "15, Guindy Industrial Estate",
        city: "Chennai",
        state: "Tamil Nadu",
        country: "India",
        gstNumber: "33SUNRI1234A1Z5",
        deletedAt: null,
      },
      {
        name: "Velocity Components Pvt Ltd",
        contactPerson: "Meena Krishnan",
        phone: "9123409876",
        email: "contact@velocitycomponents.in",
        address: "88, SIDCO Industrial Area",
        city: "Coimbatore",
        state: "Tamil Nadu",
        country: "India",
        gstNumber: "33VELOX5678B1Z2",
        deletedAt: null,
      },
      {
        name: "Nova Industrial Traders",
        contactPerson: "Rahul Verma",
        phone: "9988701234",
        email: "info@novatraders.com",
        address: "102, Bhosari MIDC",
        city: "Pune",
        state: "Maharashtra",
        country: "India",
        gstNumber: "27NOVA4321C1Z9",
        deletedAt: null,
      },
      {
        name: "Apex Hardware & Tools",
        contactPerson: "Dinesh Reddy",
        phone: "9090807060",
        email: "support@apexhardware.in",
        address: "55, Peenya Industrial Area",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        gstNumber: "29APEX9999D1Z7",
        deletedAt: null,
      },
      {
        name: "Zenith Power Equipments",
        contactPerson: "Sanjay Gupta",
        phone: "9812304567",
        email: "sales@zenithpower.in",
        address: "21, Sector 63 Industrial Zone",
        city: "Noida",
        state: "Uttar Pradesh",
        country: "India",
        gstNumber: "09ZENIT8765E1Z3",
        deletedAt: null,
      }
    ],
    skipDuplicates: true,
  });

  console.log("✅ Suppliers seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
