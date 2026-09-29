"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { creativeGroups } from "../../../components/CreativeGrid";
import { SiteHeader, SiteFooter } from "../../../components/SiteChrome";

const industryMap = {
  "real-estate": "Real Estate",
  "education": "Education",
  "healthcare": "Healthcare",
  "finance": "Finance",
  "hospitality": "Hospitality & Food",
  "hospitality-food": "Hospitality & Food",
  "solar": "Solar",
  "interior-design": "Interior Design",
  "technology": "Technology & Apps",
  "technology-apps": "Technology & Apps",
  "tours-travels": "Tours & Travels",
  "travels": "Tours & Travels",
  "sports": "Sports",
  "agriculture": "Agriculture",
  "other-creative": "Other Creative",
  "digital-marketing": "Digital Marketing",
  "construction": "Construction"
};

const categoryMap = {
  "websites": { id: "website", label: "Website & SEO", name: "Websites", icon: "language" },
  "campaigns": { id: "campaign", label: "Campaigns", name: "Campaigns", icon: "campaign" },
  "ai-videos": { id: "video", label: "AI Videos", name: "AI Videos", icon: "movie" },
  "creative-content": { id: "image", label: "Creative Content", name: "Creative Content", icon: "palette" },
  "reels": { id: "reel", label: "Reels", name: "Reels", icon: "smart_display" }
};

