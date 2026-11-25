import { Pool as PgPool } from "pg";
import mysql from "mysql2/promise";

function transformQuery(sql, params = []) {
  let transformed = sql;

  // 1. Replace MySQL backticks with standard quotes
  transformed = transformed.replace(/`([^`]+)`/g, '"$1"');

  // 2. Handle INSERT IGNORE INTO
  transformed = transformed.replace(/INSERT\s+IGNORE\s+INTO/gi, "INSERT INTO");
  if (sql.match(/INSERT\s+IGNORE\s+INTO\s+promo_codes/i)) {
    if (!transformed.includes("ON CONFLICT")) {
      transformed += " ON CONFLICT (code) DO NOTHING";
    }
  }

  // 3. Handle ON DUPLICATE KEY UPDATE for promo_codes
  if (transformed.includes("ON DUPLICATE KEY UPDATE")) {
    transformed = transformed.replace(
      /ON\s+DUPLICATE\s+KEY\s+UPDATE\s+discount_percent\s*=\s*VALUES\(discount_percent\)[^;]*/gi,
      "ON CONFLICT (code) DO UPDATE SET discount_percent = EXCLUDED.discount_percent, min_order_amount = EXCLUDED.min_order_amount, max_discount_amount = EXCLUDED.max_discount_amount, is_active = EXCLUDED.is_active, description = EXCLUDED.description"
    );
  }

  // 4. Handle UPDATE ... ORDER BY ... LIMIT 1 in website_visitors
  if (/UPDATE\s+website_visitors\s+SET\s+duration_seconds\s*=\s*\?\s*,\s*last_active_at\s*=\s*NOW\(\)\s+WHERE\s+visitor_id\s*=\s*\?\s+AND\s+session_id\s*=\s*\?\s+ORDER\s+BY\s+id\s+DESC\s+LIMIT\s+1/i.test(transformed)) {
    transformed = `UPDATE website_visitors SET duration_seconds = ?, last_active_at = NOW() WHERE id = (SELECT id FROM website_visitors WHERE visitor_id = ? AND session_id = ? ORDER BY id DESC LIMIT 1)`;
  }

  // 5. Convert ? placeholders to $1, $2, $3...
  let paramIndex = 1;
  transformed = transformed.replace(/\?/g, () => `$${paramIndex++}`);

  return { sql: transformed, params };
}

function getDatabaseTarget() {
  const databaseUrl = process.env.DATABASE_URL || "";
  const isPostgres = databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://");

  if (isPostgres) {
    if (!global.pgPoolInstance) {
      const pgPool = new PgPool({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      async function executeQuery(sql, params = []) {
        const isInsert = /^\s*INSERT\s+INTO/i.test(sql);
        let { sql: pgSql, params: pgParams } = transformQuery(sql, params);

        // If it's an insert and has no RETURNING clause, add RETURNING id if table has id
        const shouldAddReturning = isInsert && !/RETURNING/i.test(pgSql);
        if (shouldAddReturning) {
          pgSql += " RETURNING id";
        }

        try {
          const res = await pgPool.query(pgSql, pgParams);
          const rows = res.rows || [];
          rows.insertId = rows[0]?.id || 0;
          rows.affectedRows = res.rowCount || 0;
          rows.length = res.rows ? res.rows.length : 0;
          return [rows, res.fields];
        } catch (err) {
          if (shouldAddReturning && err.message && err.message.includes('column "id" does not exist')) {
            const fallbackSql = pgSql.replace(/\s+RETURNING\s+id$/i, "");
            const res = await pgPool.query(fallbackSql, pgParams);
            const rows = res.rows || [];
            rows.affectedRows = res.rowCount || 0;
            return [rows, res.fields];
          }
          throw err;
        }
      }

      global.pgPoolInstance = {
        query: executeQuery,
        getConnection: async () => {
          const client = await pgPool.connect();
          return {
            query: (sql, params) => executeQuery(sql, params),
            release: () => client.release(),
          };
        },
        end: () => pgPool.end(),
        pool: pgPool,
      };
    }

    return global.pgPoolInstance;
  }

  // Fallback to MySQL pool
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

  return global.mysqlPool;
}

const pool = {
  query: (sql, params) => getDatabaseTarget().query(sql, params),
  getConnection: () => getDatabaseTarget().getConnection(),
  end: () => getDatabaseTarget().end && getDatabaseTarget().end(),
};

export async function ensureVisitorsTable() {
  // website_visitors is already ensured and healthy in PostgreSQL
  return;
}

export default pool;
export { pool };
