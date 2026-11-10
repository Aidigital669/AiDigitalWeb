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
      "SELECT * FROM job_applications ORDER BY created_at DESC"
    );

    if (Array.isArray(rows) && rows.length > 0) {
      writeFallback("applications", rows);
      return NextResponse.json(rows);
    }

    const fallbackRows = readFallback("applications", []);
    if (fallbackRows.length > 0 && rows.length === 0) {
      for (const item of fallbackRows) {
        try {
          await pool.query(
            "INSERT IGNORE INTO job_applications (id, name, email, phone, address, city, district, job_title, message, resume_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [item.id, item.name, item.email, item.phone, item.address, item.city, item.district, item.job_title, item.message, item.resume_url, item.status || 'Pending']
          );
        } catch (e) {}
      }
      return NextResponse.json(fallbackRows);
    }

    return NextResponse.json(rows || []);
  } catch (error) {
    console.warn("[Admin Applications GET] DB offline, using fallback:", error.message);
    const fallbackRows = readFallback("applications", []);
    return NextResponse.json(fallbackRows);
  }
}

export async function PUT(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Application ID and new status are required" }, { status: 400 });
    }

    // Update in fallback
    upsertFallback("applications", { id, status });

    // Update in MySQL
    try {
      await pool.query("UPDATE job_applications SET status = ? WHERE id = ?", [status, id]);
    } catch (dbErr) {
      console.warn("[Admin Applications PUT] MySQL update warning:", dbErr.message);
    }

    return NextResponse.json({ success: true, message: "Application status updated successfully" });
  } catch (error) {
    console.error("Admin Applications PUT error:", error);
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
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    deleteFallback("applications", id);

    try {
      await pool.query("DELETE FROM job_applications WHERE id = ?", [id]);
    } catch (dbErr) {
      console.warn("[Admin Applications DELETE] MySQL delete warning:", dbErr.message);
    }

    return NextResponse.json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    console.error("Admin Applications DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
