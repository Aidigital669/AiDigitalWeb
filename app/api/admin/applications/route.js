import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

function checkAuth(req) {
  const session = req.cookies.get("admin_session");
  return session && session.value === "authenticated";
}

export async function GET(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Create table if it doesn't exist (failsafe)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        district VARCHAR(100),
        job_title VARCHAR(255) NOT NULL,
        message TEXT,
        resume_url TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure columns exist (in case the table was created before these were added)
    try { await pool.query("ALTER TABLE job_applications ADD COLUMN address TEXT"); } catch (e) {}
    try { await pool.query("ALTER TABLE job_applications ADD COLUMN city VARCHAR(100)"); } catch (e) {}
    try { await pool.query("ALTER TABLE job_applications ADD COLUMN district VARCHAR(100)"); } catch (e) {}

    const [rows] = await pool.query(
      "SELECT * FROM job_applications ORDER BY created_at DESC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.warn("Admin Applications GET (DB offline or table missing):", error.message);
    return NextResponse.json([]);
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

    await pool.query("UPDATE job_applications SET status = ? WHERE id = ?", [status, id]);

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

    await pool.query("DELETE FROM job_applications WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    console.error("Admin Applications DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
