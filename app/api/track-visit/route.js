import { NextResponse } from "next/server";
import pool, { ensureVisitorsTable } from "../../../lib/db";

// In-memory cache for IP geolocations (prevents redundant API lookups)
const ipGeoCache = new Map();

// Helper to extract clean IP address
function getClientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim());
    if (ips[0] && !ips[0].startsWith("127.") && ips[0] !== "::1") {
      return ips[0];
    }
  }
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

// Helper to determine if IP is private/local
function isPrivateIp(ip) {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return true;
  if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.16.") || ip.startsWith("fe80:")) return true;
  return false;
}

// IP Geolocation resolver
async function resolveGeo(ip, cfCountry = null) {
  if (isPrivateIp(ip)) {
    return {
      country: "Local / Development",
      country_code: "IN",
      city: "Localhost",
      region: "Internal",
    };
  }

  if (ipGeoCache.has(ip)) {
    return ipGeoCache.get(ip);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.status === "success") {
        const geo = {
          country: data.country || "Unknown",
          country_code: data.countryCode || "UN",
          city: data.city || "Unknown",
          region: data.regionName || "",
        };
        // Keep cache bounded
        if (ipGeoCache.size > 2000) ipGeoCache.clear();
        ipGeoCache.set(ip, geo);
        return geo;
      }
    }
  } catch (e) {
    // If external service fails, fallback to Cloudflare header or default
  }

  const fallback = {
    country: cfCountry || "Unknown",
    country_code: cfCountry || "UN",
    city: "Unknown",
    region: "",
  };
  return fallback;
}

// User-Agent parser for device, browser, OS
function parseUserAgent(ua) {
  if (!ua) {
    return { device_type: "Desktop", browser: "Unknown", os: "Unknown" };
  }

  let device_type = "Desktop";
  if (/mobile/i.test(ua)) device_type = "Mobile";
  else if (/tablet|ipad/i.test(ua)) device_type = "Tablet";

  let browser = "Other";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";

  let os = "Other";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { device_type, browser, os };
}

// POST: Record new page visit
export async function POST(req) {
  try {
    await ensureVisitorsTable();

    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const {
      visitor_id,
      session_id,
      is_new_visitor = 1,
      page_url = "",
      page_path = "/",
      page_title = "",
      referrer = "Direct",
      utm_source = "",
      utm_medium = "",
      utm_campaign = "",
      screen_resolution = "",
      language = "",
    } = body;

    // Skip tracking if visitor_id is absent
    if (!visitor_id || !session_id) {
      return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
    }

    // Skip tracking for admin paths
    if (page_path.startsWith("/admin") || page_path.startsWith("/api")) {
      return NextResponse.json({ skipped: true });
    }

    // Skip tracking if request comes from an authenticated admin session
    const adminSession = req.cookies.get("admin_session");
    if (adminSession && adminSession.value === "authenticated") {
      return NextResponse.json({ skipped: true, reason: "admin_session" });
    }

    const ip = getClientIp(req);
    const cfCountry = req.headers.get("cf-ipcountry");
    const userAgent = req.headers.get("user-agent") || "";
    const { device_type, browser, os } = parseUserAgent(userAgent);
    const geo = await resolveGeo(ip, cfCountry);

    // Format clean referrer
    let cleanReferrer = referrer;
    if (cleanReferrer && cleanReferrer.includes(req.headers.get("host") || "aidigital.biz")) {
      cleanReferrer = "Internal Navigation";
    }

    const [result] = await pool.query(
      `INSERT INTO website_visitors (
        visitor_id, session_id, ip_address, country, country_code, city, region,
        device_type, browser, os, page_url, page_path, page_title,
        referrer, utm_source, utm_medium, utm_campaign,
        screen_resolution, language, duration_seconds, is_new_visitor, last_active_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, NOW())`,
      [
        visitor_id.substring(0, 64),
        session_id.substring(0, 64),
        ip.substring(0, 64),
        geo.country.substring(0, 100),
        geo.country_code.substring(0, 10),
        geo.city.substring(0, 100),
        geo.region.substring(0, 100),
        device_type,
        browser,
        os,
        page_url.substring(0, 500),
        page_path.substring(0, 255),
        page_title.substring(0, 255),
        cleanReferrer ? cleanReferrer.substring(0, 500) : "Direct",
        utm_source ? utm_source.substring(0, 100) : null,
        utm_medium ? utm_medium.substring(0, 100) : null,
        utm_campaign ? utm_campaign.substring(0, 100) : null,
        screen_resolution ? screen_resolution.substring(0, 30) : null,
        language ? language.substring(0, 30) : null,
        is_new_visitor ? 1 : 0,
      ]
    );

    return NextResponse.json({ success: true, record_id: result.insertId });
  } catch (error) {
    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      return NextResponse.json({ skipped: true, reason: "db_offline" }, { status: 200 });
    }
    console.warn("Track visit error:", error.message || error);
    return NextResponse.json({ skipped: true, reason: "error" }, { status: 200 });
  }
}

// PUT: Update heartbeat and time-on-page
export async function PUT(req) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { record_id, visitor_id, session_id, duration_seconds = 0 } = body;

    if (record_id) {
      await pool.query(
        `UPDATE website_visitors SET duration_seconds = ?, last_active_at = NOW() WHERE id = ?`,
        [Math.max(0, parseInt(duration_seconds, 10) || 0), record_id]
      );
    } else if (visitor_id && session_id) {
      await pool.query(
        `UPDATE website_visitors SET duration_seconds = ?, last_active_at = NOW() WHERE visitor_id = ? AND session_id = ? ORDER BY id DESC LIMIT 1`,
        [Math.max(0, parseInt(duration_seconds, 10) || 0), visitor_id, session_id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      return NextResponse.json({ skipped: true, reason: "db_offline" }, { status: 200 });
    }
    return NextResponse.json({ skipped: true, reason: "error" }, { status: 200 });
  }
}
