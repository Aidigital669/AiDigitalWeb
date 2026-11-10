import { NextResponse } from "next/server";
import pool, { ensureAllTables } from "../../../../lib/db";
import { readFallback } from "../../../../lib/dbFallback";
import path from "path";
import fs from "fs";

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
    onboarding_details: 0,
    job_applications: 0,
    promo_codes: 0,
    total_visitors: 0,
    visitors_today: 0,
    live_online: 0,
  };

  try {
    await ensureAllTables();

    // 1. pricing_plans
    try {
      const [pricingRows] = await pool.query("SELECT COUNT(*) as count FROM pricing_plans");
      counts.pricing_plans = pricingRows[0]?.count || 0;
    } catch (e) {}

    // 2. portfolio_items
    try {
      const [portfolioRows] = await pool.query("SELECT COUNT(*) as count FROM portfolio_items");
      counts.portfolio_items = portfolioRows[0]?.count || 0;
    } catch (e) {}

    // 3. blogs
    try {
      const [blogRows] = await pool.query("SELECT COUNT(*) as count FROM blogs");
      counts.blogs = blogRows[0]?.count || 0;
    } catch (e) {}

    // 4. whatsapp_logs
    try {
      const [waRows] = await pool.query("SELECT COUNT(*) as count FROM whatsapp_logs");
      counts.whatsapp_logs = waRows[0]?.count || 0;
    } catch (e) {}

    // 5. payment_reminders
    try {
      const [remRows] = await pool.query("SELECT COUNT(*) as count FROM payment_reminders");
      counts.payment_reminders = remRows[0]?.count || 0;
    } catch (e) {}

    // 6. onboarding_details
    try {
      const [onbRows] = await pool.query("SELECT COUNT(*) as count FROM onboarding_details");
      counts.onboarding_details = onbRows[0]?.count || 0;
    } catch (e) {}

    // 7. job_applications
    try {
      const [appRows] = await pool.query("SELECT COUNT(*) as count FROM job_applications");
      counts.job_applications = appRows[0]?.count || 0;
    } catch (e) {}

    // 8. promo_codes
    try {
      const [promoRows] = await pool.query("SELECT COUNT(*) as count FROM promo_codes");
      counts.promo_codes = promoRows[0]?.count || 0;
    } catch (e) {}

    // 9. website_visitors
    try {
      const [visitorTotalRows] = await pool.query("SELECT COUNT(*) as count FROM website_visitors");
      counts.total_visitors = visitorTotalRows[0]?.count || 0;

      const [visitorTodayRows] = await pool.query("SELECT COUNT(DISTINCT visitor_id) as count FROM website_visitors WHERE DATE(created_at) = CURDATE()");
      counts.visitors_today = visitorTodayRows[0]?.count || 0;

      const [liveRows] = await pool.query("SELECT COUNT(DISTINCT visitor_id) as count FROM website_visitors WHERE last_active_at >= DATE_SUB(NOW(), INTERVAL 3 MINUTE)");
      counts.live_online = liveRows[0]?.count || 0;
    } catch (e) {}
  } catch (error) {
    console.warn("[Admin Stats] MySQL connection error, calculating offline counts:", error.message);
    dbStatus = "offline";

    // Read from fallback files
    counts.payment_reminders = readFallback("reminders", []).length;
    counts.onboarding_details = readFallback("onboarding", []).length;
    counts.job_applications = readFallback("applications", []).length;
    counts.promo_codes = readFallback("promos", []).length;

    try {
      const portfolioFile = path.join(process.cwd(), "data", "portfolioData.json");
      if (fs.existsSync(portfolioFile)) {
        const pData = JSON.parse(fs.readFileSync(portfolioFile, "utf-8"));
        counts.portfolio_items = (pData.showcaseProjects?.length || 0) + (pData.otherProjects?.length || 0);
      }
    } catch (e) {}

    try {
      const pricingFile = path.join(process.cwd(), "data", "pricingData.json");
      if (fs.existsSync(pricingFile)) {
        const prData = JSON.parse(fs.readFileSync(pricingFile, "utf-8"));
        let totalPlans = 0;
        Object.values(prData).forEach(cat => {
          if (Array.isArray(cat)) totalPlans += cat.length;
        });
        counts.pricing_plans = totalPlans;
      }
    } catch (e) {}
  }

  return NextResponse.json({
    dbStatus,
    counts,
  });
}
