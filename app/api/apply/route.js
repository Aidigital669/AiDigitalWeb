export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { sendWhatsAppMessage } from "../../../lib/whatsapp";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import pool from "../../../lib/db";

export async function POST(req) {
  try {
    const formData = await req.formData();
    
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const address = formData.get("address") || "";
    const city = formData.get("city") || "";
    const district = formData.get("district") || "";
    const message = formData.get("message") || "";
    const jobTitle = formData.get("jobTitle");
    const resume = formData.get("resume");

    if (!name || !email || !phone || !jobTitle || !resume) {
      return NextResponse.json({ error: "Missing required fields or resume file." }, { status: 400 });
    }

    // 1. Save Resume File Locally
    const bytes = await resume.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const ext = path.extname(resume.name) || ".pdf";
    const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const uniqueId = crypto.randomBytes(4).toString("hex");
    const filename = `${safeName}_${uniqueId}${ext}`;
    const filepath = path.join(uploadDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    const resumeUrl = `/uploads/resumes/${filename}`;

    // 2. Save to MySQL Database (Admin Panel)
    try {
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

      // Ensure new columns exist (in case table was created earlier without them)
      try { await pool.query("ALTER TABLE job_applications ADD COLUMN address TEXT"); } catch (e) {}
      try { await pool.query("ALTER TABLE job_applications ADD COLUMN city VARCHAR(100)"); } catch (e) {}
      try { await pool.query("ALTER TABLE job_applications ADD COLUMN district VARCHAR(100)"); } catch (e) {}

      await pool.query(
        "INSERT INTO job_applications (name, email, phone, address, city, district, job_title, message, resume_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [name, email, phone, address, city, district, jobTitle, message, resumeUrl]
      );
    } catch (dbErr) {
      console.error("MySQL DB insert failed:", dbErr);
      // We log but continue, so user still applies even if DB is misconfigured
    }

    // 3. Save to Google Sheets
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (clientEmail && privateKey && spreadsheetId) {
      try {
        let formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
        if (formattedPrivateKey.startsWith('"') && formattedPrivateKey.endsWith('"')) {
          formattedPrivateKey = formattedPrivateKey.slice(1, -1);
        }
        if (formattedPrivateKey.startsWith("'") && formattedPrivateKey.endsWith("'")) {
          formattedPrivateKey = formattedPrivateKey.slice(1, -1);
        }

        const auth = new google.auth.GoogleAuth({
          credentials: { client_email: clientEmail, private_key: formattedPrivateKey },
          scopes: ["https://www.googleapis.com/auth/spreadsheets"]
        });
        const sheets = google.sheets({ version: "v4", auth });

        const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        const locationStr = `${address}, ${city}, ${district}`;
        const combinedMessage = `Loc: ${locationStr}\n\nCover Letter: ${message}\nResume Link: ${resumeUrl}`;
        const rowValues = [timestamp, name, email, phone, `Job App: ${jobTitle}`, combinedMessage];

        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: "Sheet1!A:F",
          valueInputOption: "RAW",
          insertDataOption: "INSERT_ROWS",
          requestBody: { values: [rowValues] }
        });
      } catch (sheetErr) {
        console.error("Google Sheets insert failed:", sheetErr);
      }
    }

    // 4. Trigger Automated WhatsApp Notifications
    try {
      const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER || "919096090701";
      const adminMsg = `🔔 *New Job Application!*\n\n*Name:* ${name}\n*Role:* ${jobTitle}\n*Phone:* ${phone}\n*Email:* ${email}\n*Location:* ${city}, ${district}\n*Resume:* ${resumeUrl}`;
      
      await sendWhatsAppMessage({ to: adminNumber, message: adminMsg });
    } catch (waErr) {
      console.error("WhatsApp admin alert failed:", waErr);
    }

    return NextResponse.json({ success: true, message: "Application submitted successfully." });
  } catch (error) {
    console.error("Application API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit application." },
      { status: 500 }
    );
  }
}
