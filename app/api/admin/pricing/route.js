export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { googlePlans, facebookPlans, combinePlans, websitePlans, creativePacks, aiVideoPlans, realEstatePlans } from "../../../pricing/pricingData";

// Fallback pricing retrieval from backup JSON file
function getJsonFallback() {
  try {
    const filePath = path.join(process.cwd(), "data", "pricingData.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read backup pricing JSON file, using static code import. Error:", err.message);
  }
  return { googlePlans, facebookPlans, combinePlans, websitePlans, creativePacks, aiVideoPlans, realEstatePlans };
}

export async function GET() {
  const fallback = getJsonFallback();
  const getPriceVal = (price) => Number(String(price).replace(/,/g, "")) || 0;
  
  Object.keys(fallback).forEach((cat) => {
    if (fallback[cat] && Array.isArray(fallback[cat])) {
      fallback[cat].sort((a, b) => getPriceVal(a.price) - getPriceVal(b.price));
    }
  });

  return NextResponse.json(fallback, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  });
}

export async function POST() {
  return NextResponse.json({ error: "Pricing plans are static and cannot be changed" }, { status: 405 });
}
