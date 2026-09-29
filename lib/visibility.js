import pool from "./db";
import fs from "fs";
import path from "path";

const JSON_FILE_PATH = path.join(process.cwd(), "data", "visibilitySettings.json");

/**
 * Static in-memory catalog of all 40 default pages, sections and widgets.
 * Guaranteed to be available even if MySQL is offline or JSON file is not present on server.
 */
export const DEFAULT_STATIC_ITEMS = [
  { id: "page_home", type: "page", page_group: "home", name: "Home Page (/)", description: "Main landing page of the website", is_visible: true, sort_order: 1 },
  { id: "home_hero", type: "section", page_group: "home", name: "Hero Header & CTA", description: "Main headline, 3D HeroOrbit sphere, and primary CTA buttons", is_visible: true, sort_order: 2 },
  { id: "home_trust_strip", type: "section", page_group: "home", name: "Trust & Capabilities Strip", description: "Strip highlighting AI Strategy, Performance Tracking, Reporting & Execution", is_visible: true, sort_order: 3 },
  { id: "home_client_carousel", type: "section", page_group: "home", name: "Client Brands Carousel", description: "Continuous scrolling carousel of client brand logos", is_visible: true, sort_order: 4 },
  { id: "home_services", type: "section", page_group: "home", name: "Services & Campaigns", description: "Choose the Right Services with cards for Google Ads, Meta Ads, SEO Web, AI Video, Social", is_visible: true, sort_order: 5 },
  { id: "home_why_us", type: "section", page_group: "home", name: "Why Choose AI Digital", description: "6 core value pillars and AI market advantages", is_visible: true, sort_order: 6 },
  { id: "home_goal_selector", type: "section", page_group: "home", name: "Interactive Goal Selector", description: "Interactive business goal picker widget", is_visible: true, sort_order: 7 },
  { id: "home_insights", type: "section", page_group: "home", name: "Latest Insights / Blog Slider", description: "Horizontal carousel showcasing latest blog articles", is_visible: true, sort_order: 8 },
  { id: "home_testimonials", type: "section", page_group: "home", name: "Client Testimonials", description: "Client reviews, ratings, and quotes", is_visible: true, sort_order: 9 },
  { id: "home_faq", type: "section", page_group: "home", name: "FAQ Section", description: "Frequently asked questions accordion", is_visible: true, sort_order: 10 },
  { id: "home_contact", type: "section", page_group: "home", name: "Contact & Growth Audit Form", description: "Free growth audit inquiry form", is_visible: true, sort_order: 11 },

  { id: "page_pricing", type: "page", page_group: "pricing", name: "Pricing Page (/pricing)", description: "Dedicated pricing plans and packages page", is_visible: true, sort_order: 12 },
  { id: "pricing_subnav", type: "section", page_group: "pricing", name: "Category Sticky Navigation", description: "Quick anchor navigation buttons for all plan types", is_visible: true, sort_order: 13 },
  { id: "pricing_hero", type: "section", page_group: "pricing", name: "Pricing Hero Banner", description: "Header title and subtitle on pricing page", is_visible: true, sort_order: 14 },
  { id: "pricing_facebook", type: "section", page_group: "pricing", name: "Meta Ads Plans", description: "Facebook & Instagram advertising packages", is_visible: true, sort_order: 15 },
  { id: "pricing_google", type: "section", page_group: "pricing", name: "Google Ads Plans", description: "Google Search, PPC and performance marketing plans", is_visible: true, sort_order: 16 },
  { id: "pricing_combine", type: "section", page_group: "pricing", name: "Meta + Google Combine Plans", description: "Cross-platform unified marketing plans", is_visible: true, sort_order: 17 },
  { id: "pricing_websites", type: "section", page_group: "pricing", name: "Website Development Plans", description: "Static and dynamic high-performance website packages", is_visible: true, sort_order: 18 },
  { id: "pricing_creative", type: "section", page_group: "pricing", name: "Creative Content Packs", description: "Social media creatives, banners, and graphic design bundles", is_visible: true, sort_order: 19 },
  { id: "pricing_aivideo", type: "section", page_group: "pricing", name: "AI Video Production Plans", description: "AI-generated short-form video reels and commercial packs", is_visible: true, sort_order: 20 },
  { id: "pricing_realestate", type: "section", page_group: "pricing", name: "Real Estate Specialty Plans", description: "Tailored property marketing and lead generation solutions", is_visible: true, sort_order: 21 },
  { id: "pricing_faq", type: "section", page_group: "pricing", name: "Pricing FAQ Section", description: "Frequently asked questions about pricing and payments", is_visible: true, sort_order: 22 },

  { id: "page_portfolio", type: "page", page_group: "portfolio", name: "Portfolio Page (/portfolio)", description: "Client case studies and portfolio showcases", is_visible: true, sort_order: 23 },
  { id: "portfolio_showcase", type: "section", page_group: "portfolio", name: "Industry Metric Showcase", description: "Key client results with metrics (+142% organic traffic, 3.8x ROAS)", is_visible: true, sort_order: 24 },
  { id: "portfolio_featured", type: "section", page_group: "portfolio", name: "Featured Work Gallery", description: "Interactive tabs by industry (Real Estate, Healthcare, Finance, etc.)", is_visible: true, sort_order: 25 },

  { id: "page_blog", type: "page", page_group: "blog", name: "Blogs Page (/blog)", description: "Articles, industry updates, and digital marketing insights", is_visible: true, sort_order: 26 },
  { id: "blog_hero", type: "section", page_group: "blog", name: "Blog Header & Filter", description: "Header title and category filter tabs", is_visible: true, sort_order: 27 },
  { id: "blog_grid", type: "section", page_group: "blog", name: "Articles Grid & Pagination", description: "List of published blog articles with pagination", is_visible: true, sort_order: 28 },

  { id: "page_careers", type: "page", page_group: "careers", name: "Careers Page (/careers)", description: "Agency job openings and hiring application page", is_visible: true, sort_order: 29 },
  { id: "careers_hero", type: "section", page_group: "careers", name: "Careers Hero Banner", description: "\"Build the Future of Digital\" hero section", is_visible: true, sort_order: 30 },
  { id: "careers_perks", type: "section", page_group: "careers", name: "Perks & Culture Pillars", description: "Fast Growth, Great Culture, and Modern Tech highlights", is_visible: true, sort_order: 31 },
  { id: "careers_openings", type: "section", page_group: "careers", name: "Open Job Positions", description: "Job vacancy cards with experience requirements and direct apply buttons", is_visible: true, sort_order: 32 },
  { id: "careers_apply_modal", type: "section", page_group: "careers", name: "Job Application Modal", description: "Interactive modal form to apply for open positions", is_visible: true, sort_order: 33 },

  { id: "page_cart", type: "page", page_group: "checkout", name: "Cart Page (/cart)", description: "Shopping cart redirect and plan selection verification", is_visible: true, sort_order: 34 },
  { id: "page_checkout", type: "page", page_group: "checkout", name: "Checkout Page (/checkout)", description: "Secure order completion, promo code, and payment gateway", is_visible: true, sort_order: 35 },

  { id: "global_header", type: "widget", page_group: "global", name: "Top Navigation Header", description: "Global website header with logo, navigation links, and Contact CTA", is_visible: true, sort_order: 36 },
  { id: "global_footer", type: "widget", page_group: "global", name: "Global Website Footer", description: "Global footer with quick links, office address, and social profiles", is_visible: true, sort_order: 37 },
  { id: "widget_whatsapp", type: "widget", page_group: "global", name: "Floating WhatsApp Button", description: "Bottom-right floating WhatsApp quick chat button", is_visible: true, sort_order: 38 },
  { id: "widget_chat", type: "widget", page_group: "global", name: "AI Live Chatbot Widget", description: "Bottom floating AI digital marketing assistant popup", is_visible: true, sort_order: 39 },
  { id: "widget_back_to_top", type: "widget", page_group: "global", name: "Back To Top Button", description: "Floating button to smoothly scroll to top of page", is_visible: true, sort_order: 40 },
];

