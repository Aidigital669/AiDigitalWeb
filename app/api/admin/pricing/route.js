export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getPricingPlans, saveAllPricingPlans } from "../../../../lib/pricing";

function checkAuth(req) {
  const session = req.cookies.get("admin_session");
  return session && session.value === "authenticated";
}

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
  } catch (err) {
    console.error("Failed to get pricing in admin route:", err);
    return NextResponse.json({ error: "Failed to get pricing plans" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pricingData = await req.json();
    if (!pricingData || typeof pricingData !== "object") {
      return NextResponse.json({ error: "Invalid pricing data payload" }, { status: 400 });
    }

    const result = await saveAllPricingPlans(pricingData);

    return NextResponse.json({
      success: true,
      message: result.dbSaved
        ? "Pricing plans saved to MySQL database and JSON backup successfully!"
        : "Pricing plans saved to local JSON backup successfully (Database offline).",
      dbSaved: result.dbSaved
    });
  } catch (error) {
    console.error("Error saving pricing data in admin route:", error);
    return NextResponse.json({ error: "Failed to save pricing: " + error.message }, { status: 500 });
  }
}
