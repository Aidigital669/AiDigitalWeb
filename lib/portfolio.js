import fs from "fs";
import path from "path";
import pool from "./db";
import crypto from "crypto";

function getJsonFilePath() {
  return path.join(process.cwd(), "data", "portfolioData.json");
}

export function getPortfolioFromJson() {
  try {
    const filePath = getJsonFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to read data/portfolioData.json:", err.message);
  }
  return { showcaseProjects: [], industries: [], otherProjects: [], creativeGroups: [] };
}

export async function ensurePortfolioTable(connection) {
  const query = `
    CREATE TABLE IF NOT EXISTS portfolio_items (
      id VARCHAR(64) NOT NULL,
      section VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100) DEFAULT NULL,
      industry VARCHAR(100) DEFAULT NULL,
      metric VARCHAR(50) DEFAULT NULL,
      metric_label VARCHAR(100) DEFAULT NULL,
      description TEXT DEFAULT NULL,
      tags TEXT DEFAULT NULL,
      accent VARCHAR(50) DEFAULT NULL,
      icon VARCHAR(50) DEFAULT NULL,
      src VARCHAR(500) DEFAULT NULL,
      type VARCHAR(50) DEFAULT NULL,
      global_index INT DEFAULT NULL,
      thumbnail VARCHAR(500) DEFAULT NULL,
      sort_order INT DEFAULT 0,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  await connection.query(query);

  try {
    await connection.query("ALTER TABLE portfolio_items ADD COLUMN thumbnail VARCHAR(500) DEFAULT NULL");
  } catch (err) {}
  try {
    await connection.query("ALTER TABLE portfolio_items ADD COLUMN sort_order INT DEFAULT 0");
  } catch (err) {}
}

export function formatAndSortPortfolio(rows) {
  const formattedData = {
    showcaseProjects: [],
    industries: [],
    otherProjects: [],
    creativeGroups: [],
  };

  const industriesMap = {};
  const creativeGroupsMap = {};

  rows.forEach((item) => {
    if (item.section === "showcase") {
      let tags = [];
      try {
        tags = typeof item.tags === "string" ? JSON.parse(item.tags || "[]") : (item.tags || []);
      } catch (e) {
        tags = [];
      }
      formattedData.showcaseProjects.push({
        id: item.id,
        title: item.title,
        category: item.category,
        industry: item.industry,
        metric: item.metric,
        metricLabel: item.metric_label,
        description: item.description,
        tags: tags,
        accent: item.accent,
        icon: item.icon,
      });
    } else if (item.section === "featured") {
      const indName = item.industry || "General";
      if (!industriesMap[indName]) {
        industriesMap[indName] = {
          name: indName,
          description: item.description || "",
          projects: [],
        };
      }
      industriesMap[indName].projects.push({
        title: item.title,
        type: item.category || "Website & SEO",
      });
    } else if (item.section === "other") {
      formattedData.otherProjects.push({
        title: item.title,
        type: item.category || "Campaigns",
      });
    } else if (item.section === "creative") {
      const indName = item.industry || "Other Projects";
      if (!creativeGroupsMap[indName]) {
        creativeGroupsMap[indName] = {
          industry: indName,
          description: item.description || "Creative assets",
          images: [],
        };
      }
      creativeGroupsMap[indName].images.push({
        src: item.src,
        title: item.title,
        description: item.description,
        globalIndex: item.global_index || undefined,
        type: item.type || "image",
        category: item.category || undefined,
        thumbnail: item.thumbnail || undefined,
      });
    }
  });

  formattedData.industries = Object.values(industriesMap);
  formattedData.creativeGroups = Object.values(creativeGroupsMap);

  return formattedData;
}

export async function syncPortfolioToDb(connection, portfolioData) {
  await ensurePortfolioTable(connection);
  await connection.query("DELETE FROM portfolio_items");

  // 1. Showcase Projects
  if (portfolioData.showcaseProjects && Array.isArray(portfolioData.showcaseProjects)) {
    for (let i = 0; i < portfolioData.showcaseProjects.length; i++) {
      const item = portfolioData.showcaseProjects[i];
      const id = item.id || crypto.randomUUID();
      await connection.query(`
        INSERT INTO portfolio_items 
        (id, section, title, category, industry, metric, metric_label, description, tags, accent, icon, sort_order)
        VALUES (?, 'showcase', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        item.title || "",
        item.category || null,
        item.industry || null,
        item.metric || null,
        item.metricLabel || null,
        item.description || null,
        JSON.stringify(item.tags || []),
        item.accent || null,
        item.icon || null,
        i
      ]);
    }
  }

  // 2. Featured Industries & Projects
  if (portfolioData.industries && Array.isArray(portfolioData.industries)) {
    for (let i = 0; i < portfolioData.industries.length; i++) {
      const ind = portfolioData.industries[i];
      if (ind.projects && Array.isArray(ind.projects)) {
        for (let j = 0; j < ind.projects.length; j++) {
          const proj = ind.projects[j];
          const id = crypto.randomUUID();
          await connection.query(`
            INSERT INTO portfolio_items 
            (id, section, title, category, industry, description, sort_order)
            VALUES (?, 'featured', ?, ?, ?, ?, ?)
          `, [
            id,
            proj.title || "",
            proj.type || null,
            ind.name,
            ind.description || null,
            j
          ]);
        }
      }
    }
  }

  // 3. Other Projects
  if (portfolioData.otherProjects && Array.isArray(portfolioData.otherProjects)) {
    for (let i = 0; i < portfolioData.otherProjects.length; i++) {
      const proj = portfolioData.otherProjects[i];
      const id = crypto.randomUUID();
      await connection.query(`
        INSERT INTO portfolio_items 
        (id, section, title, category, sort_order)
        VALUES (?, 'other', ?, ?, ?)
      `, [
        id,
        proj.title || "",
        proj.type || null,
        i
      ]);
    }
  }

  // 4. Creative Groups (Images/Videos)
  if (portfolioData.creativeGroups && Array.isArray(portfolioData.creativeGroups)) {
    for (let i = 0; i < portfolioData.creativeGroups.length; i++) {
      const grp = portfolioData.creativeGroups[i];
      if (grp.images && Array.isArray(grp.images)) {
        for (let j = 0; j < grp.images.length; j++) {
          const img = grp.images[j];
          const id = crypto.randomUUID();
          await connection.query(`
            INSERT INTO portfolio_items 
            (id, section, title, description, src, type, global_index, industry, category, thumbnail, sort_order)
            VALUES (?, 'creative', ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            id,
            img.title || "",
            img.description || null,
            img.src || "",
            img.type || "image",
            img.globalIndex !== undefined ? img.globalIndex : null,
            grp.industry,
            img.category || null,
            img.thumbnail || null,
            j
          ]);
        }
      }
    }
  }
}

export async function getPortfolioData() {
  // 1. Try reading from MySQL
  try {
    const connection = await pool.getConnection();
    try {
      await ensurePortfolioTable(connection);
      const [rows] = await connection.query("SELECT * FROM portfolio_items ORDER BY sort_order ASC");
      if (rows && rows.length > 0) {
        return formatAndSortPortfolio(rows);
      }
    } finally {
      connection.release();
    }
  } catch (err) {
    // MySQL offline or error
  }

  // 2. Fallback to JSON file
  return getPortfolioFromJson();
}

export async function savePortfolioData(portfolioData) {
  // 1. Always save to data/portfolioData.json
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const filePath = getJsonFilePath();
  fs.writeFileSync(filePath, JSON.stringify(portfolioData, null, 2), "utf-8");

  // 2. Attempt MySQL persistence
  let dbSaved = false;
  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await syncPortfolioToDb(connection, portfolioData);
      await connection.commit();
      dbSaved = true;
    } catch (txErr) {
      await connection.rollback();
      console.warn("Portfolio DB transaction failed:", txErr.message);
    } finally {
      connection.release();
    }
  } catch (dbErr) {
    console.warn("MySQL offline or unavailable for portfolio save:", dbErr.message);
  }

  return { success: true, dbSaved };
}
