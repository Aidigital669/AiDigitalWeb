import { NextResponse } from "next/server";
import pool, { ensureAllTables } from "../../../../lib/db";
import { readFallback, writeFallback, deleteFallback } from "../../../../lib/dbFallback";

function checkAuth(req) {
  const session = req.cookies.get("admin_session");
  return session && session.value === "authenticated";
}

export async function GET(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureAllTables();
    const [rows] = await pool.query(
      "SELECT * FROM payment_reminders ORDER BY created_at DESC"
    );

    if (Array.isArray(rows) && rows.length > 0) {
      writeFallback("reminders", rows);
      return NextResponse.json(rows);
    }

    const fallbackRows = readFallback("reminders", []);
    if (fallbackRows.length > 0 && rows.length === 0) {
      for (const item of fallbackRows) {
        try {
          await pool.query(
            "INSERT IGNORE INTO payment_reminders (id, customer_name, customer_email, customer_phone, plan_name, plan_price, reminder_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [item.id, item.customer_name, item.customer_email, item.customer_phone, item.plan_name, item.plan_price, item.reminder_date, item.status || 'Pending']
          );
        } catch (e) {}
      }
      return NextResponse.json(fallbackRows);
    }

    return NextResponse.json(rows || []);
  } catch (error) {
    console.warn("[Admin Reminders GET] DB offline, using fallback:", error.message);
    const fallbackRows = readFallback("reminders", []);
    return NextResponse.json(fallbackRows);
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

    deleteFallback("reminders", id);

    try {
      await pool.query("DELETE FROM payment_reminders WHERE id = ?", [id]);
    } catch (dbErr) {
      console.warn("[Admin Reminders DELETE] MySQL delete warning:", dbErr.message);
    }

    return NextResponse.json({ success: true, message: "Reminder record deleted successfully" });
  } catch (error) {
    console.error("Admin Reminders DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
