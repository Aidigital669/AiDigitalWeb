import nodemailer from "nodemailer";

/**
 * Sends an email message using the SMTP configuration in env variables.
 * Falls back to console logging if credentials are not configured.
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.text - Plain text email content
 * @param {string} params.html - HTML email content (optional)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendEmail({ to, subject, text, html }) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "465");
  const fromEmail = process.env.SMTP_FROM || smtpUser || "no-reply@aidigital.com";

  if (!to) {
    console.error("sendEmail error: Recipient email is required.");
    return { success: false, error: "Recipient email is required" };
  }

  try {
    if (!smtpUser || !smtpPass) {
      // Console sandbox logging fallback
      console.log(`[EMAIL SANDBOX LOG] To: ${to} | Subject: "${subject}" | Msg: ${text}`);
      return { success: true, messageId: "sandbox-mode" };
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for port 465, false for other ports (like 587)
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Send mail
    const info = await transporter.sendMail({
      from: `"BizzMaker Notification" <${fromEmail}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, "<br>"),
    });

    console.log(`[EMAIL SENT] Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("sendEmail error:", error);
    return { success: false, error: error.message };
  }
}
