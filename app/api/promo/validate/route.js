import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

// Ensure promo_codes table exists and has default codes
async function ensurePromoTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS promo_codes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      discount_percent DECIMAL(5,2) NOT NULL,
      min_order_amount DECIMAL(10,2) NOT NULL,
      max_discount_amount DECIMAL(10,2) DEFAULT NULL,
      is_active TINYINT(1) DEFAULT 1,
      usage_limit INT DEFAULT NULL,
      times_used INT DEFAULT 0,
      description VARCHAR(255) DEFAULT NULL,
      expires_at DATETIME DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await pool.query(createTableQuery);

    // Check if table is empty and seed default promo codes
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM promo_codes");
    if (rows[0].count === 0) {
      const defaultPromos = [
        ["SAVE5", 5.00, 3000.00, "5% OFF on orders of ₹3,000 or more"],
        ["GROWTH10", 10.00, 8000.00, "10% OFF on orders of ₹8,000 or more"],
        ["SCALE15", 15.00, 15000.00, "15% OFF on orders of ₹15,000 or more"],
        ["PLAN3M10", 10.00, 0.00, "10% OFF on 3-Month Plan Purchase"],
        ["3MONTHS10", 10.00, 0.00, "10% OFF on 3-Month Plan Purchase"],
        ["PLAN6M15", 15.00, 0.00, "15% OFF on 6-Month Plan Purchase"],
        ["6MONTHS15", 15.00, 0.00, "15% OFF on 6-Month Plan Purchase"]
      ];

      for (const [code, percent, minAmt, desc] of defaultPromos) {
        await pool.query(
          "INSERT IGNORE INTO promo_codes (code, discount_percent, min_order_amount, description) VALUES (?, ?, ?, ?)",
          [code, percent, minAmt, desc]
        );
      }
    }
  } catch (err) {
    console.error("Error setting up promo_codes table:", err.message);
  }
}

export async function POST(req) {
  try {
    await ensurePromoTable();

    const body = await req.json();
    const { code, amount } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ success: false, error: "Please enter a valid promo code." }, { status: 400 });
    }

    const orderAmount = parseFloat(amount);
    if (isNaN(orderAmount) || orderAmount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid order amount." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Fetch promo code from DB
    const [rows] = await pool.query(
      "SELECT * FROM promo_codes WHERE code = ?",
      [cleanCode]
    );

    if (rows.length === 0) {
      if (cleanCode === "PLAN6M15" || cleanCode === "6MONTHS15" || cleanCode === "6MONTH15") {
        const discountPercent = 15;
        const discountAmount = Math.round((orderAmount * discountPercent) / 100);
        const finalTotal = Math.max(0, orderAmount - discountAmount);
        return NextResponse.json({
          success: true,
          code: cleanCode,
          discountPercent,
          discountAmount,
          finalTotal,
          message: "6-Month Plan Special Discount (15% OFF) applied!"
        });
      }
      if (cleanCode === "PLAN3M10" || cleanCode === "3MONTHS10" || cleanCode === "3MONTH10") {
        const discountPercent = 10;
        const discountAmount = Math.round((orderAmount * discountPercent) / 100);
        const finalTotal = Math.max(0, orderAmount - discountAmount);
        return NextResponse.json({
          success: true,
          code: cleanCode,
          discountPercent,
          discountAmount,
          finalTotal,
          message: "3-Month Plan Special Discount (10% OFF) applied!"
        });
      }
      return NextResponse.json({ success: false, error: "Invalid promo code." }, { status: 404 });
    }

    const promo = rows[0];

    // 1. Active check
    if (!promo.is_active) {
      return NextResponse.json({ success: false, error: "This promo code is currently inactive." }, { status: 400 });
    }

    // 2. Minimum order amount check
    const minRequired = parseFloat(promo.min_order_amount);
    if (orderAmount < minRequired) {
      return NextResponse.json({
        success: false,
        error: `Code '${promo.code}' requires a minimum purchase of ₹${minRequired.toLocaleString('en-IN')}.`
      }, { status: 400 });
    }

    // 3. Expiry date check
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: "This promo code has expired." }, { status: 400 });
    }

    // 4. Usage limit check
    if (promo.usage_limit !== null && promo.times_used >= promo.usage_limit) {
      return NextResponse.json({ success: false, error: "This promo code usage limit has been reached." }, { status: 400 });
    }

    // Calculate discount amount
    const discountPercent = parseFloat(promo.discount_percent);
    let discountAmount = Math.round((orderAmount * discountPercent) / 100);

    // Apply max discount cap if defined
    if (promo.max_discount_amount !== null && promo.max_discount_amount > 0) {
      const maxDiscount = parseFloat(promo.max_discount_amount);
      if (discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
      }
    }

    const finalTotal = Math.max(0, orderAmount - discountAmount);

    return NextResponse.json({
      success: true,
      code: promo.code,
      discountPercent,
      discountAmount,
      finalTotal,
      message: `Promo code applied! Saved ${discountPercent}% (₹${discountAmount.toLocaleString('en-IN')}).`
    });
  } catch (err) {
    console.error("Promo code validation error:", err);
    return NextResponse.json({ success: false, error: "Internal server error validating promo code." }, { status: 500 });
  }
}
