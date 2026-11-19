export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import pool from "../../../lib/db";

function checkAuth(req) {
  const session = req.cookies.get("admin_session");
  return session && session.value === "authenticated";
}

const fallbackBlogs = [
  {
    id: "b1",
    title: "Welcome to BizzMaker Blogs",
    slug: "welcome-to-bizzmaker-blogs",
    content: `## Exploring AI Powered Digital Marketing

Welcome to our blog! We specialize in generating high-performing leads, developing optimized web applications, and building AI videos.

### Why Choose AI Marketing?
- **Efficiency**: AI algorithms analyze audience insights rapidly.
- **Conversion**: Dynamically targeted landing pages convert higher.
- **Speed**: Automating workflow saves precious time.`,
    excerpt: "An overview of how AI digital neural tech is transforming digital marketing paradigms.",
    coverImage: "/creative_content/Creative1.jpeg",
    category: "Marketing",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET blogs (supports single query by slug/id or summary listing)
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const adminMode = url.searchParams.get("admin") === "true";
    const slug = url.searchParams.get("slug");
    const id = url.searchParams.get("id");

    if (slug) {
      const [rows] = await pool.query("SELECT * FROM blogs WHERE slug = ?", [slug]);
      if (rows.length === 0) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 });
      }
      const blog = rows[0];
      return NextResponse.json({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt,
        coverImage: blog.cover_image,
        category: blog.category,
        published: Boolean(blog.published),
        createdAt: blog.created_at,
        updatedAt: blog.updated_at,
      });
    }

    if (id) {
      const [rows] = await pool.query("SELECT * FROM blogs WHERE id = ?", [id]);
      if (rows.length === 0) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 });
      }
      const blog = rows[0];
      return NextResponse.json({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt,
        coverImage: blog.cover_image,
        category: blog.category,
        published: Boolean(blog.published),
        createdAt: blog.created_at,
        updatedAt: blog.updated_at,
      });
    }

    let rows;
    if (adminMode) {
      if (!checkAuth(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      [rows] = await pool.query("SELECT id, title, slug, LEFT(content, 100) as content, excerpt, cover_image, category, published, created_at, updated_at FROM blogs ORDER BY created_at DESC");
    } else {
      [rows] = await pool.query("SELECT id, title, slug, LEFT(content, 100) as content, excerpt, cover_image, category, published, created_at, updated_at FROM blogs WHERE published = 1 ORDER BY created_at DESC");
    }

    const blogs = rows.map((blog) => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt,
      coverImage: blog.cover_image,
      category: blog.category,
      published: Boolean(blog.published),
      createdAt: blog.created_at,
      updatedAt: blog.updated_at,
    }));

    return NextResponse.json(blogs);
  } catch (error) {
    console.warn("MySQL database connection failed. Returning default static blog articles fallback. Error:", error.message);
    return NextResponse.json(fallbackBlogs);
  }
}

// POST create blog post
export async function POST(req) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, slug, content, excerpt, coverImage, category, published } = await req.json();

    // Check slug uniqueness
    const [existing] = await pool.query("SELECT id FROM blogs WHERE slug = ?", [slug]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "A blog post with this slug already exists." }, { status: 400 });
    }

    const id = Math.random().toString(36).substring(2, 15);
    await pool.query(`
      INSERT INTO blogs (id, title, slug, content, excerpt, cover_image, category, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      title,
      slug,
      content,
      excerpt,
      coverImage || null,
      category,
      published ? 1 : 0
    ]);

    return NextResponse.json({ success: true, message: "Blog post created using raw SQL" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create blog: " + error.message }, { status: 500 });
  }
}

// PUT update blog post
export async function PUT(req) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, slug, content, excerpt, coverImage, category, published } = await req.json();

    await pool.query(`
      UPDATE blogs 
      SET title = ?, slug = ?, content = ?, excerpt = ?, cover_image = ?, category = ?, published = ?
      WHERE id = ?
    `, [
      title,
      slug,
      content,
      excerpt,
      coverImage || null,
      category,
      published ? 1 : 0,
      id
    ]);

    return NextResponse.json({ success: true, message: "Blog post updated using raw SQL" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update blog: " + error.message }, { status: 500 });
  }
}

// DELETE blog post
export async function DELETE(req) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    await pool.query("DELETE FROM blogs WHERE id = ?", [id]);

    return NextResponse.json({ success: true, message: "Blog post deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete blog: " + error.message }, { status: 500 });
  }
}
