import { NextResponse } from "next/server";
import pool, { ensureAllTables } from "../../../../lib/db";
import { readFallback, writeFallback, upsertFallback, deleteFallback } from "../../../../lib/dbFallback";

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
      "SELECT * FROM onboarding_details ORDER BY created_at DESC"
    );

    // If DB is online, sync rows to JSON fallback
    if (Array.isArray(rows) && rows.length > 0) {
      writeFallback("onboarding", rows);
      return NextResponse.json(rows);
    }

    // If DB table is empty but fallback JSON has records, sync them back to DB
    const fallbackRows = readFallback("onboarding", []);
    if (fallbackRows.length > 0 && rows.length === 0) {
      for (const item of fallbackRows) {
        try {
          await pool.query(
            `INSERT IGNORE INTO onboarding_details 
             (id, payment_id, plans, contact_name, alt_phone, business_type, gstin, address_line1, address_line2, city, state_name, pin_code, request_callback, scheduled_date, scheduled_time, status, promo_code) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.id, item.payment_id, item.plans, item.contact_name, item.alt_phone,
              item.business_type, item.gstin, item.address_line1, item.address_line2,
              item.city, item.state_name, item.pin_code, item.request_callback ? 1 : 0,
              item.scheduled_date, item.scheduled_time, item.status || 'Pending', item.promo_code
            ]
          );
        } catch (e) {}
      }
      return NextResponse.json(fallbackRows);
    }

    return NextResponse.json(rows || []);
  } catch (error) {
    console.warn("[Admin Onboarding GET] DB offline, using JSON fallback:", error.message);
    const fallbackRows = readFallback("onboarding", []);
    return NextResponse.json(fallbackRows);
  }
}

export async function PUT(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status, scheduled_date, scheduled_time, request_callback } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Onboarding Record ID is required" }, { status: 400 });
    }

    // Always update fallback JSON
    const updateObj = { id };
    if (status !== undefined) updateObj.status = status;
    if (scheduled_date !== undefined) updateObj.scheduled_date = scheduled_date;
    if (scheduled_time !== undefined) updateObj.scheduled_time = scheduled_time;
    if (request_callback !== undefined) updateObj.request_callback = request_callback ? 1 : 0;
    upsertFallback("onboarding", updateObj);

    // Update in MySQL
    let updateFields = [];
    let queryParams = [];

    if (status !== undefined) { updateFields.push("status = ?"); queryParams.push(status); }
    if (scheduled_date !== undefined) { updateFields.push("scheduled_date = ?"); queryParams.push(scheduled_date); }
    if (scheduled_time !== undefined) { updateFields.push("scheduled_time = ?"); queryParams.push(scheduled_time); }
    if (request_callback !== undefined) { updateFields.push("request_callback = ?"); queryParams.push(request_callback ? 1 : 0); }

    if (updateFields.length > 0) {
      queryParams.push(id);
      try {
        await pool.query(
          `UPDATE onboarding_details SET ${updateFields.join(", ")} WHERE id = ?`,
          queryParams
        );
      } catch (dbErr) {
        console.warn("[Admin Onboarding PUT] MySQL update warning:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, message: "Onboarding status updated successfully" });
  } catch (error) {
    console.error("Admin Onboarding PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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
      return NextResponse.json({ error: "Onboarding Record ID is required" }, { status: 400 });
    }

    deleteFallback("onboarding", id);

    try {
      await pool.query("DELETE FROM onboarding_details WHERE id = ?", [id]);
    } catch (dbErr) {
      console.warn("[Admin Onboarding DELETE] MySQL delete warning:", dbErr.message);
    }

    return NextResponse.json({ success: true, message: "Onboarding record deleted successfully" });
  } catch (error) {
    console.error("Admin Onboarding DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
