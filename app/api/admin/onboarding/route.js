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
    const [rows] = await pool.query(
      "SELECT * FROM onboarding_details ORDER BY created_at DESC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.warn("Admin Onboarding GET (DB offline or table missing):", error.message);
    return NextResponse.json([]);
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

    let updateFields = [];
    let queryParams = [];

    if (status !== undefined) { updateFields.push("status = ?"); queryParams.push(status); }
    if (scheduled_date !== undefined) { updateFields.push("scheduled_date = ?"); queryParams.push(scheduled_date); }
    if (scheduled_time !== undefined) { updateFields.push("scheduled_time = ?"); queryParams.push(scheduled_time); }
    if (request_callback !== undefined) { updateFields.push("request_callback = ?"); queryParams.push(request_callback ? 1 : 0); }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    queryParams.push(id);
    await pool.query(
      `UPDATE onboarding_details SET ${updateFields.join(", ")} WHERE id = ?`,
      queryParams
    );

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

    await pool.query("DELETE FROM onboarding_details WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Onboarding record deleted successfully" });
  } catch (error) {
    console.error("Admin Onboarding DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
