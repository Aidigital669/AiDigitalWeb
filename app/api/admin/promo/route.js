import { NextResponse } from "next/server";
import pool, { ensureAllTables } from "../../../../lib/db";
import { readFallback, writeFallback, upsertFallback, deleteFallback } from "../../../../lib/dbFallback";

const DEFAULT_PROMOS = [
  { id: 1, code: "SAVE5", discount_percent: "5.00", min_order_amount: "3000.00", max_discount_amount: null, is_active: 1, description: "5% OFF on orders of ₹3,000 or more" },
  { id: 2, code: "GROWTH10", discount_percent: "10.00", min_order_amount: "8000.00", max_discount_amount: null, is_active: 1, description: "10% OFF on orders of ₹8,000 or more" },
  { id: 3, code: "SCALE15", discount_percent: "15.00", min_order_amount: "15000.00", max_discount_amount: null, is_active: 1, description: "15% OFF on orders of ₹15,000 or more" }
];

// GET: Fetch all promo codes
export async function GET() {
  try {
    await ensureAllTables();
    const [rows] = await pool.query("SELECT * FROM promo_codes ORDER BY min_order_amount ASC, created_at DESC");
    if (Array.isArray(rows) && rows.length > 0) {
      writeFallback("promos", rows);
      return NextResponse.json({ success: true, promoCodes: rows });
    }

    const fallbackRows = readFallback("promos", DEFAULT_PROMOS);
    return NextResponse.json({ success: true, promoCodes: fallbackRows });
  } catch (err) {
    console.warn("[Admin promo GET] DB offline, using fallback:", err.message);
    const fallbackRows = readFallback("promos", DEFAULT_PROMOS);
    return NextResponse.json({ success: true, promoCodes: fallbackRows });
  }
}

// POST: Generate & Create a new promo code
export async function POST(req) {
  try {
    await ensureAllTables();
    const body = await req.json();
    const { code, discount_percent, min_order_amount, max_discount_amount, is_active, description } = body;

    let finalCode = (code || "").trim().toUpperCase();

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

    const newPromo = {
      id: Date.now(),
      code: finalCode,
      discount_percent: parseFloat(discount_percent),
      min_order_amount: parseFloat(min_order_amount),
      max_discount_amount: max_discount_amount ? parseFloat(max_discount_amount) : null,
      is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1,
      description: description || `${discount_percent}% OFF on orders of ₹${Number(min_order_amount).toLocaleString('en-IN')}+`
    };

    upsertFallback("promos", newPromo, "code");

    // Insert into DB
    try {
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
          newPromo.code,
          newPromo.discount_percent,
          newPromo.min_order_amount,
          newPromo.max_discount_amount,
          newPromo.is_active,
          newPromo.description
        ]
      );
    } catch (dbErr) {
      console.warn("[Admin Promo POST] MySQL insert warning (saved to JSON):", dbErr.message);
    }

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
    await ensureAllTables();
    const body = await req.json();
    const { id, is_active, discount_percent, min_order_amount } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Promo Code ID required." }, { status: 400 });
    }

    const updateObj = { id };
    if (is_active !== undefined) updateObj.is_active = is_active ? 1 : 0;
    if (discount_percent !== undefined) updateObj.discount_percent = parseFloat(discount_percent);
    if (min_order_amount !== undefined) updateObj.min_order_amount = parseFloat(min_order_amount);
    upsertFallback("promos", updateObj, "id");

    try {
      if (is_active !== undefined) {
        await pool.query("UPDATE promo_codes SET is_active = ? WHERE id = ?", [is_active ? 1 : 0, id]);
      } else {
        await pool.query(
          "UPDATE promo_codes SET discount_percent = ?, min_order_amount = ? WHERE id = ?",
          [parseFloat(discount_percent), parseFloat(min_order_amount), id]
        );
      }
    } catch (dbErr) {
      console.warn("[Admin Promo PUT] MySQL update warning:", dbErr.message);
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
    await ensureAllTables();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    deleteFallback("promos", id, "id");

    try {
      await pool.query("DELETE FROM promo_codes WHERE id = ?", [id]);
    } catch (dbErr) {
      console.warn("[Admin Promo DELETE] MySQL delete warning:", dbErr.message);
    }

    return NextResponse.json({ success: true, message: "Promo code deleted successfully." });
  } catch (err) {
    console.error("Failed to delete promo code:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
