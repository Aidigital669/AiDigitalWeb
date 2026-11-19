export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { pool } from "../../../../lib/db";
import { sendWhatsAppMessage } from "../../../../lib/whatsapp";
import { sendEmail } from "../../../../lib/email";
import { isValidEmail, isValidMobileNumber, isValidName } from "../../../../lib/validation";

// Auto-initialize the checkout_exit_feedback table if it does not exist
async function ensureFeedbackTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS checkout_exit_feedback (
      id VARCHAR(36) NOT NULL,
      customer_name VARCHAR(100) DEFAULT NULL,
      customer_email VARCHAR(100) DEFAULT NULL,
      customer_phone VARCHAR(50) DEFAULT NULL,
      plan_name VARCHAR(100) DEFAULT NULL,
      plan_price VARCHAR(50) DEFAULT NULL,
      reason_exit VARCHAR(255) DEFAULT NULL,
      help_reconsider VARCHAR(255) DEFAULT NULL,
      wants_contact VARCHAR(255) DEFAULT NULL,
      additional_notes TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  try {
    await pool.query(query);
  } catch (err) {
    console.error("Failed to auto-create checkout_exit_feedback table:", err.message);
  }
}

export async function POST(req) {
  try {
    await ensureFeedbackTable();

    const body = await req.json();
    const {
      name,
      email,
      phone,
      planName,
      planPrice,
      reasonExit,
      helpReconsider,
      wantsContact,
      additionalNotes
    } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Missing required contact fields." }, { status: 400 });
    }

    if (!isValidName(name)) {
      return NextResponse.json({ error: "Please enter a valid name (at least 2 letters)." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address with a domain suffix (e.g. name@domain.com)." }, { status: 400 });
    }

    if (!isValidMobileNumber(phone)) {
      return NextResponse.json({ error: "Please enter a valid 10-digit WhatsApp/mobile number." }, { status: 400 });
    }

    const feedbackId = Math.random().toString(36).substring(2, 15);

    // Save to Database
    try {
      const insertQuery = `
        INSERT INTO checkout_exit_feedback (
          id, customer_name, customer_email, customer_phone, 
          plan_name, plan_price, reason_exit, help_reconsider, 
          wants_contact, additional_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await pool.query(insertQuery, [
        feedbackId,
        name || "Unknown",
        email || "N/A",
        phone || "N/A",
        planName || "Unknown Plan",
        planPrice || "N/A",
        reasonExit || "Not specified",
        helpReconsider || "Not specified",
        wantsContact || "Not specified",
        additionalNotes || ""
      ]);
    } catch (dbErr) {
      console.warn("Could not save feedback to MySQL database. Error:", dbErr.message);
    }

    // Format message details for notifications
    const displayPhone = phone || "N/A";
    const displayEmail = email || "N/A";
    const displayPlan = planName || "N/A";
    const displayPrice = planPrice || "N/A";
    const displayReason = reasonExit || "N/A";
    const displayReconsider = helpReconsider || "N/A";
    const displayContact = wantsContact || "N/A";
    const displayNotes = additionalNotes ? `\n*Additional Comments:* ${additionalNotes}` : "";

    const notificationMessage = `⚠️ *Checkout Abandoned & Survey Submitted!*

*Customer Details:*
- Name: ${name || "Unknown"}
- Phone: ${displayPhone}
- Email: ${displayEmail}

*Plan Selected:*
- Plan: ${displayPlan} (Price: ${displayPrice})

*Exit Survey Responses:*
1. *Reason for exiting:* ${displayReason}
2. *What would make them reconsider:* ${displayReconsider}
3. *Wants strategist to contact them:* ${displayContact}${displayNotes}`;

    // 1. Send WhatsApp notification to Admin
    try {
      const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER || "919096090701";
      await sendWhatsAppMessage({
        to: adminNumber,
        message: notificationMessage
      });
    } catch (waErr) {
      console.error("WhatsApp admin alert for feedback failed:", waErr.message);
    }

    // 2. Send Email notification to Admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@aidigital.com";
      const subject = `⚠️ Checkout Abandoned: Survey Feedback from ${name || "Unknown User"}`;
      
      const emailText = `Hello Admin,
      
A user abandoned checkout and submitted exit feedback.

Customer Details:
- Name: ${name || "Unknown"}
- Phone: ${displayPhone}
- Email: ${displayEmail}

Abandoned Plan:
- Plan Name: ${displayPlan}
- Plan Price: ${displayPrice}

Exit Survey Responses:
1. Reason for exit: ${displayReason}
2. What would help them reconsider: ${displayReconsider}
3. Contact Preference: ${displayContact}
${additionalNotes ? `\nAdditional Feedback:\n${additionalNotes}` : ""}

Please follow up with this potential customer.

Best regards,
BizzMaker Notification System`;

      await sendEmail({
        to: adminEmail,
        subject: subject,
        text: emailText
      });
    } catch (emailErr) {
      console.error("Email admin alert for feedback failed:", emailErr.message);
    }

    return NextResponse.json({ success: true, message: "Feedback submitted successfully." });
  } catch (error) {
    console.error("Error saving checkout exit feedback:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process feedback submission." },
      { status: 500 }
    );
  }
}
