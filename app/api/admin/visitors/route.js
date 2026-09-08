import { NextResponse } from "next/server";
import pool, { ensureVisitorsTable } from "../../../../lib/db";

function checkAuth(req) {
  const session = req.cookies.get("admin_session");
  return session && session.value === "authenticated";
}

// Build date range filter SQL
function getDateRangeFilter(range) {
  switch (range) {
    case "today":
      return "DATE(created_at) = CURDATE()";
    case "yesterday":
      return "DATE(created_at) = SUBDATE(CURDATE(), 1)";
    case "7d":
      return "created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    case "30d":
      return "created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    case "all":
    default:
      return "1=1";
  }
}

export async function GET(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureVisitorsTable();

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "today";
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)));
    const offset = (page - 1) * limit;

    const dateSql = getDateRangeFilter(range);

    // 1. Real-time Live Visitors (Active in the last 3 minutes)
    const [liveRows] = await pool.query(`
      SELECT COUNT(DISTINCT visitor_id) as count 
      FROM website_visitors 
      WHERE last_active_at >= DATE_SUB(NOW(), INTERVAL 3 MINUTE)
    `);
    const liveOnline = liveRows[0]?.count || 0;

    // 2. Summary stats for the selected time range
    const [summaryRows] = await pool.query(`
      SELECT 
        COUNT(*) as total_pageviews,
        COUNT(DISTINCT visitor_id) as unique_visitors,
        COUNT(DISTINCT session_id) as total_sessions,
        SUM(CASE WHEN is_new_visitor = 1 THEN 1 ELSE 0 END) as new_visitors,
        COALESCE(AVG(duration_seconds), 0) as avg_duration
      FROM website_visitors
      WHERE ${dateSql}
    `);
    const summary = summaryRows[0] || {
      total_pageviews: 0,
      unique_visitors: 0,
      total_sessions: 0,
      new_visitors: 0,
      avg_duration: 0,
    };

    // 3. Traffic Trend (Hourly if today/yesterday, Daily if 7d/30d/all)
    let trendRows = [];
    if (range === "today" || range === "yesterday") {
      [trendRows] = await pool.query(`
        SELECT 
          DATE_FORMAT(created_at, '%H:00') as label,
          HOUR(created_at) as hour_num,
          COUNT(*) as views,
          COUNT(DISTINCT visitor_id) as visitors
        FROM website_visitors
        WHERE ${dateSql}
        GROUP BY HOUR(created_at), DATE_FORMAT(created_at, '%H:00')
        ORDER BY HOUR(created_at) ASC
      `);
    } else {
      [trendRows] = await pool.query(`
        SELECT 
          DATE_FORMAT(created_at, '%b %d') as label,
          DATE(created_at) as date_val,
          COUNT(*) as views,
          COUNT(DISTINCT visitor_id) as visitors
        FROM website_visitors
        WHERE ${dateSql}
        GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%b %d')
        ORDER BY DATE(created_at) ASC
      `);
    }

    // 4. Device Breakdown
    const [deviceRows] = await pool.query(`
      SELECT 
        COALESCE(device_type, 'Desktop') as device,
        COUNT(*) as count
      FROM website_visitors
      WHERE ${dateSql}
      GROUP BY device_type
      ORDER BY count DESC
    `);

    // 5. Operating System Breakdown
    const [osRows] = await pool.query(`
      SELECT 
        COALESCE(os, 'Other') as os,
        COUNT(*) as count
      FROM website_visitors
      WHERE ${dateSql}
      GROUP BY os
      ORDER BY count DESC
      LIMIT 6
    `);

    // 6. Browser Breakdown
    const [browserRows] = await pool.query(`
      SELECT 
        COALESCE(browser, 'Other') as browser,
        COUNT(*) as count
      FROM website_visitors
      WHERE ${dateSql}
      GROUP BY browser
      ORDER BY count DESC
      LIMIT 6
    `);

    // 7. Top Visited Pages
    const [topPagesRows] = await pool.query(`
      SELECT 
        page_path,
        MAX(page_title) as page_title,
        COUNT(*) as views,
        COUNT(DISTINCT visitor_id) as visitors,
        COALESCE(AVG(duration_seconds), 0) as avg_time
      FROM website_visitors
      WHERE ${dateSql}
      GROUP BY page_path
      ORDER BY views DESC
      LIMIT 10
    `);

    // 8. Top Traffic Sources / Referrers
    const [topSourcesRows] = await pool.query(`
      SELECT 
        CASE 
          WHEN utm_source IS NOT NULL AND utm_source != '' THEN CONCAT('Campaign / ', utm_source)
          WHEN referrer IS NULL OR referrer = '' OR referrer = 'Direct' THEN 'Direct / Bookmark'
          WHEN referrer LIKE '%google.%' THEN 'Google Search'
          WHEN referrer LIKE '%instagram.%' THEN 'Instagram'
          WHEN referrer LIKE '%facebook.%' OR referrer LIKE '%fb.com%' THEN 'Facebook'
          WHEN referrer LIKE '%youtube.%' THEN 'YouTube'
          WHEN referrer LIKE '%linkedin.%' THEN 'LinkedIn'
          WHEN referrer LIKE '%twitter.%' OR referrer LIKE '%t.co%' THEN 'Twitter / X'
          WHEN referrer LIKE '%whatsapp%' THEN 'WhatsApp'
          WHEN referrer = 'Internal Navigation' THEN 'Internal Navigation'
          ELSE SUBSTRING_INDEX(SUBSTRING_INDEX(referrer, '/', 3), '://', -1)
        END as source_name,
        COUNT(*) as count
      FROM website_visitors
      WHERE ${dateSql}
      GROUP BY source_name
      ORDER BY count DESC
      LIMIT 10
    `);

    // 9. Top Countries
    const [topCountriesRows] = await pool.query(`
      SELECT 
        country,
        country_code,
        COUNT(*) as count
      FROM website_visitors
      WHERE ${dateSql} AND country IS NOT NULL AND country != ''
      GROUP BY country, country_code
      ORDER BY count DESC
      LIMIT 10
    `);

    // 10. Top Cities
    const [topCitiesRows] = await pool.query(`
      SELECT 
        city,
        country,
        country_code,
        COUNT(*) as count
      FROM website_visitors
      WHERE ${dateSql} AND city IS NOT NULL AND city != '' AND city != 'Unknown'
      GROUP BY city, country, country_code
      ORDER BY count DESC
      LIMIT 10
    `);

    // 11. Granular Searchable Visitor Logs with Pagination
    let searchCondition = "";
    const queryParams = [];

    if (search) {
      searchCondition = `AND (
        ip_address LIKE ? OR 
        country LIKE ? OR 
        city LIKE ? OR 
        page_path LIKE ? OR 
        page_title LIKE ? OR 
        referrer LIKE ? OR 
        browser LIKE ? OR 
        os LIKE ? OR 
        utm_source LIKE ? OR 
        utm_campaign LIKE ?
      )`;
      const wild = `%${search}%`;
      for (let i = 0; i < 10; i++) queryParams.push(wild);
    }

    const [countRows] = await pool.query(`
      SELECT COUNT(*) as total
      FROM website_visitors
      WHERE ${dateSql} ${searchCondition}
    `, queryParams);
    const totalLogs = countRows[0]?.total || 0;

    const [logRows] = await pool.query(`
      SELECT 
        id, visitor_id, session_id, ip_address, country, country_code, city, region,
        device_type, browser, os, page_url, page_path, page_title,
        referrer, utm_source, utm_medium, utm_campaign,
        screen_resolution, language, duration_seconds, is_new_visitor,
        last_active_at, created_at,
        CASE WHEN last_active_at >= DATE_SUB(NOW(), INTERVAL 3 MINUTE) THEN 1 ELSE 0 END as is_online
      FROM website_visitors
      WHERE ${dateSql} ${searchCondition}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    const totalSessions = Number(summary.total_sessions) || 0;
    const totalPageviews = Number(summary.total_pageviews) || 0;
    const bounceRate = totalSessions > 0
      ? Math.round(Math.max(0, Math.min(100, ((totalSessions - (totalPageviews - totalSessions)) / totalSessions) * 100)))
      : 0;

    return NextResponse.json({
      success: true,
      range,
      liveOnline,
      summary: {
        totalPageviews,
        uniqueVisitors: Number(summary.unique_visitors) || 0,
        totalSessions,
        newVisitors: Number(summary.new_visitors) || 0,
        avgDurationSeconds: Math.round(Number(summary.avg_duration) || 0),
        bounceRate,
      },
      charts: {
        trend: trendRows,
        devices: deviceRows,
        os: osRows,
        browsers: browserRows,
        topPages: topPagesRows,
        topSources: topSourcesRows,
        topCountries: topCountriesRows,
        topCities: topCitiesRows,
      },
      logs: logRows,
      pagination: {
        page,
        limit,
        total: totalLogs,
        totalPages: Math.ceil(totalLogs / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Admin visitors fetch error:", error.message || error);
    return NextResponse.json({
      success: false,
      dbStatus: "offline",
      error: "MySQL database is offline or not running. Please start MySQL in XAMPP.",
      range: "today",
      liveOnline: 0,
      summary: {
        totalPageviews: 0,
        uniqueVisitors: 0,
        totalSessions: 0,
        newVisitors: 0,
        avgDurationSeconds: 0,
        bounceRate: 0,
      },
      charts: {
        trend: [],
        devices: [],
        os: [],
        browsers: [],
        topPages: [],
        topSources: [],
        topCountries: [],
        topCities: [],
      },
      logs: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 1,
      },
    }, { status: 200 });
  }
}

export async function DELETE(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action");

    if (id) {
      await pool.query("DELETE FROM website_visitors WHERE id = ?", [id]);
      return NextResponse.json({ success: true, message: "Visitor log deleted" });
    }

    if (action === "clear_all") {
      await pool.query("TRUNCATE TABLE website_visitors");
      return NextResponse.json({ success: true, message: "All visitor logs cleared" });
    }

    if (action === "clean_old") {
      await pool.query("DELETE FROM website_visitors WHERE created_at < DATE_SUB(NOW(), INTERVAL 60 DAY)");
      return NextResponse.json({ success: true, message: "Cleared visitor logs older than 60 days" });
    }

    return NextResponse.json({ error: "Invalid delete action" }, { status: 400 });
  } catch (error) {
    console.error("Admin visitors delete error:", error);
    return NextResponse.json({ error: "Failed to delete visitor logs" }, { status: 500 });
  }
}
