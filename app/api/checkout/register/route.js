export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, googleId, phone } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Google verified email is required." }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ success: false, error: "Verified phone number is required." }, { status: 400 });
    }

    // Clean phone number format
    const cleanPhone = phone.replace(/[^\d+]/g, "");

    // 1. Check if user already exists
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);

    if (existing.length > 0) {
      // Update phone and name if they already exist
      await pool.query(
        "UPDATE users SET name = ?, google_id = ?, phone = ?, phone_verified = true WHERE email = ?",
        [name || null, googleId || null, cleanPhone, email]
      );
      console.log(`[USER DB UPDATE] Updated verified user: ${email} with phone: ${cleanPhone}`);
    } else {
      // Check if phone is already registered by another account to prevent duplicates
      const [existingPhone] = await pool.query("SELECT id FROM users WHERE phone = ?", [cleanPhone]);
      if (existingPhone.length > 0) {
        return NextResponse.json({ success: false, error: "This phone number is already registered by another email account." }, { status: 400 });
      }

      // Insert new verified user
      await pool.query(
        "INSERT INTO users (name, email, google_id, phone, phone_verified) VALUES (?, ?, ?, ?, true)",
        [name || null, email, googleId || null, cleanPhone]
      );
      console.log(`[USER DB REGISTRATION] Saved verified user: ${email} | Phone: ${cleanPhone}`);
    }

    return NextResponse.json({ success: true, message: "User registered successfully in database." });
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
