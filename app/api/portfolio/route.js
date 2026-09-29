export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getPortfolioData } from "../../../lib/portfolio";

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
  } catch (error) {
    console.error("Failed to get portfolio data:", error);
    return NextResponse.json(
      { showcaseProjects: [], industries: [], otherProjects: [], creativeGroups: [] },
      { status: 500 }
    );
  }
}
