export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

function checkAuth(req) {
  const session = req.cookies.get("admin_session");
  return session && session.value === "authenticated";
}

export async function GET(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let dbStatus = "online";
  let counts = {
    pricing_plans: 0,
    portfolio_items: 0,
    blogs: 0,
    whatsapp_logs: 0,
    payment_reminders: 0,
    total_visitors: 0,
    visitors_today: 0,
    live_online: 0,
  };

  try {
    const [pricingRows] = await pool.query("SELECT COUNT(*) as count FROM pricing_plans");
    counts.pricing_plans = pricingRows[0].count;

    const [portfolioRows] = await pool.query("SELECT COUNT(*) as count FROM portfolio_items");
    counts.portfolio_items = portfolioRows[0].count;

    const [blogRows] = await pool.query("SELECT COUNT(*) as count FROM blogs");
    counts.blogs = blogRows[0].count;

    try {
      const [waRows] = await pool.query("SELECT COUNT(*) as count FROM whatsapp_logs");
      counts.whatsapp_logs = waRows[0].count;
    } catch (e) {
      console.warn("Could not fetch whatsapp_logs count:", e.message);
    }

    try {
      const [remRows] = await pool.query("SELECT COUNT(*) as count FROM payment_reminders");
      counts.payment_reminders = remRows[0].count;
    } catch (e) {
      console.warn("Could not fetch payment_reminders count:", e.message);
    }

    try {
      const [visitorTotalRows] = await pool.query("SELECT COUNT(*) as count FROM website_visitors");
      counts.total_visitors = visitorTotalRows[0].count;

      const [visitorTodayRows] = await pool.query("SELECT COUNT(DISTINCT visitor_id) as count FROM website_visitors WHERE DATE(created_at) = CURDATE()");
      counts.visitors_today = visitorTodayRows[0].count;

      const [liveRows] = await pool.query("SELECT COUNT(DISTINCT visitor_id) as count FROM website_visitors WHERE last_active_at >= DATE_SUB(NOW(), INTERVAL 3 MINUTE)");
      counts.live_online = liveRows[0].count;
    } catch (e) {
      console.warn("Could not fetch website_visitors count:", e.message);
    }
  } catch (error) {
    console.error("Database status check error:", error);
    dbStatus = "offline";
  }


  return NextResponse.json({
    dbStatus,
    counts
  });
}
