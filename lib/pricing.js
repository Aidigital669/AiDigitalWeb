import fs from "fs";
import path from "path";
import pool from "./db";
import {
  googlePlans,
  facebookPlans,
  combinePlans,
  websitePlans,
  creativePacks,
  aiVideoPlans,
  realEstatePlans
} from "../app/pricing/pricingData";

const defaultPricingData = {
  googlePlans,
  facebookPlans,
  combinePlans,
  websitePlans,
  creativePacks,
  aiVideoPlans,
  realEstatePlans
};

function getJsonFilePath() {
  return path.join(process.cwd(), "data", "pricingData.json");
}

export function getPricingFromJson() {
  try {
    const filePath = getJsonFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        ...defaultPricingData,
        ...parsed
      };
    }
  } catch (err) {
    console.warn("Could not read data/pricingData.json:", err.message);
  }
  return defaultPricingData;
}

export async function ensurePricingTable(connection) {
  const query = `
    CREATE TABLE IF NOT EXISTS pricing_plans (
      id VARCHAR(64) NOT NULL,
      category VARCHAR(50) NOT NULL,
      platform VARCHAR(100) DEFAULT NULL,
      badge_class VARCHAR(50) DEFAULT NULL,
      level VARCHAR(100) NOT NULL,
      pill_class VARCHAR(50) DEFAULT NULL,
      price VARCHAR(50) NOT NULL,
      period VARCHAR(50) DEFAULT '',
      features JSON NOT NULL,
      button_text VARCHAR(100) DEFAULT 'Select Plan',
      is_popular TINYINT(1) DEFAULT 0,
      service_name VARCHAR(100) DEFAULT NULL,
      plan_parameter VARCHAR(255) DEFAULT NULL,
      tag_class VARCHAR(50) DEFAULT NULL,
      is_highlight TINYINT(1) DEFAULT 0,
      highlight_styles JSON DEFAULT NULL,
      sort_order INT DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  await connection.query(query);
}

export async function syncPricingToDb(connection, data) {
  await ensurePricingTable(connection);
  await connection.query("DELETE FROM pricing_plans");

  const categories = Object.keys(data);
  for (const category of categories) {
    const plans = data[category];
    if (!Array.isArray(plans)) continue;

    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      const id = plan.id || `${category}_${i}_${Date.now()}`;
      await connection.query(
        `INSERT INTO pricing_plans 
        (id, category, platform, badge_class, level, pill_class, price, period, features, button_text, is_popular, service_name, plan_parameter, tag_class, is_highlight, highlight_styles, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          category,
          plan.platform || null,
          plan.badgeClass || null,
          plan.level || "Plan",
          plan.pillClass || null,
          String(plan.price || "0"),
          plan.period || "",
          JSON.stringify(plan.features || []),
          plan.buttonText || "Select Plan",
          plan.isPopular ? 1 : 0,
          plan.serviceName || null,
          plan.planParameter || null,
          plan.tagClass || null,
          plan.isHighlight ? 1 : 0,
          plan.highlightStyles ? JSON.stringify(plan.highlightStyles) : null,
          i
        ]
      );
    }
  }
}

export async function getPricingPlans() {
  // 1. Try reading from MySQL
  try {
    const connection = await pool.getConnection();
    try {
      await ensurePricingTable(connection);
      const [rows] = await connection.query("SELECT * FROM pricing_plans ORDER BY sort_order ASC");
      if (rows && rows.length > 0) {
        const grouped = {
          googlePlans: [],
          facebookPlans: [],
          combinePlans: [],
          websitePlans: [],
          creativePacks: [],
          aiVideoPlans: [],
          realEstatePlans: []
        };

        for (const row of rows) {
          const category = row.category;
          if (!grouped[category]) grouped[category] = [];
          
          let features = [];
          try {
            features = typeof row.features === "string" ? JSON.parse(row.features) : row.features;
          } catch (e) {
            features = [];
          }

          let highlightStyles = undefined;
          if (row.highlight_styles) {
            try {
              highlightStyles = typeof row.highlight_styles === "string" ? JSON.parse(row.highlight_styles) : row.highlight_styles;
            } catch (e) {}
          }

          grouped[category].push({
            id: row.id,
            platform: row.platform,
            badgeClass: row.badge_class,
            level: row.level,
            pillClass: row.pill_class,
            price: isNaN(Number(row.price)) ? row.price : Number(row.price),
            period: row.period,
            features: features || [],
            buttonText: row.button_text,
            isPopular: Boolean(row.is_popular),
            serviceName: row.service_name,
            planParameter: row.plan_parameter,
            tagClass: row.tag_class,
            isHighlight: Boolean(row.is_highlight),
            highlightStyles
          });
        }
        return grouped;
      }
    } finally {
      connection.release();
    }
  } catch (err) {
    // MySQL not reachable or error, continue to fallback
  }

  // 2. Fallback to JSON file
  return getPricingFromJson();
}

export async function saveAllPricingPlans(data) {
  // 1. Always save to data/pricingData.json
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const filePath = getJsonFilePath();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

  // 2. Attempt MySQL persistence
  let dbSaved = false;
  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await syncPricingToDb(connection, data);
      await connection.commit();
      dbSaved = true;
    } catch (txErr) {
      await connection.rollback();
      console.warn("Pricing DB transaction failed:", txErr.message);
    } finally {
      connection.release();
    }
  } catch (dbErr) {
    console.warn("MySQL offline or unavailable for pricing save:", dbErr.message);
  }

  return { success: true, dbSaved };
}
