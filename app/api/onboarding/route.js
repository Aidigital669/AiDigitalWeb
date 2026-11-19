export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { pool } from "../../../lib/db";
import { isValidMobileNumber, isValidName, isValidPinCode, isValidGstin } from "../../../lib/validation";

// Auto-initialize the onboarding_details table if not exists
async function ensureOnboardingTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS onboarding_details (
      id VARCHAR(36) NOT NULL,
      payment_id VARCHAR(100) NOT NULL,
      plans VARCHAR(255) NOT NULL,
      contact_name VARCHAR(100) DEFAULT NULL,
      alt_phone VARCHAR(50) DEFAULT NULL,
      business_type VARCHAR(100) DEFAULT NULL,
      gstin VARCHAR(50) DEFAULT NULL,
      address_line1 TEXT DEFAULT NULL,
      address_line2 TEXT DEFAULT NULL,
      city VARCHAR(100) DEFAULT NULL,
      state_name VARCHAR(100) DEFAULT NULL,
      pin_code VARCHAR(20) DEFAULT NULL,
      request_callback TINYINT(1) DEFAULT '0',
      scheduled_date VARCHAR(100) DEFAULT NULL,
      scheduled_time VARCHAR(50) DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      promo_code VARCHAR(100) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY payment_id (payment_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  try {
    await pool.query(query);
    // Ensure column exists for existing tables
    await pool.query("ALTER TABLE onboarding_details ADD COLUMN IF NOT EXISTS promo_code VARCHAR(100) DEFAULT NULL");
  } catch (err) {
    console.error("Failed to auto-create onboarding_details table:", err.message);
  }
}

export async function POST(req) {
  try {
    await ensureOnboardingTable();
    
    const body = await req.json();
    const {
      payment_id,
      plans,
      contact_name,
      alt_phone,
      business_type,
      gstin,
      address_line1,
      address_line2,
      city,
      state_name,
      pin_code,
      request_callback,
      scheduled_date,
      scheduled_time,
      status,
      promo_code
    } = body;

    // Server-side input validations
    if (contact_name && !isValidName(contact_name)) {
      return NextResponse.json({ success: false, error: "Please enter a valid contact name (at least 2 letters)." }, { status: 400 });
    }
    if (alt_phone && !isValidMobileNumber(alt_phone)) {
      return NextResponse.json({ success: false, error: "Please enter a valid 10-digit alternative phone number." }, { status: 400 });
    }
    if (pin_code && !isValidPinCode(pin_code)) {
      return NextResponse.json({ success: false, error: "Please enter a valid 6-digit pin code." }, { status: 400 });
    }
    if (gstin && !isValidGstin(gstin)) {
      return NextResponse.json({ success: false, error: "Please enter a valid 15-character GSTIN format." }, { status: 400 });
    }

    if (!payment_id) {
      return NextResponse.json({ success: false, error: "Payment ID is required" }, { status: 400 });
    }

    // Check if a record with payment_id already exists
    const [existing] = await pool.query(
      "SELECT id FROM onboarding_details WHERE payment_id = ?",
      [payment_id]
    );

    const recordId = existing.length > 0 ? existing[0].id : Math.random().toString(36).substring(2, 15);

    if (existing.length > 0) {
      // Build dynamic update query
      let updateFields = [];
      let queryParams = [];

      if (plans !== undefined) { updateFields.push("plans = ?"); queryParams.push(plans); }
      if (contact_name !== undefined) { updateFields.push("contact_name = ?"); queryParams.push(contact_name); }
      if (alt_phone !== undefined) { updateFields.push("alt_phone = ?"); queryParams.push(alt_phone); }
      if (business_type !== undefined) { updateFields.push("business_type = ?"); queryParams.push(business_type); }
      if (gstin !== undefined) { updateFields.push("gstin = ?"); queryParams.push(gstin); }
      if (address_line1 !== undefined) { updateFields.push("address_line1 = ?"); queryParams.push(address_line1); }
      if (address_line2 !== undefined) { updateFields.push("address_line2 = ?"); queryParams.push(address_line2); }
      if (city !== undefined) { updateFields.push("city = ?"); queryParams.push(city); }
      if (state_name !== undefined) { updateFields.push("state_name = ?"); queryParams.push(state_name); }
      if (pin_code !== undefined) { updateFields.push("pin_code = ?"); queryParams.push(pin_code); }
      if (request_callback !== undefined) { updateFields.push("request_callback = ?"); queryParams.push(request_callback ? 1 : 0); }
      if (scheduled_date !== undefined) { updateFields.push("scheduled_date = ?"); queryParams.push(scheduled_date); }
      if (scheduled_time !== undefined) { updateFields.push("scheduled_time = ?"); queryParams.push(scheduled_time); }
      if (status !== undefined) { updateFields.push("status = ?"); queryParams.push(status); }
      if (promo_code !== undefined) { updateFields.push("promo_code = ?"); queryParams.push(promo_code); }

      if (updateFields.length > 0) {
        queryParams.push(payment_id);
        await pool.query(
          `UPDATE onboarding_details SET ${updateFields.join(", ")} WHERE payment_id = ?`,
          queryParams
        );
      }
    } else {
      // Insert new record
      await pool.query(
        `INSERT INTO onboarding_details 
          (id, payment_id, plans, contact_name, alt_phone, business_type, gstin, address_line1, address_line2, city, state_name, pin_code, request_callback, scheduled_date, scheduled_time, status, promo_code)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recordId,
          payment_id,
          plans || "BizzMaker Plan",
          contact_name || null,
          alt_phone || null,
          business_type || "Sole Proprietorship",
          gstin || null,
          address_line1 || null,
          address_line2 || null,
          city || null,
          state_name || null,
          pin_code || null,
          request_callback ? 1 : 0,
          scheduled_date || null,
          scheduled_time || null,
          status || "Pending",
          promo_code || null
        ]
      );
    }

    return NextResponse.json({ success: true, message: "Onboarding details saved successfully", recordId });
  } catch (error) {
    console.error("Onboarding API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
