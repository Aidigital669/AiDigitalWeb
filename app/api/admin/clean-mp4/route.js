export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET() {
  try {
    const connection = await pool.getConnection();
    try {
      // 1. Delete all portfolio items pointing to local .mp4 files
      const [result] = await connection.query("DELETE FROM portfolio_items WHERE src LIKE '%.mp4'");
      
      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${result.affectedRows} broken .mp4 entries from MySQL database.`
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Cleanup API failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
