import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

type ProductCSV = {
  BRAND: string;
  COMPANY: string;
  IGST: string;
  MN: string;
  PN: string;
  MN_PN: string;
  Family: string;
  Unit_price: string;
  POWER: string;
  Description: string;
  ACTIVE: string;
  TYPE: string;
  GROUP: string;
  DESC_OFFICIAL: string;
  "HSN Code": string;
  "BRAND SHORT": string;
  Warranty: string;
};

async function main() {
  const filePath = path.join(__dirname, "Product.csv");
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  }) as ProductCSV[];

  for (const row of records) {
    try {
      await prisma.product.create({
        data: {
          brand: row.BRAND?.trim() || "",
          // company: row.COMPANY?.trim() || "",
          mn: row.MN?.trim() || null,
          pn: row.PN?.trim() || null,
          mn_pn: row.MN_PN?.trim() || "",
          family: row.Family?.trim() || "",
          type: row.TYPE?.trim() || "",
          description: row.Description?.trim() || "",
          active: row.ACTIVE?.toLowerCase() === "true",
          brand_short: row["BRAND SHORT"]?.trim() || "",
          desc_offcial: row.DESC_OFFICIAL?.trim() || "",
          group: row.GROUP ? parseInt(row.GROUP) : 0,
          igst: row.IGST ? parseFloat(row.IGST.replace("%", "")) : 0,
          power: row.POWER ? parseFloat(row.POWER) : 0,
          company_name: row.COMPANY?.trim() || "",
          hsn: row["HSN Code"]?.trim() || "",
          unit_price: row.Unit_price?.trim() || null,
          warranty: row.Warranty ? parseInt(row.Warranty) : null,
          initial_stock: 100,
        },
      });
    } catch (error: any) {
      console.error(`❌ Failed to insert row with MN=${row.MN}:`, error.message);
    }
  }
}

main()
  .then(async () => {
    console.log("✅ Seeding completed!");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });