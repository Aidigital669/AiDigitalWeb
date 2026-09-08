import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

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

    const [rows] = await pool.query("SELECT COUNT(*) as count FROM promo_codes");
    if (rows[0].count === 0) {
      const defaultPromos = [
        ["SAVE5", 5.00, 3000.00, "5% OFF on orders of ₹3,000 or more"],
        ["GROWTH10", 10.00, 8000.00, "10% OFF on orders of ₹8,000 or more"],
        ["SCALE15", 15.00, 15000.00, "15% OFF on orders of ₹15,000 or more"]
      ];

      for (const [code, percent, minAmt, desc] of defaultPromos) {
        await pool.query(
          "INSERT IGNORE INTO promo_codes (code, discount_percent, min_order_amount, description) VALUES (?, ?, ?, ?)",
          [code, percent, minAmt, desc]
        );
      }
    }
  } catch (err) {
    console.error("Error creating promo_codes table:", err.message);
  }
}

// GET: Fetch all promo codes
export async function GET() {
  try {
    await ensurePromoTable();
    const [rows] = await pool.query("SELECT * FROM promo_codes ORDER BY min_order_amount ASC, created_at DESC");
    return NextResponse.json({ success: true, promoCodes: rows });
  } catch (err) {
    console.warn("Admin promo GET (DB offline or table missing):", err.message);
    return NextResponse.json({ success: true, promoCodes: [] });
  }
}

// POST: Generate & Create a new promo code
export async function POST(req) {
  try {
    await ensurePromoTable();
    const body = await req.json();
    const { code, discount_percent, min_order_amount, max_discount_amount, is_active, description } = body;

    let finalCode = (code || "").trim().toUpperCase();

    // Auto-generate promo code name if blank
    if (!finalCode) {
      const prefix = discount_percent >= 15 ? "SCALE" : discount_percent >= 10 ? "GROWTH" : "SAVE";
      finalCode = `${prefix}${Math.round(discount_percent)}`;
    }

    if (!discount_percent || isNaN(discount_percent) || discount_percent <= 0) {
      return NextResponse.json({ success: false, error: "Discount percent must be greater than 0." }, { status: 400 });
    }

    if (min_order_amount === undefined || isNaN(min_order_amount)) {
      return NextResponse.json({ success: false, error: "Minimum order amount is required." }, { status: 400 });
    }

    // Insert into DB
    await pool.query(
      `INSERT INTO promo_codes 
        (code, discount_percent, min_order_amount, max_discount_amount, is_active, description) 
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        discount_percent = VALUES(discount_percent), 
        min_order_amount = VALUES(min_order_amount), 
        max_discount_amount = VALUES(max_discount_amount),
        is_active = VALUES(is_active),
        description = VALUES(description)`,
      [
        finalCode,
        parseFloat(discount_percent),
        parseFloat(min_order_amount),
        max_discount_amount ? parseFloat(max_discount_amount) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        description || `${discount_percent}% OFF on orders of ₹${Number(min_order_amount).toLocaleString('en-IN')}+`
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Promo code '${finalCode}' created successfully!`,
      code: finalCode
    });
  } catch (err) {
    console.error("Failed to save promo code:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: Toggle status or update promo code
export async function PUT(req) {
  try {
    await ensurePromoTable();
    const body = await req.json();
    const { id, is_active, discount_percent, min_order_amount } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Promo Code ID required." }, { status: 400 });
    }

    if (is_active !== undefined) {
      await pool.query("UPDATE promo_codes SET is_active = ? WHERE id = ?", [is_active ? 1 : 0, id]);
    } else {
      await pool.query(
        "UPDATE promo_codes SET discount_percent = ?, min_order_amount = ? WHERE id = ?",
        [parseFloat(discount_percent), parseFloat(min_order_amount), id]
      );
    }

    return NextResponse.json({ success: true, message: "Promo code updated successfully." });
  } catch (err) {
    console.error("Failed to update promo code:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Remove promo code
export async function DELETE(req) {
  try {
    await ensurePromoTable();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    await pool.query("DELETE FROM promo_codes WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Promo code deleted successfully." });
  } catch (err) {
    console.error("Failed to delete promo code:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
