import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "../../../lib/whatsapp";
import { isValidEmail, isValidMobileNumber, isValidName } from "../../../lib/validation";

export async function POST(req) {
  try {
    const { name, email, phone, service, message } = await req.json();

    // 1. Validate fields
    if (!name || !email || !phone || !service || !message) {
      return NextResponse.json(
        { error: "All form fields are required." },
        { status: 400 }
      );
    }

    if (!isValidName(name)) {
      return NextResponse.json(
        { error: "Please enter a valid name (at least 2 letters)." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address with a domain (e.g. user@domain.com)." },
        { status: 400 }
      );
    }

    if (!isValidMobileNumber(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile phone number." },
        { status: 400 }
      );
    }

    // 2. Forward lead to Management System / WorkForce OS (https://aidigitalworkspace.com/dashboard/sales)
    const CRM_API_URL = process.env.CRM_API_URL || process.env.NEXT_PUBLIC_CRM_API_URL || "https://aidigitalworkspace.com";
    let crmRecorded = false;
    try {
      // Primary: Post to /api/enquiry with x-api-key authentication
      const crmHeaders = {
        "Content-Type": "application/json",
        ...(process.env.CRM_API_KEY ? { "x-api-key": process.env.CRM_API_KEY } : {})
      };

      const crmRes = await fetch(`${CRM_API_URL}/api/enquiry`, {
        method: "POST",
        headers: crmHeaders,
        body: JSON.stringify({
          name,
          phone,
          email,
          service,
          message,
          source: "AiDigitalWeb Contact Form"
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (crmRes.ok) {
        crmRecorded = true;
      } else {
        // Fallback: If /api/enquiry is not yet live or returns error, send directly to /api/calls with the same x-api-key
        const CRM_SALES_PERSON_ID = parseInt(process.env.CRM_SALES_PERSON_ID || "15", 10);
        const callsRes = await fetch(`${CRM_API_URL}/api/calls`, {
          method: "POST",
          headers: crmHeaders,
          body: JSON.stringify({
            clientName: name,
            phoneNumber: phone,
            status: "PENDING",
            leadSource: service || "AiDigitalWeb Contact Form",
            notes: `[Campaign: Website Enquiry] [Service: ${service}] [Email: ${email}]\n\nMessage: ${message}`,
            salesPersonId: CRM_SALES_PERSON_ID
          }),
          signal: AbortSignal.timeout(5000)
        }).catch(() => null);

        if (callsRes && callsRes.ok) {
          crmRecorded = true;
        } else {
          const errText = await crmRes.text().catch(() => "");
          console.warn(`CRM responded with status ${crmRes.status}:`, errText);
        }
      }
    } catch (crmErr) {
      console.warn("CRM submission warning (aidigitalworkspace.com might be slow/unreachable):", crmErr.message);
    }

    // 3. Save to Google Sheets (if configured)
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (clientEmail && privateKey && spreadsheetId) {
      try {
        const { google } = await import("googleapis");
        let formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
        if (formattedPrivateKey.startsWith('"') && formattedPrivateKey.endsWith('"')) {
          formattedPrivateKey = formattedPrivateKey.slice(1, -1);
        }
        if (formattedPrivateKey.startsWith("'") && formattedPrivateKey.endsWith("'")) {
          formattedPrivateKey = formattedPrivateKey.slice(1, -1);
        }

        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: clientEmail,
            private_key: formattedPrivateKey
          },
          scopes: ["https://www.googleapis.com/auth/spreadsheets"]
        });

        const sheets = google.sheets({ version: "v4", auth });
        const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        const rowValues = [timestamp, name, email, phone, service, message];

        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: "Sheet1!A:F",
          valueInputOption: "RAW",
          insertDataOption: "INSERT_ROWS",
          requestBody: {
            values: [rowValues]
          }
        });
      } catch (sheetsErr) {
        console.warn("Google Sheets append warning:", sheetsErr.message);
      }
    }

    // 4. Trigger Automated WhatsApp Notifications (if configured)
    try {
      const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER || "919096090701";
      const adminMsg = `🔔 *New Lead Inquiry Alert!*\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Email:* ${email}\n*Service:* ${service}\n*Message:* ${message}`;
      
      await sendWhatsAppMessage({
        to: adminNumber,
        message: adminMsg
      });
    } catch (waErr) {
      console.warn("WhatsApp admin alert warning:", waErr.message);
    }

    try {
      const clientMsg = `Hi ${name},\n\nThank you for reaching out to *AI Digital*! We have received your inquiry regarding *${service}* services. Our team will review your requirements and get back to you shortly.\n\nBest regards,\nAI Digital Team`;
      
      await sendWhatsAppMessage({
        to: phone,
        message: clientMsg
      });
    } catch (waErr) {
      console.warn("WhatsApp client confirmation warning:", waErr.message);
    }

    return NextResponse.json({
      success: true,
      crm: crmRecorded,
      message: "Inquiry received successfully."
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process inquiry." },
      { status: 500 }
    );
  }
}
