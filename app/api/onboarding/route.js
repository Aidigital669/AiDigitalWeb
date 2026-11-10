import { NextResponse } from "next/server";
import { pool, ensureAllTables } from "../../../lib/db";
import { isValidMobileNumber, isValidName, isValidPinCode, isValidGstin } from "../../../lib/validation";
import { upsertFallback } from "../../../lib/dbFallback";

export async function POST(req) {
  try {
    await ensureAllTables();
    
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

    const recordId = Math.random().toString(36).substring(2, 15);
    const onboardingRecord = {
      id: recordId,
      payment_id,
      plans: plans || "AI Digital Plan",
      contact_name: contact_name || null,
      alt_phone: alt_phone || null,
      business_type: business_type || "Sole Proprietorship",
      gstin: gstin || null,
      address_line1: address_line1 || null,
      address_line2: address_line2 || null,
      city: city || null,
      state_name: state_name || null,
      pin_code: pin_code || null,
      request_callback: request_callback ? 1 : 0,
      scheduled_date: scheduled_date || null,
      scheduled_time: scheduled_time || null,
      status: status || "Pending",
      promo_code: promo_code || null,
      created_at: new Date().toISOString()
    };

    // 1. Dual persistence: Always save to local JSON fallback immediately
    upsertFallback("onboarding", onboardingRecord, "payment_id");

    // 2. Save to MySQL
    try {
      const [existing] = await pool.query(
        "SELECT id FROM onboarding_details WHERE payment_id = ?",
        [payment_id]
      );

      if (existing.length > 0) {
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
        await pool.query(
          `INSERT INTO onboarding_details 
            (id, payment_id, plans, contact_name, alt_phone, business_type, gstin, address_line1, address_line2, city, state_name, pin_code, request_callback, scheduled_date, scheduled_time, status, promo_code)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            recordId,
            payment_id,
            onboardingRecord.plans,
            onboardingRecord.contact_name,
            onboardingRecord.alt_phone,
            onboardingRecord.business_type,
            onboardingRecord.gstin,
            onboardingRecord.address_line1,
            onboardingRecord.address_line2,
            onboardingRecord.city,
            onboardingRecord.state_name,
            onboardingRecord.pin_code,
            onboardingRecord.request_callback,
            onboardingRecord.scheduled_date,
            onboardingRecord.scheduled_time,
            onboardingRecord.status,
            onboardingRecord.promo_code
          ]
        );
      }
    } catch (dbErr) {
      console.warn("[Onboarding API] MySQL save warning (saved to JSON fallback):", dbErr.message);
    }

    return NextResponse.json({ success: true, message: "Onboarding details saved successfully", recordId });
  } catch (error) {
    console.error("Onboarding API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
