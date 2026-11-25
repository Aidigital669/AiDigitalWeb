export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool, { ensureAllTables } from "../../../../lib/db";
import { sendWhatsAppMessage } from "../../../../lib/whatsapp";
import { isValidMobileNumber } from "../../../../lib/validation";

function checkAuth(req) {
  const session = req.cookies.get("admin_session");
  return session && session.value === "authenticated";
}

export async function GET(req) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const provider = process.env.WHATSAPP_PROVIDER || "none";
    const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER || "919096090701";

    // Gather setup verification configuration checklist
    const configStatus = {
      provider,
      adminNumber,
      meta: {
        configured: !!(process.env.META_PHONE_NUMBER_ID && process.env.META_WHATSAPP_ACCESS_TOKEN)
      },
      ultramsg: {
        configured: !!(process.env.ULTRAMSG_INSTANCE_ID && process.env.ULTRAMSG_TOKEN)
      }
    };

    let logs = [];
    let dbConnected = false;

    try {
      await ensureAllTables();
      const [rows] = await pool.query(
        "SELECT * FROM whatsapp_logs ORDER BY created_at DESC LIMIT 50"
      );
      logs = rows;
      dbConnected = true;
    } catch (dbErr) {
      console.warn("WhatsApp API route: database connection failed or table does not exist.", dbErr.message);
    }

    return NextResponse.json({
      success: true,
      config: configStatus,
      logs,
      dbConnected
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    console.error("GET WhatsApp admin error:", error);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipient, message } = await req.json();
    
    if (!recipient || !message) {
      return NextResponse.json({ error: "Recipient and message fields are required." }, { status: 400 });
    }

    if (!isValidMobileNumber(recipient)) {
      return NextResponse.json({ error: "Please enter a valid 10-digit recipient phone number." }, { status: 400 });
    }

    const result = await sendWhatsAppMessage({ to: recipient, message });

    if (result.success) {
      return NextResponse.json({ success: true, message: "WhatsApp message dispatched successfully.", id: result.id });
    } else {
      return NextResponse.json({ success: false, error: result.error || "Failed to dispatch message." }, { status: 500 });
    }
  } catch (error) {
    console.error("POST WhatsApp admin test error:", error);
    return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
  }
}