export default function IndustryCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [videoErrors, setVideoErrors] = useState({});

  const industrySlug = params?.industry;
  const categorySlug = params?.category;

  const industryName = industryMap[industrySlug] || "Industry";
  const categoryInfo = categoryMap[categorySlug] || { id: "unknown", label: "Projects", name: "Projects", icon: "dashboard" };

  // Helper to resolve media types
  const getMediaType = (type, src, category) => {
    if (category === "image" || category === "video" || category === "reel" || category === "website" || category === "campaign") {
      return category;
    }
    let resolvedType = type;
    if (!resolvedType && src) {
      const url = src.toLowerCase();
      if (url.includes("youtube.com") || url.includes("youtu.be")) resolvedType = "youtube";
      else if (url.includes("instagram.com/reel") || url.includes("instagram.com/p")) resolvedType = "instagram";
      else if (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg") || url.endsWith(".mov")) resolvedType = "video";
      else if (url.startsWith("http")) resolvedType = "website";
      else if (url.includes("/campaign/")) resolvedType = "campaign";
      else resolvedType = "image";
    }
    if (resolvedType === "youtube" || resolvedType === "iframe" || resolvedType === "video") return "video";
    if (resolvedType === "instagram" || resolvedType === "reel") return "reel";
    if (resolvedType === "website") return "website";
    if (resolvedType === "campaign") return "campaign";
    return "image";
  };

  const getPlayerType = (src, type) => {
    if (type === "website") return "website";
    if (type === "campaign") return "image";
    if (!src) return "image";
    const url = src.toLowerCase();
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("instagram.com/reel") || url.includes("instagram.com/p")) return "instagram";
    if (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg") || url.endsWith(".mov")) return "video";
    if (url.startsWith("http") && !url.match(/\.(jpeg|jpg|gif|png|webp|svg)/)) return "website";
    return "image";
  };

  const getYoutubeThumbnail = (src) => {
    let videoId = "";
    if (src.includes("youtu.be/")) {
      videoId = src.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0];
    } else if (src.includes("youtube.com/shorts/")) {
      videoId = src.split("youtube.com/shorts/")[1]?.split("?")[0]?.split("&")[0];
    } else if (src.includes("v=")) {
      videoId = src.split("v=")[1]?.split("&")[0];
    } else if (src.includes("embed/")) {
      videoId = src.split("embed/")[1]?.split("?")[0];
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  };

  const getThumbnail = (src, type) => {
    const playerType = getPlayerType(src, type);
    if (playerType === "youtube") {
      const ytThumb = getYoutubeThumbnail(src);
      if (ytThumb) return ytThumb;
    }
    if (playerType === "instagram") {
      return "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60";
    }
    if (playerType === "website") {
      if (src && (src.startsWith("http://") || src.startsWith("https://"))) {
        return `https://image.thum.io/get/${src}`;
      }
      return src;
    }
    return src;
  };

  const getEmbedUrl = (src) => {
    if (!src) return "";
    if (src.includes("youtube.com") || src.includes("youtu.be")) {
      let videoId = "";
      if (src.includes("youtu.be/")) {
        videoId = src.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0];
      } else if (src.includes("youtube.com/shorts/")) {
        videoId = src.split("youtube.com/shorts/")[1]?.split("?")[0]?.split("&")[0];
      } else if (src.includes("v=")) {
        videoId = src.split("v=")[1]?.split("&")[0];
      } else if (src.includes("embed/")) {
        videoId = src.split("embed/")[1]?.split("?")[0];
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : src;
    }
    if (src.includes("instagram.com/reel") || src.includes("instagram.com/p")) {
      const cleanUrl = src.split("?")[0].replace(/\/+$/, "");
      return `${cleanUrl}/embed/`;
    }
    return src;
  };

  // Find matching industry group and projects
  const group = useMemo(() => {
    return creativeGroups.find(g => g.industry.toLowerCase() === industryName.toLowerCase());
  }, [industryName]);

  const projects = useMemo(() => {
    if (!group) return [];
    return group.images.filter(img => {
      const type = getMediaType(img.type, img.src, img.category);
      return type === categoryInfo.id;
    });
  }, [group, categoryInfo.id]);

  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedImageIndex]);

  const activeImage = selectedImageIndex !== null ? projects[selectedImageIndex] : null;

  return (
    <main id="top">
      <SiteHeader active="portfolio" />

      <section className="section portfolio-hero" style={{ paddingBottom: "32px" }}>
        <div className="portfolio-hero-copy">
          <div className="portfolio-breadcrumbs" style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", color: "var(--muted)", marginBottom: "16px" }}>
            <span style={{ cursor: "pointer" }} onClick={() => router.push("/portfolio")}>Portfolio</span>
            <span>/</span>
            <span>{industryName}</span>
            <span>/</span>
            <span style={{ color: "var(--blue)", fontWeight: "600" }}>{categoryInfo.name}</span>
          </div>
          <h1>{industryName} <span>{categoryInfo.name}</span></h1>
          <p>
            Explore our premium {categoryInfo.name.toLowerCase()} built to drive measurable results for the {industryName} industry.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "0" }}>
        {projects.length > 0 ? (
          <div className="creative-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
            {projects.map((img, index) => (
              <div
                className="creative-card"
                key={img.src}
                onClick={() => setSelectedImageIndex(index)}
                style={{ cursor: "pointer" }}
              >
                <div className="creative-img-wrapper" style={{ position: "relative", width: "100%", height: "220px", borderRadius: "8px", overflow: "hidden" }}>
                  {(() => {
                    const playerType = getPlayerType(img.src, img.type);
                    const isExternalUrl = img.src && (img.src.startsWith("http://") || img.src.startsWith("https://"));

                    if (playerType === "video") {
                      if (videoErrors[img.src]) {
                        return (
                          <div
                            className="creative-img-fallback"
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "linear-gradient(135deg, #1f2937, #111827)",
                              color: "#9ca3af"
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "40px", color: "#e56030", marginBottom: "8px" }}>
                              videocam_off
                            </span>
                            <span>Video Unavailable</span>
                          </div>
                        );
                      }
                      return (
                        <video
                          src={img.src}
                          className="creative-img"
                          style={{ objectFit: "cover", width: "100%", height: "100%" }}
                          muted
                          playsInline
                          loop
                        />
                      );
                    }

                    if (playerType === "website") {
                      const thumb = img.thumbnail || (isExternalUrl ? `https://image.thum.io/get/${img.src}` : img.src);
                      return (
                        <img
                          src={thumb}
                          alt={img.title}
                          className="creative-img"
                          style={{ objectFit: "cover", width: "100%", height: "100%" }}
                        />
                      );
                    }

                    const thumb = getThumbnail(img.src, img.type) || "/placeholder.jpg";
                    return (
                      <img
                        src={thumb}
                        alt={img.title}
                        className="creative-img"
                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                      />
                    );
                  })()}
                  <div className="creative-overlay">
                    <div className="creative-overlay-icon">
                      <span className="material-symbols-outlined">
                        {getPlayerType(img.src, img.type) === "image" ? "zoom_in" : "play_circle"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="creative-card-info" style={{ marginTop: "12px" }}>
                  <h4 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 6px" }}>{img.title}</h4>
                  <p style={{ color: "var(--muted)", fontSize: "14px", margin: "0" }}>{img.description}</p>
                  
                  {getPlayerType(img.src, img.type) === "website" && img.src && (
                    <a
                      href={img.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="open-website-btn"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        marginTop: "12px",
                        backgroundColor: "#d63e13",
                        color: "#fff",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        textDecoration: "none"
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>open_in_new</span>
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "48px 24px", border: "1px dashed var(--card-border)", borderRadius: "12px", background: "var(--card-bg)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "48px", color: "var(--muted)", marginBottom: "16px" }}>
              {categoryInfo.icon}
            </span>
            <h3>No {categoryInfo.name} Found Yet</h3>
            <p style={{ color: "var(--muted)", maxWidth: "480px", margin: "8px auto 24px" }}>
              We haven't uploaded any specific {categoryInfo.name.toLowerCase()} projects for the {industryName} industry yet. But we can build a fully customized one for you!
            </p>
            <button
              onClick={() => {
                router.push("/#contact");
                setTimeout(() => {
                  const messageInput = document.querySelector("#contact textarea");
                  if (messageInput) {
                    messageInput.value = `Hi, I am interested in ordering a customized ${categoryInfo.label} for the ${industryName} industry.`;
                  }
                }, 800);
              }}
              className="button button-primary"
            >
              Order Custom {categoryInfo.name}
            </button>
          </div>
        )}

        {/* CTA section at the bottom */}
        {projects.length > 0 && (
          <div style={{ marginTop: "64px", background: "linear-gradient(135deg, #1e293b, #0f172a)", color: "#fff", borderRadius: "16px", padding: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
            <div>
              <h3 style={{ margin: "0 0 8px", fontSize: "24px" }}>Need custom {categoryInfo.name.toLowerCase()} for your {industryName} business?</h3>
              <p style={{ margin: "0", color: "#94a3b8" }}>Get in touch for a custom audit and tailored solutions built for growth.</p>
            </div>
            <button
              onClick={() => {
                router.push("/#contact");
                setTimeout(() => {
                  const messageInput = document.querySelector("#contact textarea");
                  if (messageInput) {
                    messageInput.value = `Hi, I am interested in custom ${categoryInfo.label} solutions for my ${industryName} business.`;
                  }
                }, 800);
              }}
              className="button button-primary"
              style={{ backgroundColor: "var(--orange)" }}
            >
              Get Free Growth Audit
            </button>
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          className="creative-lightbox"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedImageIndex(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div className="lightbox-content-container" style={{ position: "relative", maxWidth: "90vw", maxHeight: "80vh" }}>
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setSelectedImageIndex(null)}
              style={{
                position: "absolute",
                top: "-48px",
                right: "0",
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>close</span>
            </button>

            <div className="lightbox-image-wrapper" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              {(() => {
                const playerType = getPlayerType(activeImage.src, activeImage.type);
                if (playerType === "video") {
                  return (
                    <video
                      src={activeImage.src}
                      style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: "8px" }}
                      controls
                      autoPlay
                    />
                  );
                }
                if (playerType === "youtube" || playerType === "instagram") {
                  return (
                    <iframe
                      src={getEmbedUrl(activeImage.src)}
                      style={{ width: "80vw", height: "50vh", maxWidth: "800px", border: "none", borderRadius: "8px" }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }
                return (
                  <img
                    src={activeImage.src}
                    alt={activeImage.title}
                    style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: "8px", objectFit: "contain" }}
                  />
                );
              })()}
            </div>
            
            <div style={{ color: "#fff", marginTop: "16px", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 4px" }}>{activeImage.title}</h3>
              <p style={{ color: "#94a3b8", margin: "0" }}>{activeImage.description}</p>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </main>
  );
}
