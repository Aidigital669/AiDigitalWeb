import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";

function checkAuth(req) {
  const session = req.cookies.get("admin_session");
  return session && session.value === "authenticated";
}

export async function GET(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM payment_reminders ORDER BY created_at DESC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.warn("Admin Reminders GET (DB offline or table missing):", error.message);
    return NextResponse.json([]);
  }
}

export async function DELETE(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Reminder Record ID is required" }, { status: 400 });
    }

    await pool.query("DELETE FROM payment_reminders WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Reminder record deleted successfully" });
  } catch (error) {
    console.error("Admin Reminders DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
