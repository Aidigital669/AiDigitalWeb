export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getPricingPlans } from "../../../lib/pricing";

export async function GET() {
  try {
    const data = await getPricingPlans();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    console.error("Failed to get pricing data:", error);
    return NextResponse.json({ error: "Failed to load pricing" }, { status: 500 });
  }
}
