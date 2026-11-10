import mysql from "mysql2/promise";
import fs from "fs";
import { spawn } from "child_process";

// Configured port priority: DB_PORT in .env -> 3307 -> 3306
let preferredPort = parseInt(process.env.DB_PORT || "3307", 10);
const host = process.env.DB_HOST || "127.0.0.1";
const user = process.env.DB_USER || "root";
const password = process.env.DB_PASSWORD || "";
const database = process.env.DB_NAME || "ai_digital";

let autoStartAttempted = false;

function buildPool(port) {
  return mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 2500,
  });
}

if (!global.__mysqlPool) {
  global.__mysqlActivePort = preferredPort;
  global.__mysqlPool = buildPool(preferredPort);
}

// Optional auto-start for local XAMPP MySQL if stopped
function tryAutoStartXamppMysql() {
  if (autoStartAttempted || process.platform !== "win32") return;
  autoStartAttempted = true;

  const mysqldPath = "C:\\xampp\\mysql\\bin\\mysqld.exe";
  const myIniPath = "C:\\xampp\\mysql\\bin\\my.ini";

  if (fs.existsSync(mysqldPath)) {
    try {
      const child = spawn(
        mysqldPath,
        [`--defaults-file=${myIniPath}`, "--standalone"],
        {
          detached: true,
          stdio: "ignore",
          windowsHide: true,
        }
      );
      child.unref();
      console.log("[DB] Auto-launched XAMPP MySQL daemon in background.");
    } catch (e) {
      console.warn("[DB] Could not auto-launch XAMPP MySQL:", e.message);
    }
  }
}

// Resilient pool proxy that seamlessly fails over between port 3307 and 3306
const pool = new Proxy(global.__mysqlPool, {
  get(target, prop) {
    if (prop === "query" || prop === "execute") {
      return async function (...args) {
        try {
          return await global.__mysqlPool[prop](...args);
        } catch (err) {
          if (err && err.code === "ECONNREFUSED") {
            const currentPort = global.__mysqlActivePort || preferredPort;
            const alternatePort = currentPort === 3307 ? 3306 : 3307;

            try {
              // Try the alternate port
              const altPool = buildPool(alternatePort);
              const result = await altPool[prop](...args);
              // Alternate port worked! Switch global active pool
              global.__mysqlActivePort = alternatePort;
              global.__mysqlPool = altPool;
              return result;
            } catch (altErr) {
              // If both fail, attempt to start XAMPP once if local
              if (!autoStartAttempted) {
                tryAutoStartXamppMysql();
              }
              throw err; // preserve original error
            }
          }
          throw err;
        }
      };
    }

    if (prop === "getConnection") {
      return async function (...args) {
        try {
          return await global.__mysqlPool.getConnection(...args);
        } catch (err) {
          if (err && err.code === "ECONNREFUSED") {
            const currentPort = global.__mysqlActivePort || preferredPort;
            const alternatePort = currentPort === 3307 ? 3306 : 3307;
            try {
              const altPool = buildPool(alternatePort);
              const conn = await altPool.getConnection(...args);
              global.__mysqlActivePort = alternatePort;
              global.__mysqlPool = altPool;
              return conn;
            } catch (altErr) {
              if (!autoStartAttempted) {
                tryAutoStartXamppMysql();
              }
              throw err;
            }
          }
          throw err;
        }
      };
    }

    const value = global.__mysqlPool[prop];
    if (typeof value === "function") {
      return value.bind(global.__mysqlPool);
    }
    return value;
  },
});

let tablesChecked = false;
let lastTableCheckAttempt = 0;

