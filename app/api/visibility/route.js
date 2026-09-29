export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getVisibilitySettings } from "../../../lib/visibility";

export async function GET() {
  try {
    const settings = await getVisibilitySettings();
    return NextResponse.json(
      { success: true, visibility: settings },
      {
        headers: {
          "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, visibility: {}, error: err.message },
      { status: 500 }
    );
  }
}
