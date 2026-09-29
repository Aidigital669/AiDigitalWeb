"use client";

import React, { useState, useEffect } from "react";
import { SiteHeader, SiteFooter, Icon } from "../components/SiteChrome";
import Link from "next/link";
import { useVisibility } from "../context/VisibilityContext";
import PageHiddenNotice from "../components/PageHiddenNotice";

export default function BlogListingPage() {
  const { isVisible, isPageVisible } = useVisibility();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 12;

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBlogs(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch blogs:", err);
        setLoading(false);
      });
  }, []);

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  const getBlogLink = (post) => {
    const contentTrimmed = post.content ? post.content.trim() : "";
    const slugTrimmed = post.slug ? post.slug.trim() : "";
    
    if (contentTrimmed.startsWith("http://") || contentTrimmed.startsWith("https://")) {
      return contentTrimmed;
    }
    if (slugTrimmed.startsWith("http://") || slugTrimmed.startsWith("https://")) {
      return slugTrimmed;
    }
    
    // Check if the content is just a markdown link or single URL
    const mdLinkMatch = contentTrimmed.match(/^\[.*?\]\((https?:\/\/.*?)\)$/);
    if (mdLinkMatch) {
      return mdLinkMatch[1];
    }
    
    if (/^https?:\/\/[^\s]+$/.test(contentTrimmed)) {
      return contentTrimmed;
    }
    
    return `/blog/${post.slug}`;
  };

  if (!isPageVisible("blog")) {
    return <PageHiddenNotice pageName="Blogs" />;
  }

  return (
    <div style={styles.pageWrapper}>
      <SiteHeader active="blog" />

      {/* Hero Header Section */}
      {isVisible("blog_hero") && (
        <section style={styles.heroSection}>
          <div style={styles.eyebrow}>Insights & Knowledge</div>
          <h1 style={styles.mainTitle}>
            AI Digital <span>Blogs</span>
          </h1>
          <p style={styles.subtitle}>
            Stay ahead with the latest strategies in AI-driven marketing, web development frameworks, and SEO conversions.
          </p>
        </section>
      )}

      {/* Blogs Main Grid */}
      {isVisible("blog_grid") && (
      <section style={styles.gridSection}>
        {loading ? (
          <div style={styles.loader}>Loading blogs...</div>
        ) : blogs.length === 0 ? (
          <div style={styles.empty}>No blog posts found. Check back later!</div>
        ) : (
          <>
            <div style={styles.blogsGrid}>
              {currentBlogs.map((post) => {
                const url = getBlogLink(post);
                const isExternal = url.startsWith("http://") || url.startsWith("https://");
                
                const CardTag = isExternal ? "a" : Link;
                const cardProps = isExternal 
                  ? { href: url, target: "_blank", rel: "noopener noreferrer" } 
                  : { href: url };

                return (
                  <CardTag 
                    key={post.id} 
                    {...cardProps} 
                    style={{ ...styles.blogCard, textDecoration: "none", color: "inherit" }}
                  >
                    <div style={styles.cardMedia}>
                      <img
                        src={post.coverImage || "/creative_content/Creative1.jpeg"}
                        alt={post.title}
                        style={styles.cardImage}
                      />
                      <span style={styles.cardCategory}>{post.category}</span>
                    </div>
                    <div style={styles.cardBody}>
                      <div style={styles.cardMeta}>
                        <span>{new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span>•</span>
                        <span>5 min read</span>
                      </div>
                      <h2 style={styles.cardTitle}>{post.title}</h2>
                      <p style={styles.cardExcerpt}>{post.excerpt}</p>
                      <span style={styles.readMoreLink}>
                        Read Post <Icon name="arrow_forward" style={styles.arrowIcon} />
                      </span>
                    </div>
                  </CardTag>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="blog-pagination-row">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="blog-page-btn"
                >
                  <Icon name="chevron_left" className="blog-page-icon" /> Previous
                </button>
                <div className="blog-page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`blog-page-number-btn ${currentPage === pageNum ? "active" : ""}`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="blog-page-btn"
                >
                  Next <Icon name="chevron_right" className="blog-page-icon" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
      )}

      <SiteFooter />
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#0f172a",
  },
  heroSection: {
    padding: "80px var(--page-gutter) 40px var(--page-gutter)",
    textAlign: "center",
    maxWidth: "800px",
    margin: "0 auto",
  },
  eyebrow: {
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#e56030",
    letterSpacing: "0.05em",
    marginBottom: "12px",
  },
  mainTitle: {
    fontFamily: "var(--font-headline)",
    fontSize: "clamp(32px, 5vw, 52px)",
    fontWeight: "800",
    lineHeight: "1.1",
    color: "#0f172a",
    marginBottom: "16px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#64748b",
    lineHeight: "1.5",
  },

  gridSection: {
    paddingInline: "var(--page-gutter)",
    paddingBottom: "80px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  blogsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "32px",
  },
  blogCard: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
    border: "1px solid #eef2f7",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    display: "flex",
    flexDirection: "column",
  },
  cardMedia: {
    position: "relative",
    height: "220px",
    width: "100%",
    backgroundColor: "#e2e8f0",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardCategory: {
    position: "absolute",
    top: "16px",
    left: "16px",
    backgroundColor: "#ffffff",
    color: "#e56030",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    padding: "4px 12px",
    borderRadius: "6px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
  },
  cardBody: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  cardMeta: {
    display: "flex",
    gap: "8px",
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "12px",
  },
  cardTitle: {
    fontFamily: "var(--font-headline)",
    fontSize: "18px",
    fontWeight: "700",
    lineHeight: "1.3",
    color: "#0f172a",
    marginBottom: "12px",
  },
  cardExcerpt: {
    fontSize: "14px",
    color: "#64748b",
    lineHeight: "1.5",
    marginBottom: "20px",
    flex: 1,
  },
  readMoreLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#e56030",
    fontSize: "13px",
    fontWeight: "700",
    marginTop: "auto",
  },
  arrowIcon: {
    fontSize: "14px",
  },
  loader: {
    textAlign: "center",
    fontSize: "16px",
    color: "#64748b",
    padding: "40px 0",
  },
  empty: {
    textAlign: "center",
    fontSize: "16px",
    color: "#64748b",
    padding: "60px 0",
  },
};
