const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { expandBlogContent } = require('./blog_expansion_helper');

const DB_URL = "postgres://4ccde98cab74e855a54165c431efc30321dd3aefe6df08ada26ae34c887b34b2:sk_itQxHLmgZ6mXk6UtQqfYI@db.prisma.io:5432/postgres?sslmode=require";

const pool = new Pool({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false }
});

function extractArray(filePath, varName) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Match `const <varName> = [ ... ];`
  const regex = new RegExp(`const\\s+${varName}\\s*=\\s*(\\[[\\s\\S]*?\\n\\]);`);
  const match = content.match(regex);
  if (!match) {
    throw new Error(`Could not find ${varName} in ${filePath}`);
  }
  // Evaluate the array safely
  return eval(match[1]);
}

async function main() {
  console.log("Extracting blogs from seed files...");
  const newBlogs = extractArray(path.join(__dirname, 'seed_30_more_blogs.js'), 'newBlogs');
  const unsplashIds30 = extractArray(path.join(__dirname, 'seed_30_more_blogs.js'), 'unsplashIds');
  
  const remainingBlogs = extractArray(path.join(__dirname, 'seed_all_50_blogs.js'), 'remainingBlogs');
  const unsplashIds50 = extractArray(path.join(__dirname, 'seed_all_50_blogs.js'), 'unsplashIds');

  console.log(`Loaded ${newBlogs.length} blogs from seed_30_more_blogs.js`);
  console.log(`Loaded ${remainingBlogs.length} blogs from seed_all_50_blogs.js`);

  const allBlogs = [];

  for (let i = 0; i < newBlogs.length; i++) {
    const item = newBlogs[i];
    const photoId = unsplashIds30[i] || unsplashIds30[i % unsplashIds30.length];
    allBlogs.push({
      ...item,
      cover: `https://images.unsplash.com/${photoId}?w=800&auto=format&fit=crop&q=60`
    });
  }

  for (let i = 0; i < remainingBlogs.length; i++) {
    const item = remainingBlogs[i];
    const photoId = unsplashIds50[30 + i] || unsplashIds50[i % unsplashIds50.length];
    allBlogs.push({
      ...item,
      cover: `https://images.unsplash.com/${photoId}?w=800&auto=format&fit=crop&q=60`
    });
  }

  console.log(`Total blogs prepared for insertion: ${allBlogs.length}`);

  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < allBlogs.length; i++) {
    const b = allBlogs[i];
    const expandedContent = expandBlogContent(b.content, b.category, b.title);
    const id = "b_" + (i + 3);

    const res = await pool.query(`
      INSERT INTO blogs (id, title, slug, content, excerpt, cover_image, category, published)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      ON CONFLICT (slug) DO UPDATE 
        SET cover_image = EXCLUDED.cover_image,
            content = EXCLUDED.content
      RETURNING id
    `, [id, b.title, b.slug, expandedContent, b.excerpt, b.cover, b.category]);

    if (res.rowCount > 0) {
      inserted++;
    } else {
      skipped++;
    }
  }

  console.log(`Seeding complete: ${inserted} inserted/updated, ${skipped} skipped.`);

  const countRes = await pool.query("SELECT COUNT(*) FROM blogs;");
  console.log("Total blogs in PostgreSQL database:", countRes.rows[0].count);

  await pool.end();
}

main().catch(err => {
  console.error("Error seeding blogs:", err);
  pool.end();
});
