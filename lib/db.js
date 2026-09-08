import mysql from "mysql2/promise";

let pool;

if (!global.mysqlPool) {
  global.mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "ai_digital",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 2000,
  });
}

pool = global.mysqlPool;

let tableChecked = false;
let lastCheckAttempt = 0;

export async function ensureVisitorsTable() {
  if (tableChecked) return;
  const now = Date.now();
  // If failed recently (within 5 minutes), do not retry on every request
  if (now - lastCheckAttempt < 300000) return;
  lastCheckAttempt = now;

  try {
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
    tableChecked = true;
  } catch (err) {
    if (err.code !== "ECONNREFUSED") {
      console.warn("Could not auto-create website_visitors table:", err.message);
    }
  }
}

export default pool;
export { pool };
