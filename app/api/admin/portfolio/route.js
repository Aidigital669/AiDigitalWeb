export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import fs from "fs";
import path from "path";
import crypto from "crypto";

function checkAuth(req) {
  const session = req.cookies.get("admin_session");
  return session && session.value === "authenticated";
}

// Fallback portfolio retrieval from backup JSON file
function getJsonFallback() {
  try {
    const filePath = path.join(process.cwd(), "data", "portfolioData.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Critical: Failed to read backup portfolio JSON file:", err);
  }
  return { showcaseProjects: [], industries: [], otherProjects: [], creativeGroups: [] };
}

// Helper to auto-create portfolio_items table
async function ensurePortfolioTable(connection) {
  const query = `
    CREATE TABLE IF NOT EXISTS portfolio_items (
      id VARCHAR(36) NOT NULL,
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
      src VARCHAR(255) DEFAULT NULL,
      type VARCHAR(50) DEFAULT NULL,
      global_index INT DEFAULT NULL,
      thumbnail VARCHAR(255) DEFAULT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  await connection.query(query);

  try {
    await connection.query("ALTER TABLE portfolio_items ADD COLUMN thumbnail VARCHAR(255) DEFAULT NULL");
  } catch (err) {
    // Ignore error if column already exists
  }
}

// Helper to synchronize JSON portfolio data into the database
async function syncPortfolioToDb(connection, portfolioData) {
  await connection.query("DELETE FROM portfolio_items");

  // 1. Showcase Projects
  if (portfolioData.showcaseProjects) {
    for (const item of portfolioData.showcaseProjects) {
      const id = item.id || crypto.randomUUID();
      await connection.query(`
        INSERT INTO portfolio_items 
        (id, section, title, category, industry, metric, metric_label, description, tags, accent, icon)
        VALUES (?, 'showcase', ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        item.title,
        item.category || null,
        item.industry || null,
        item.metric || null,
        item.metricLabel || null,
        item.description || null,
        JSON.stringify(item.tags || []),
        item.accent || null,
        item.icon || null
      ]);
    }
  }

  // 2. Featured Industries & Projects
  if (portfolioData.industries) {
    for (const ind of portfolioData.industries) {
      for (const proj of ind.projects) {
        const id = crypto.randomUUID();
        await connection.query(`
          INSERT INTO portfolio_items 
          (id, section, title, category, industry, description)
          VALUES (?, 'featured', ?, ?, ?, ?)
        `, [
          id,
          proj.title,
          proj.type || null,
          ind.name,
          ind.description || null
        ]);
      }
    }
  }

  // 3. Other Projects
  if (portfolioData.otherProjects) {
    for (const proj of portfolioData.otherProjects) {
      const id = crypto.randomUUID();
      await connection.query(`
        INSERT INTO portfolio_items 
        (id, section, title, category)
        VALUES (?, 'other', ?, ?)
      `, [
        id,
        proj.title,
        proj.type || null
      ]);
    }
  }

  // 4. Creative Groups (Images/Videos)
  if (portfolioData.creativeGroups) {
    for (const grp of portfolioData.creativeGroups) {
      for (const img of grp.images) {
        const id = crypto.randomUUID();
        await connection.query(`
          INSERT INTO portfolio_items 
          (id, section, title, description, src, type, global_index, industry, category, thumbnail)
          VALUES (?, 'creative', ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          id,
          img.title,
          img.description || null,
          img.src,
          img.type || "image",
          img.globalIndex || null,
          grp.industry,
          img.category || null,
          img.thumbnail || null
        ]);
      }
    }
  }
}

// Helper to format rows from database for frontend consumption
function formatAndSortPortfolio(rows) {
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
      formattedData.showcaseProjects.push({
        id: item.id,
        title: item.title,
        category: item.category,
        industry: item.industry,
        metric: item.metric,
        metricLabel: item.metric_label,
        description: item.description,
        tags: JSON.parse(item.tags || "[]"),
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

export async function GET() {
  try {
    const connection = await pool.getConnection();
    try {
      await ensurePortfolioTable(connection);
      const [rows] = await connection.query("SELECT * FROM portfolio_items");
      if (rows && rows.length > 0) {
        const data = formatAndSortPortfolio(rows);
        return NextResponse.json(data, {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          }
        });
      }
    } finally {
      connection.release();
    }
  } catch (dbError) {
    console.warn("Failed to retrieve portfolio data from MySQL, falling back to JSON:", dbError.message);
  }

  try {
    // Read fallback from local JSON (backup source of truth)
    const data = getJsonFallback();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    console.error("Failed to load portfolio JSON data:", error);
    return NextResponse.json({ showcaseProjects: [], industries: [], otherProjects: [], creativeGroups: [] }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  }
}


export async function POST(req) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const portfolioData = await req.json();

    // 1. Direct backup copy to JSON file for safety and sync
    try {
      const backupPath = path.join(process.cwd(), "data", "portfolioData.json");
      fs.writeFileSync(backupPath, JSON.stringify(portfolioData, null, 2), "utf-8");
    } catch (fsErr) {
      console.error("Failed to update backup portfolio JSON file:", fsErr);
    }

    // 2. Direct write to MySQL Database
    try {
      const connection = await pool.getConnection();
      try {
        await ensurePortfolioTable(connection);
        await connection.beginTransaction();

        await syncPortfolioToDb(connection, portfolioData);

        await connection.commit();
        return NextResponse.json({ success: true, message: "Portfolio saved to MySQL and JSON backup successfully" });
      } catch (transactionError) {
        await connection.rollback();
        throw transactionError;
      } finally {
        connection.release();
      }
    } catch (dbError) {
      console.warn("MySQL connection or query failed. Saved only to local JSON backup. Error:", dbError.message);
      return NextResponse.json({ 
        success: true, 
        warning: "MySQL offline. Saved to local JSON backup.",
        message: "Portfolio saved to local JSON backup successfully (Database offline)" 
      });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to persist portfolio: " + error.message }, { status: 500 });
  }
}