/**
 * Returns default dictionary { id: boolean }
 */
export function getDefaultSettingsMap() {
  const map = {};
  DEFAULT_STATIC_ITEMS.forEach((i) => {
    map[i.id] = i.is_visible;
  });
  return map;
}

/**
 * Read visibility settings from JSON fallback file or static catalog
 */
export function getJsonVisibilityFallback() {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const raw = fs.readFileSync(JSON_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read visibilitySettings.json:", err.message);
  }

  // Return static fallback with all 40 items
  return {
    updated_at: new Date().toISOString(),
    settings: getDefaultSettingsMap(),
    items: DEFAULT_STATIC_ITEMS
  };
}

/**
 * Write updated data to JSON fallback file
 */
export function saveJsonVisibilityFallback(data) {
  try {
    const dir = path.dirname(JSON_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const updatedData = {
      ...data,
      updated_at: new Date().toISOString()
    };
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(updatedData, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to save visibilitySettings.json:", err.message);
    return false;
  }
}

/**
 * Ensure site_visibility table exists in MySQL and seed default items if empty
 */
export async function ensureVisibilityTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS site_visibility (
      id VARCHAR(100) NOT NULL PRIMARY KEY,
      type ENUM('page', 'section', 'widget') NOT NULL DEFAULT 'section',
      page_group VARCHAR(100) NOT NULL,
      name VARCHAR(150) NOT NULL,
      description VARCHAR(255) DEFAULT NULL,
      is_visible TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await pool.query(createTableQuery);

    const [rows] = await pool.query("SELECT COUNT(*) as count FROM site_visibility");
    if (!rows || rows.length === 0 || rows[0].count === 0) {
      // Seed all 40 default items into site_visibility
      const initial = getJsonVisibilityFallback();
      const itemsToSeed = (initial.items && initial.items.length > 0) ? initial.items : DEFAULT_STATIC_ITEMS;
      for (const item of itemsToSeed) {
        await pool.query(
          `INSERT IGNORE INTO site_visibility 
           (id, type, page_group, name, description, is_visible, sort_order) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id,
            item.type || "section",
            item.page_group,
            item.name,
            item.description || null,
            item.is_visible !== undefined ? (item.is_visible ? 1 : 0) : 1,
            item.sort_order || 0
          ]
        );
      }
    }
  } catch (err) {
    if (err.code !== "ECONNREFUSED") {
      console.warn("Could not ensure site_visibility table:", err.message);
    }
  }
}

/**
 * Seed or re-seed all 40 default visibility elements into MySQL and JSON
 */
export async function seedAllDefaultVisibilityItems() {
  const settings = getDefaultSettingsMap();

  // Save to JSON fallback
  saveJsonVisibilityFallback({ settings, items: DEFAULT_STATIC_ITEMS });

  // Insert or update all default items in MySQL
  try {
    await ensureVisibilityTable();
    for (const item of DEFAULT_STATIC_ITEMS) {
      await pool.query(
        `INSERT INTO site_visibility 
         (id, type, page_group, name, description, is_visible, sort_order) 
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          type = VALUES(type),
          page_group = VALUES(page_group),
          name = VALUES(name),
          description = VALUES(description),
          sort_order = VALUES(sort_order)`,
        [
          item.id,
          item.type || "section",
          item.page_group,
          item.name,
          item.description || null,
          item.is_visible !== undefined ? (item.is_visible ? 1 : 0) : 1,
          item.sort_order || 0
        ]
      );
    }
  } catch (err) {
    console.warn("Could not seed default items into MySQL:", err.message);
  }

  return { items: DEFAULT_STATIC_ITEMS, settings };
}

/**
 * Fetch full visibility items list (for Admin)
 */
export async function getAllVisibilityItems() {
  try {
    await ensureVisibilityTable();
    const [rows] = await pool.query("SELECT * FROM site_visibility ORDER BY sort_order ASC, id ASC");
    if (rows && rows.length > 0) {
      const items = rows.map((r) => ({
        ...r,
        is_visible: Boolean(r.is_visible)
      }));

      const settings = {};
      items.forEach((item) => {
        settings[item.id] = item.is_visible;
      });

      // Keep JSON in sync
      saveJsonVisibilityFallback({ settings, items });

      return { items, settings };
    } else {
      // Table exists but is empty! Automatically seed all default items
      console.log("site_visibility table in MySQL is empty, auto-seeding defaults...");
      return await seedAllDefaultVisibilityItems();
    }
  } catch (err) {
    console.warn("DB offline or error fetching site_visibility, using static fallback:", err.message);
  }

  // Fallback to JSON or in-code static items
  const fallback = getJsonVisibilityFallback();
  const items = fallback.items && fallback.items.length > 0 ? fallback.items : DEFAULT_STATIC_ITEMS;
  const settings = fallback.settings && Object.keys(fallback.settings).length > 0 ? fallback.settings : getDefaultSettingsMap();

  return { items, settings };
}

/**
 * Fetch key-value settings map (for Frontend fast lookup)
 */
export async function getVisibilitySettings() {
  try {
    await ensureVisibilityTable();
    const [rows] = await pool.query("SELECT id, is_visible FROM site_visibility");
    if (rows && rows.length > 0) {
      const settings = {};
      rows.forEach((r) => {
        settings[r.id] = Boolean(r.is_visible);
      });
      return settings;
    }
  } catch (err) {
    // DB offline, fall back to JSON/static
  }

  const fallback = getJsonVisibilityFallback();
  if (fallback.settings && Object.keys(fallback.settings).length > 0) {
    return fallback.settings;
  }
  return getDefaultSettingsMap();
}

/**
 * Update visibility for a single item
 */
export async function updateVisibilityItem(id, is_visible) {
  const boolVal = Boolean(is_visible);

  // 1. Update JSON fallback
  const current = getJsonVisibilityFallback();
  current.settings = current.settings || {};
  current.settings[id] = boolVal;

  if (current.items && Array.isArray(current.items)) {
    const it = current.items.find((i) => i.id === id);
    if (it) it.is_visible = boolVal;
  }
  saveJsonVisibilityFallback(current);

  // 2. Update DB
  try {
    await ensureVisibilityTable();
    await pool.query(
      "UPDATE site_visibility SET is_visible = ? WHERE id = ?",
      [boolVal ? 1 : 0, id]
    );
  } catch (err) {
    console.warn("Could not update site_visibility in DB:", err.message);
  }

  return { success: true, id, is_visible: boolVal };
}

/**
 * Bulk update multiple items
 */
export async function updateBulkVisibility(ids, is_visible) {
  const boolVal = Boolean(is_visible);

  // 1. Update JSON
  const current = getJsonVisibilityFallback();
  current.settings = current.settings || {};
  if (current.items && Array.isArray(current.items)) {
    current.items.forEach((item) => {
      if (ids.includes(item.id)) {
        item.is_visible = boolVal;
        current.settings[item.id] = boolVal;
      }
    });
  }
  saveJsonVisibilityFallback(current);

  // 2. Update DB
  try {
    await ensureVisibilityTable();
    const placeholders = ids.map(() => "?").join(",");
    await pool.query(
      `UPDATE site_visibility SET is_visible = ? WHERE id IN (${placeholders})`,
      [boolVal ? 1 : 0, ...ids]
    );
  } catch (err) {
    console.warn("Could not bulk update site_visibility in DB:", err.message);
  }

  return { success: true, updatedCount: ids.length, is_visible: boolVal };
}

/**
 * Update all items belonging to a page group
 */
export async function updateGroupVisibility(page_group, is_visible) {
  const boolVal = Boolean(is_visible);

  // 1. Update JSON
  const current = getJsonVisibilityFallback();
  current.settings = current.settings || {};

  if (current.items && Array.isArray(current.items)) {
    current.items.forEach((item) => {
      if (item.page_group === page_group) {
        item.is_visible = boolVal;
        current.settings[item.id] = boolVal;
      }
    });
  }
  saveJsonVisibilityFallback(current);

  // 2. Update DB
  try {
    await ensureVisibilityTable();
    await pool.query(
      "UPDATE site_visibility SET is_visible = ? WHERE page_group = ?",
      [boolVal ? 1 : 0, page_group]
    );
  } catch (err) {
    console.warn("Could not update group site_visibility in DB:", err.message);
  }

  return { success: true, page_group, is_visible: boolVal };
}

/**
 * Reset all items to visible
 */
export async function resetAllVisibility() {
  const current = getJsonVisibilityFallback();
  current.settings = current.settings || {};

  if (current.items && Array.isArray(current.items)) {
    current.items.forEach((item) => {
      item.is_visible = true;
      current.settings[item.id] = true;
    });
  } else {
    current.items = DEFAULT_STATIC_ITEMS.map((i) => ({ ...i, is_visible: true }));
    current.settings = getDefaultSettingsMap();
  }
  saveJsonVisibilityFallback(current);

  try {
    await ensureVisibilityTable();
    await pool.query("UPDATE site_visibility SET is_visible = 1");
  } catch (err) {
    console.warn("Could not reset site_visibility in DB:", err.message);
  }

  return { success: true };
}

/**
 * Add or update custom item
 */
export async function upsertCustomVisibilityItem(itemData) {
  const { id, type = "section", page_group = "custom", name, description = "", is_visible = true } = itemData;
  const boolVal = Boolean(is_visible);

  const current = getJsonVisibilityFallback();
  current.settings = current.settings || {};
  current.settings[id] = boolVal;
  current.items = current.items || [];

  const existingIdx = current.items.findIndex((i) => i.id === id);
  const newItem = {
    id,
    type,
    page_group,
    name: name || id,
    description,
    is_visible: boolVal,
    sort_order: existingIdx >= 0 ? current.items[existingIdx].sort_order : current.items.length + 1
  };

  if (existingIdx >= 0) {
    current.items[existingIdx] = newItem;
  } else {
    current.items.push(newItem);
  }

  saveJsonVisibilityFallback(current);

  try {
    await ensureVisibilityTable();
    await pool.query(
      `INSERT INTO site_visibility (id, type, page_group, name, description, is_visible, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        type = VALUES(type),
        page_group = VALUES(page_group),
        name = VALUES(name),
        description = VALUES(description),
        is_visible = VALUES(is_visible)`,
      [id, type, page_group, name || id, description, boolVal ? 1 : 0, newItem.sort_order]
    );
  } catch (err) {
    console.warn("Could not upsert site_visibility in DB:", err.message);
  }

  return { success: true, item: newItem };
}
