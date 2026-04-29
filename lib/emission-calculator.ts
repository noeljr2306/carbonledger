export interface EmissionResult {
  tco2e: number;
  factorUsed: number;
  factorSource: string;
  category: string;
  confidence: "high" | "medium" | "low";
}

export interface SpendInput {
  spendAmount: number;
  currency: string;
  category: string;
}

// GHG Protocol USEEIO emission factors (kgCO2e per USD spent)
export const EMISSION_FACTORS: Record<string, { factor: number; label: string }> = {
  steel_manufacturing:    { factor: 2.47, label: "Steel manufacturing" },
  aluminum_manufacturing: { factor: 3.12, label: "Aluminum manufacturing" },
  cement_concrete:        { factor: 1.89, label: "Cement & concrete" },
  plastics_rubber:        { factor: 1.34, label: "Plastics & rubber" },
  chemicals:              { factor: 1.21, label: "Chemical products" },
  electronics:            { factor: 0.54, label: "Electronics & computers" },
  machinery_equipment:    { factor: 0.72, label: "Machinery & equipment" },
  textiles_apparel:       { factor: 0.89, label: "Textiles & apparel" },
  paper_packaging:        { factor: 1.05, label: "Paper & packaging" },
  food_beverage:          { factor: 1.43, label: "Food & beverage" },
  road_freight:           { factor: 0.18, label: "Road freight" },
  air_freight:            { factor: 0.82, label: "Air freight" },
  sea_freight:            { factor: 0.09, label: "Sea freight" },
  rail_freight:           { factor: 0.05, label: "Rail freight" },
  warehousing:            { factor: 0.14, label: "Warehousing & storage" },
  consulting_services:    { factor: 0.08, label: "Consulting services" },
  it_services:            { factor: 0.11, label: "IT & software services" },
  financial_services:     { factor: 0.06, label: "Financial services" },
  legal_services:         { factor: 0.07, label: "Legal services" },
  marketing_advertising:  { factor: 0.09, label: "Marketing & advertising" },
  construction:           { factor: 0.67, label: "Construction" },
  real_estate:            { factor: 0.12, label: "Real estate" },
  electricity:            { factor: 0.43, label: "Electricity" },
  natural_gas:            { factor: 0.61, label: "Natural gas" },
  petroleum_products:     { factor: 0.89, label: "Petroleum products" },
  agriculture_crops:      { factor: 1.87, label: "Agricultural crops" },
  livestock_products:     { factor: 3.24, label: "Livestock & animal products" },
  retail_trade:           { factor: 0.16, label: "Retail trade" },
  wholesale_trade:        { factor: 0.13, label: "Wholesale distribution" },
  other:                  { factor: 0.35, label: "Other (industry average)" },
};

const CURRENCY_TO_USD: Record<string, number> = {
  USD: 1.0, EUR: 1.09, GBP: 1.27, CAD: 0.74,
  AUD: 0.65, JPY: 0.0067, CNY: 0.14, INR: 0.012,
};

export function convertToUSD(amount: number, currency: string): number {
  const rate = CURRENCY_TO_USD[currency.toUpperCase()] ?? 1.0;
  return amount * rate;
}

export function calculateEmissions(input: SpendInput): EmissionResult {
  const spendUSD = convertToUSD(input.spendAmount, input.currency);
  const categoryKey = normalizeCategory(input.category);
  const factorEntry = EMISSION_FACTORS[categoryKey];

  if (factorEntry) {
    return {
      tco2e: Math.round((spendUSD * factorEntry.factor) / 1000 * 1000) / 1000,
      factorUsed: factorEntry.factor,
      factorSource: "GHG Protocol USEEIO 2024",
      category: factorEntry.label,
      confidence: "high",
    };
  }

  // Fallback to industry average
  const fallback = EMISSION_FACTORS["other"];
  return {
    tco2e: Math.round((spendUSD * fallback.factor) / 1000 * 1000) / 1000,
    factorUsed: fallback.factor,
    factorSource: "GHG Protocol industry average (gap-fill)",
    category: input.category,
    confidence: "low",
  };
}

export function normalizeCategory(raw: string): string {
  const c = raw.toLowerCase().trim().replace(/[\s\-\/]+/g, "_");
  if (EMISSION_FACTORS[c]) return c;

  const keywords: Array<[string[], string]> = [
    [["steel", "iron", "metal"],           "steel_manufacturing"],
    [["alumin"],                            "aluminum_manufacturing"],
    [["cement", "concrete"],               "cement_concrete"],
    [["plastic", "rubber", "polymer"],     "plastics_rubber"],
    [["chem", "pharma"],                   "chemicals"],
    [["electron", "computer", "hardware"], "electronics"],
    [["machine", "equipment"],             "machinery_equipment"],
    [["textile", "cloth", "apparel"],      "textiles_apparel"],
    [["paper", "packag", "cardboard"],     "paper_packaging"],
    [["food", "beverage", "drink"],        "food_beverage"],
    [["road", "truck", "lorry"],           "road_freight"],
    [["air", "aviation", "plane"],         "air_freight"],
    [["sea", "ship", "ocean", "marine"],   "sea_freight"],
    [["rail", "train"],                    "rail_freight"],
    [["warehouse", "storage"],             "warehousing"],
    [["consult", "advisory"],              "consulting_services"],
    [["software", "it ", "saas", "cloud"], "it_services"],
    [["financ", "bank", "insur"],          "financial_services"],
    [["legal", "law"],                     "legal_services"],
    [["market", "advert"],                 "marketing_advertising"],
    [["construct", "build"],               "construction"],
    [["electric", "power", "utility"],     "electricity"],
    [["gas", "fuel", "petro", "oil"],      "petroleum_products"],
    [["agri", "crop", "farm"],             "agriculture_crops"],
    [["livestock", "meat", "dairy"],       "livestock_products"],
    [["retail", "shop", "store"],          "retail_trade"],
    [["wholesale", "distribut"],           "wholesale_trade"],
  ];

  for (const [kws, key] of keywords) {
    if (kws.some((kw) => c.includes(kw))) return key;
  }

  return "other";
}

export function getCategoryList() {
  return Object.entries(EMISSION_FACTORS).map(([key, val]) => ({
    key,
    label: val.label,
    factor: val.factor,
  }));
}