export async function ensureAllTables() {
  if (tablesChecked) return;
  const now = Date.now();
  if (now - lastTableCheckAttempt < 180000) return; // cache for 3 minutes
  lastTableCheckAttempt = now;

  try {
    // 1. website_visitors
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`website_visitors\` (
        \`id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
        \`visitor_id\` VARCHAR(64) NOT NULL,
        \`session_id\` VARCHAR(64) NOT NULL,
        \`ip_address\` VARCHAR(64) DEFAULT NULL,
        \`country\` VARCHAR(100) DEFAULT 'Unknown',
        \`country_code\` VARCHAR(10) DEFAULT 'UN',
        \`city\` VARCHAR(100) DEFAULT 'Unknown',
        \`region\` VARCHAR(100) DEFAULT NULL,
        \`device_type\` VARCHAR(30) DEFAULT 'Desktop',
        \`browser\` VARCHAR(50) DEFAULT 'Unknown',
        \`os\` VARCHAR(50) DEFAULT 'Unknown',
        \`page_url\` TEXT NOT NULL,
        \`page_path\` VARCHAR(255) NOT NULL,
        \`page_title\` VARCHAR(255) DEFAULT NULL,
        \`referrer\` TEXT DEFAULT NULL,
        \`utm_source\` VARCHAR(100) DEFAULT NULL,
        \`utm_medium\` VARCHAR(100) DEFAULT NULL,
        \`utm_campaign\` VARCHAR(100) DEFAULT NULL,
        \`screen_resolution\` VARCHAR(30) DEFAULT NULL,
        \`language\` VARCHAR(30) DEFAULT NULL,
        \`duration_seconds\` INT DEFAULT 0,
        \`is_new_visitor\` TINYINT(1) DEFAULT 1,
        \`last_active_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_created_at\` (\`created_at\`),
        INDEX \`idx_visitor_id\` (\`visitor_id\`),
        INDEX \`idx_session_id\` (\`session_id\`),
        INDEX \`idx_page_path\` (\`page_path\`),
        INDEX \`idx_last_active\` (\`last_active_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. job_applications
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`job_applications\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`phone\` VARCHAR(50) NOT NULL,
        \`address\` TEXT,
        \`city\` VARCHAR(100),
        \`district\` VARCHAR(100),
        \`job_title\` VARCHAR(255) NOT NULL,
        \`message\` TEXT,
        \`resume_url\` TEXT,
        \`status\` VARCHAR(50) DEFAULT 'Pending',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. payment_reminders
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`payment_reminders\` (
        \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
        \`customer_name\` VARCHAR(100) DEFAULT NULL,
        \`customer_email\` VARCHAR(100) DEFAULT NULL,
        \`customer_phone\` VARCHAR(50) DEFAULT NULL,
        \`plan_name\` VARCHAR(100) DEFAULT NULL,
        \`plan_price\` VARCHAR(50) DEFAULT NULL,
        \`reminder_date\` VARCHAR(50) DEFAULT NULL,
        \`status\` VARCHAR(50) DEFAULT 'Pending',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. onboarding_details
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`onboarding_details\` (
        \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
        \`payment_id\` VARCHAR(100) NOT NULL,
        \`plans\` VARCHAR(255) NOT NULL,
        \`contact_name\` VARCHAR(100) DEFAULT NULL,
        \`alt_phone\` VARCHAR(50) DEFAULT NULL,
        \`business_type\` VARCHAR(100) DEFAULT NULL,
        \`gstin\` VARCHAR(50) DEFAULT NULL,
        \`address_line1\` TEXT DEFAULT NULL,
        \`address_line2\` TEXT DEFAULT NULL,
        \`city\` VARCHAR(100) DEFAULT NULL,
        \`state_name\` VARCHAR(100) DEFAULT NULL,
        \`pin_code\` VARCHAR(20) DEFAULT NULL,
        \`request_callback\` TINYINT(1) DEFAULT '0',
        \`scheduled_date\` VARCHAR(100) DEFAULT NULL,
        \`scheduled_time\` VARCHAR(50) DEFAULT NULL,
        \`status\` VARCHAR(50) DEFAULT 'Pending',
        \`promo_code\` VARCHAR(100) DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`uniq_payment_id\` (\`payment_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. promo_codes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`promo_codes\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`code\` VARCHAR(50) NOT NULL UNIQUE,
        \`discount_percent\` DECIMAL(5,2) NOT NULL,
        \`min_order_amount\` DECIMAL(10,2) NOT NULL,
        \`max_discount_amount\` DECIMAL(10,2) DEFAULT NULL,
        \`is_active\` TINYINT(1) DEFAULT 1,
        \`usage_limit\` INT DEFAULT NULL,
        \`times_used\` INT DEFAULT 0,
        \`description\` VARCHAR(255) DEFAULT NULL,
        \`expires_at\` DATETIME DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. contact_inquiries
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`contact_inquiries\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL,
        \`phone\` VARCHAR(50) NOT NULL,
        \`service\` VARCHAR(100) DEFAULT NULL,
        \`message\` TEXT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure promo_code column on onboarding_details
    try {
      await pool.query("ALTER TABLE `onboarding_details` ADD COLUMN IF NOT EXISTS `promo_code` VARCHAR(100) DEFAULT NULL");
    } catch (e) {}

    tablesChecked = true;
  } catch (err) {
    if (err.code !== "ECONNREFUSED") {
      console.warn("[DB] Could not ensure all database tables:", err.message);
    }
  }
}

export async function ensureVisitorsTable() {
  return ensureAllTables();
}

export default pool;
export { pool };
