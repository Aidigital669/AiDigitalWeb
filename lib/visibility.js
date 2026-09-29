import pool from "./db";
import fs from "fs";
import path from "path";

const JSON_FILE_PATH = path.join(process.cwd(), "data", "visibilitySettings.json");

/**
 * Read visibility settings from JSON fallback file
 */
export function getJsonVisibilityFallback() {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const raw = fs.readFileSync(JSON_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to read visibilitySettings.json:", err.message);
  }
  return { settings: {}, items: [] };
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
    if (rows[0].count === 0) {
      // Seed from JSON file
      const initial = getJsonVisibilityFallback();
      if (initial.items && initial.items.length > 0) {
        for (const item of initial.items) {
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
    }
  } catch (err) {
    // If DB is offline, log warning and let JSON file handle it
    if (err.code !== "ECONNREFUSED") {
      console.warn("Could not ensure site_visibility table:", err.message);
    }
  }
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
    }
  } catch (err) {
    console.warn("DB offline or error fetching site_visibility, using JSON fallback:", err.message);
  }

  // Fallback to JSON
  const fallback = getJsonVisibilityFallback();
  return {
    items: fallback.items || [],
    settings: fallback.settings || {}
  };
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
    // DB offline, fall back to JSON
  }

  const fallback = getJsonVisibilityFallback();
  return fallback.settings || {};
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
    const item = current.items.find((i) => i.id === id);
    if (item) {
      item.is_visible = boolVal;
    }
  }
  saveJsonVisibilityFallback(current);

  // 2. Update DB
  try {
    await ensureVisibilityTable();
    await pool.query("UPDATE site_visibility SET is_visible = ? WHERE id = ?", [boolVal ? 1 : 0, id]);
  } catch (err) {
    console.warn("Could not update site_visibility in DB:", err.message);
  }

  return { success: true, id, is_visible: boolVal };
}

/**
 * Update multiple items by ids
 */
export async function updateBulkVisibility(ids, is_visible) {
  const boolVal = Boolean(is_visible);
  if (!Array.isArray(ids) || ids.length === 0) return { success: false };

  // 1. Update JSON
  const current = getJsonVisibilityFallback();
  current.settings = current.settings || {};
  ids.forEach((id) => {
    current.settings[id] = boolVal;
  });

  if (current.items && Array.isArray(current.items)) {
    current.items.forEach((item) => {
      if (ids.includes(item.id)) {
        item.is_visible = boolVal;
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
