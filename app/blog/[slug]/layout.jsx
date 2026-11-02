import pool from "../../../lib/db";
import { cache } from "react";

const getBlog = cache(async (slug) => {
  try {
    const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();
    const [rows] = await pool.query(
      "SELECT title, excerpt, cover_image FROM blogs WHERE slug = ?",
      [decodedSlug]
    );
    if (rows && rows.length > 0) return rows[0];
  } catch (error) {
    console.warn("Failed to fetch blog metadata:", error.message);
  }
  return null;
});

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const blog = await getBlog(slug);
  
  let title = "Blog | AI Digital";
  let description = "Insights and strategies on AI, SEO, and Performance Marketing.";
  let coverImage = "/creative_content/Creative1.jpeg";
  
  if (blog) {
    title = `${blog.title} | AI Digital`;
    if (blog.excerpt) description = blog.excerpt;
    if (blog.cover_image) coverImage = blog.cover_image;
  }

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.aidigital.biz/blog/${slug}`,
      type: "article",
      images: [
        {
          url: coverImage.startsWith("http") ? coverImage : `https://www.aidigital.biz${coverImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImage.startsWith("http") ? coverImage : `https://www.aidigital.biz${coverImage}`],
    },
  };
}

export default async function BlogSlugLayout({ children, params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const blog = await getBlog(slug);

  let title = "Blog | AI Digital";
  let description = "Insights and strategies on AI, SEO, and Performance Marketing.";
  let coverImage = "/creative_content/Creative1.jpeg";
  
  if (blog) {
    title = `${blog.title} | AI Digital`;
    if (blog.excerpt) description = blog.excerpt;
    if (blog.cover_image) coverImage = blog.cover_image;
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    image: coverImage.startsWith("http") ? coverImage : `https://www.aidigital.biz${coverImage}`,
    url: `https://www.aidigital.biz/blog/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "AI Digital",
      logo: {
        "@type": "ImageObject",
        url: "https://www.aidigital.biz/Logo.png"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {children}
    </>
  );
}


