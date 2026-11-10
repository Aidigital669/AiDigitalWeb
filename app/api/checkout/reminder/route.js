import { NextResponse } from "next/server";
import { pool, ensureAllTables } from "../../../../lib/db";
import { upsertFallback } from "../../../../lib/dbFallback";
import { sendWhatsAppMessage } from "../../../../lib/whatsapp";
import { sendEmail } from "../../../../lib/email";
import { isValidEmail, isValidMobileNumber, isValidName } from "../../../../lib/validation";

async function ensureReminderTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS payment_reminders (
      id VARCHAR(36) NOT NULL,
      customer_name VARCHAR(100) DEFAULT NULL,
      customer_email VARCHAR(100) DEFAULT NULL,
      customer_phone VARCHAR(50) DEFAULT NULL,
      plan_name VARCHAR(100) DEFAULT NULL,
      plan_price VARCHAR(50) DEFAULT NULL,
      reminder_date VARCHAR(50) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  try {
    await pool.query(query);
  } catch (err) {
    console.error("Failed to auto-create payment_reminders table:", err.message);
  }
}

export async function POST(req) {
  try {
    await ensureReminderTable();
    const { name, email, phone, planName, planPrice, reminderDate } = await req.json();

    if (!name || !email || !phone || !reminderDate) {
      return NextResponse.json({ error: "Missing required reminder fields." }, { status: 400 });
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

    const reminderId = Math.random().toString(36).substring(2, 15);
    const reminderRecord = {
      id: reminderId,
      customer_name: name || "Unknown",
      customer_email: email || "N/A",
      customer_phone: phone || "N/A",
      plan_name: planName || "Unknown Plan",
      plan_price: planPrice || "N/A",
      reminder_date: reminderDate || "Not specified",
      status: "Pending",
      created_at: new Date().toISOString()
    };

    // 1. Dual persistence: Save to JSON fallback
    upsertFallback("reminders", reminderRecord);

    // 2. Save to Database
    try {
      await ensureAllTables();
      const insertQuery = `
        INSERT INTO payment_reminders (
          id, customer_name, customer_email, customer_phone, 
          plan_name, plan_price, reminder_date, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
      `;
      await pool.query(insertQuery, [
        reminderId,
        reminderRecord.customer_name,
        reminderRecord.customer_email,
        reminderRecord.customer_phone,
        reminderRecord.plan_name,
        reminderRecord.plan_price,
        reminderRecord.reminder_date
      ]);
    } catch (dbErr) {
      console.warn("Could not save reminder to MySQL database (saved to fallback). Error:", dbErr.message);
    }

    // Format notification messages
    const displayPhone = phone || "N/A";
    const displayEmail = email || "N/A";
    const displayPlan = planName || "N/A";
    const displayPrice = planPrice || "N/A";
    const displayDate = reminderDate || "N/A";

    const adminMessage = `📅 *New Payment Reminder Scheduled!*

*Customer Details:*
- Name: ${name || "Unknown"}
- Phone: ${displayPhone}
- Email: ${displayEmail}

*Plan Details:*
- Plan: ${displayPlan} (Price: ${displayPrice})
- *Reminder Date:* ${displayDate}`;

    // 1. WhatsApp Notification to Admin
    try {
      const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER || "919096090701";
      await sendWhatsAppMessage({
        to: adminNumber,
        message: adminMessage
      });
    } catch (waErr) {
      console.error("WhatsApp admin alert for reminder failed:", waErr.message);
    }

    // 2. Email Notification to Admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@aidigital.com";
      const subject = `📅 Payment Reminder Scheduled by ${name || "Unknown User"}`;
      const emailText = `Hello Admin,

A user has scheduled a reminder to complete their payment later.

Customer Details:
- Name: ${name || "Unknown"}
- Phone: ${displayPhone}
- Email: ${displayEmail}

Plan Details:
- Plan Name: ${displayPlan}
- Plan Price: ${displayPrice}
- Scheduled Payment Date: ${displayDate}

Please follow up with this potential customer on their selected date.

Best regards,
AI Digital Notification System`;

      await sendEmail({
        to: adminEmail,
        subject: subject,
        text: emailText
      });
    } catch (emailErr) {
      console.error("Email admin alert for reminder failed:", emailErr.message);
    }

    return NextResponse.json({ success: true, message: "Reminder scheduled successfully." });
  } catch (error) {
    console.error("Error saving payment reminder:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process payment reminder." },
      { status: 500 }
    );
  }
}
