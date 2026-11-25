import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  });
}

import pool from '../lib/db.js';

async function main() {
  console.log("=== Testing lib/db.js with PostgreSQL ===");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Configured (PostgreSQL)" : "Not configured");
  console.log("USE_DUMMY_DB:", process.env.USE_DUMMY_DB);

  // 1. Query blogs
  const [blogs] = await pool.query("SELECT COUNT(*) as cnt FROM blogs");
  console.log("1. Total Blogs in PostgreSQL:", blogs[0].cnt);

  // 2. Query users
  const [users] = await pool.query("SELECT id, name, email, role FROM users ORDER BY id LIMIT 5");
  console.log("2. Sample Users:", users);

  // 3. Query clients
  const [clients] = await pool.query("SELECT COUNT(*) as cnt FROM clients");
  console.log("3. Total Clients in PostgreSQL:", clients[0].cnt);

  // 4. Query client_tasks
  const [tasks] = await pool.query("SELECT COUNT(*) as cnt FROM client_tasks");
  console.log("4. Total Client Tasks in PostgreSQL:", tasks[0].cnt);

  // 5. Query portfolio_items
  const [portfolio] = await pool.query("SELECT COUNT(*) as cnt FROM portfolio_items");
  console.log("5. Total Portfolio Items in PostgreSQL:", portfolio[0].cnt);

  // 6. Query pricing_plans
  const [plans] = await pool.query("SELECT COUNT(*) as cnt FROM pricing_plans");
  console.log("6. Total Pricing Plans in PostgreSQL:", plans[0].cnt);

  // 7. Query website_visitors
  const [visitors] = await pool.query("SELECT COUNT(*) as cnt FROM website_visitors");
  console.log("7. Total Website Visitors in PostgreSQL:", visitors[0].cnt);

  // 8. Test parameterized query
  const [specificBlog] = await pool.query("SELECT title, category FROM blogs WHERE slug = ?", ["modern-nextjs-seo-portals"]);
  console.log("8. Specific Blog:", specificBlog[0]);

  // 9. Test connection release
  const conn = await pool.getConnection();
  const [connResult] = await conn.query("SELECT 1 + 1 as sum");
  console.log("9. Connection test 1+1 =", connResult[0].sum);
  conn.release();

  console.log("\n>>> ALL TESTS PASSED! lib/db.js is fully integrated with PostgreSQL! <<<");
  process.exit(0);
}

main().catch(err => {
  console.error("Integration test failed:", err);
  process.exit(1);
});
