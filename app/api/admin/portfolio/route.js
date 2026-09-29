export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getPortfolioData, savePortfolioData } from "../../../../lib/portfolio";

function checkAuth(req) {
  const session = req.cookies.get("admin_session");
  return session && session.value === "authenticated";
}

export async function GET() {
  try {
    const data = await getPortfolioData();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (err) {
    console.error("Admin portfolio GET error:", err);
    return NextResponse.json(
      { showcaseProjects: [], industries: [], otherProjects: [], creativeGroups: [] },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const portfolioData = await req.json();
    if (!portfolioData || typeof portfolioData !== "object") {
      return NextResponse.json({ error: "Invalid portfolio data payload" }, { status: 400 });
    }

    const result = await savePortfolioData(portfolioData);

    return NextResponse.json({
      success: true,
      message: result.dbSaved
        ? "Portfolio saved to MySQL database and JSON backup successfully!"
        : "Portfolio saved to local JSON backup successfully (Database offline).",
      dbSaved: result.dbSaved
    });
  } catch (error) {
    console.error("Admin portfolio POST error:", error);
    return NextResponse.json({ error: "Failed to persist portfolio: " + error.message }, { status: 500 });
  }
}
