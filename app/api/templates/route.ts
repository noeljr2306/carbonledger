import { NextRequest, NextResponse } from "next/server";

const TEMPLATES: Record<string, { headers: string[]; sample: string[][] }> = {
  generic: {
    headers: ["supplier_name", "category", "spend_amount", "currency", "year"],
    sample: [
      ["Acme Steel Co", "steel_manufacturing", "250000", "USD", "2024"],
      ["FastShip Ltd", "road_freight", "80000", "USD", "2024"],
      ["PackRight Inc", "paper_packaging", "45000", "EUR", "2024"],
      ["CloudStack Ltd", "it_services", "120000", "USD", "2024"],
      ["GreenFarm Co", "agriculture_crops", "60000", "USD", "2024"],
    ],
  },
  netsuite: {
    headers: [
      "Vendor Name",
      "Expense Category",
      "Amount",
      "Currency Code",
      "Fiscal Year",
    ],
    sample: [
      ["Acme Steel Co", "Steel Manufacturing", "250000", "USD", "2024"],
      ["FastShip Ltd", "Road Freight", "80000", "USD", "2024"],
    ],
  },
  quickbooks: {
    headers: ["Supplier", "Product/Service", "Amount", "Currency", "Year"],
    sample: [
      ["Acme Steel Co", "Steel parts", "250000", "USD", "2024"],
      ["FastShip Ltd", "Delivery", "80000", "USD", "2024"],
    ],
  },
  sap: {
    headers: [
      "VENDOR_NAME",
      "MATERIAL_GROUP",
      "NET_AMOUNT",
      "CURRENCY",
      "FISCAL_YEAR",
    ],
    sample: [
      ["ACME_STEEL", "STEEL_MFG", "250000", "USD", "2024"],
      ["FASTSHIP", "ROAD_FREIGHT", "80000", "USD", "2024"],
    ],
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "generic";
  const tpl = TEMPLATES[type] ?? TEMPLATES.generic;

  const rows = [tpl.headers, ...tpl.sample]
    .map((r) => r.map((v) => `"${v}"`).join(","))
    .join("\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="carbonledger-template-${type}.csv"`,
    },
  });
}
