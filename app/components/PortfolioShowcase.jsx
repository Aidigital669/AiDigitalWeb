"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Icon } from "./SiteChrome";

const showcaseProjects = [
  {
    id: "proj-1",
    title: "Real Estate SEO Portal",
    category: "Website & SEO",
    industry: "Real Estate",
    metric: "+142%",
    metricLabel: "Organic Traffic",
    description:
      "A conversion-focused property listing website optimized for Local SEO, featuring advanced lead capture and campaign-ready landing pages.",
    tags: ["Real Estate SEO", "Lead Generation", "UI/UX Design"],
    accent: "blue",
    icon: "language"
  },
  {
    id: "proj-2",
    title: "AI Real Estate Video Ads",
    category: "Video Marketing",
    industry: "Real Estate",
    metric: "3.8x",
    metricLabel: "Ad ROAS",
    description:
      "AI-driven property video concepting and short-form video ads engineered for maximum reach on paid and organic social media channels.",
    tags: ["AI Video Marketing", "Instagram Reels", "Paid Social Ads"],
    accent: "orange",
    icon: "movie"
  },
  {
    id: "proj-3",
    title: "Fintech Web Platform",
    category: "Website & SEO",
    industry: "Finance",
    metric: "+78%",
    metricLabel: "Qualified Leads",
    description:
      "A secure, dashboard-style fintech web platform designed for finance education, building investor trust, and driving inbound lead generation.",
    tags: ["Fintech Web Design", "Content SEO", "Lead Gen Analytics"],
    accent: "blue",
    icon: "query_stats"
  },
  {
    id: "proj-4",
    title: "Ayurmor Wellness",
    category: "E-Commerce & SEO",
    industry: "Health & Wellness",
    metric: "+210%",
    metricLabel: "Organic Sales",
    description:
      "An SEO-optimized e-commerce platform for 100% natural Ayurvedic wellness & instant superfood drinks. Features rich product schemas and trust badges.",
    tags: ["E-Commerce SEO", "Schema Markup", "Conversion UX"],
    accent: "green",
    icon: "shopping_cart"
  },
  {
    id: "proj-5",
    title: "Pureplush E-Commerce",
    category: "E-Commerce & SEO",
    industry: "Retail",
    metric: "+185%",
    metricLabel: "Sales Growth",
    description:
      "A premium retail e-commerce platform designed with an optimized checkout flow and visually engaging product showcases.",
    tags: ["E-Commerce", "Checkout Optimization", "Retail UI"],
    accent: "orange",
    icon: "storefront"
  }
];

export default function PortfolioShowcase() {
  const [showcaseProjectsState] = useState(showcaseProjects);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  const activeProject = showcaseProjectsState[activeIndex] || showcaseProjectsState[0] || { tags: [] };

  useEffect(() => {
    if (showcaseProjectsState.length === 0 || isPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % showcaseProjectsState.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [showcaseProjectsState.length, isPaused]);

  const previewBars = useMemo(() => [78, 58, 88, 48, 70], []);

  function moveSlide(direction) {
    if (showcaseProjectsState.length === 0) return;
    setActiveIndex((current) => {
      const next = current + direction;
      if (next < 0) return showcaseProjectsState.length - 1;
      return next % showcaseProjectsState.length;
    });
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) moveSlide(1);
      else moveSlide(-1);
    }
    touchStartX.current = null;
  };

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Digital Marketing & SEO Web Design Portfolio",
    "description": "High-converting SEO websites, performance marketing campaigns, and AI videos built for measurable ROI.",
    "itemListElement": showcaseProjectsState.map((proj, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "item": {
        "@type": "CreativeWork",
        "name": proj.title,
        "genre": proj.category,
        "keywords": proj.tags.join(", "),
        "description": proj.description
      }
    }))
  };

  return (
    <section 
      className="section portfolio-hero" 
      aria-labelledby="portfolio-hero-title"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      <div className="portfolio-hero-copy">
        <span className="eyebrow">Our Success Stories</span>
        <h1 id="portfolio-hero-title">Digital Growth Portfolio</h1>
        <p>
          Explore high-converting SEO websites, performance marketing campaigns, 
          AI videos, and creatives built for scalable growth and measurable ROI.
        </p>

        <div className="showcase-category-chips" aria-label="Project showcase categories">
          {showcaseProjectsState.map((proj, idx) => (
            <button
              key={proj.id}
              type="button"
              className={`chip-btn ${activeIndex === idx ? "active" : ""}`}
              onClick={() => setActiveIndex(idx)}
            >
              <Icon name={proj.icon} />
              <span>{proj.industry}</span>
            </button>
          ))}
        </div>
      </div>

      <article 
        className={`portfolio-slider-card ${activeProject.accent}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-roledescription="carousel"
        aria-label={`Project ${activeIndex + 1} of ${showcaseProjectsState.length}: ${activeProject.title}`}
      >
        <div className="card-progress-bar">
          <div 
            key={activeIndex} 
            className={`card-progress-fill ${isPaused ? "paused" : ""}`} 
          />
        </div>

        <div className="portfolio-slide-topline">
          <span>{activeProject.category}</span>
          <strong>{activeProject.industry}</strong>
        </div>

        <div className="portfolio-slide-grid" key={activeProject.id}>
          <div className="portfolio-slide-content">
            <div className="slide-icon-wrapper">
              <Icon name={activeProject.icon} />
            </div>
            <h2>{activeProject.title}</h2>
            <p>{activeProject.description}</p>
            <div className="portfolio-tag-row">
              {activeProject.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <a href="#portfolio" className="slide-cta-btn">
              <span>Explore Portfolio</span>
              <Icon name="arrow_forward" />
            </a>
          </div>

          <div className="portfolio-preview" aria-hidden="true">
            <div className="preview-toolbar">
              <span />
              <span />
              <span />
            </div>
            <div className="preview-metric">
              <small>{activeProject.metricLabel}</small>
              <strong>{activeProject.metric}</strong>
            </div>
            <div className="preview-chart">
              {previewBars.map((height, index) => (
                <span
                  key={`${activeProject.title}-${index}`}
                  style={{ "--bar-height": `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="portfolio-slider-dots" aria-label="Choose featured project">
          {showcaseProjectsState.map((project, index) => (
            <button
              type="button"
              key={project.title}
              className={activeIndex === index ? "active" : ""}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${project.title}`}
              aria-pressed={activeIndex === index}
            />
          ))}
        </div>
      </article>
    </section>
  );
}
