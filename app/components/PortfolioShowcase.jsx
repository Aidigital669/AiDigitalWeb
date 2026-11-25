"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Icon } from "./SiteChrome";

const showcaseProjects = [
  {
    id: "proj-education",
    title: "EduPulse Learning Academy",
    category: "EdTech & Student Enrollment",
    industry: "Education",
    metric: "+320%",
    metricLabel: "Admission Inquiries",
    description:
      "High-converting admission lead funnels, targeted Google Search campaigns, and dynamic course landing pages engineered for schools, universities, and coaching institutes.",
    tags: ["Admission Campaigns", "EdTech SEO", "Lead Gen Funnel"],
    accent: "blue",
    icon: "school"
  },
  {
    id: "proj-healthcare",
    title: "MedCare Multispeciality Hospital",
    category: "Patient Acquisition & Local SEO",
    industry: "Healthcare",
    metric: "+185%",
    metricLabel: "Patient Appointments",
    description:
      "HIPAA-compliant doctor appointment portals, local hospital search optimization, and targeted Meta Ads campaigns driving verified patient consultations.",
    tags: ["Doctor Appointments", "Local Healthcare SEO", "Medical Ads"],
    accent: "green",
    icon: "medical_services"
  },
  {
    id: "proj-fashion",
    title: "Aura Couture & Apparel",
    category: "D2C E-Commerce & Paid Social",
    industry: "Fashion",
    metric: "4.6x",
    metricLabel: "Ad ROAS Scaled",
    description:
      "High-converting Shopify storefronts, cinematic AI fashion teasers, and viral Instagram Reel funnels delivering scalable return-on-ad-spend for designer apparel.",
    tags: ["Fashion E-Commerce", "Instagram Reels", "ROAS Scaling"],
    accent: "orange",
    icon: "checkroom"
  },
  {
    id: "proj-commercial-vehicle",
    title: "Apex Fleet & Commercial Motors",
    category: "B2B Dealership & PPC Funnel",
    industry: "Commercial Vehicle",
    metric: "+240%",
    metricLabel: "Fleet Dealership Leads",
    description:
      "Heavy transport, truck, and commercial fleet sales lead funnels with geo-targeted Google Ads, WhatsApp CRM integration, and high-trust commercial vehicle showcase pages.",
    tags: ["Commercial Fleet Leads", "B2B Google Ads", "Dealership CRM"],
    accent: "blue",
    icon: "local_shipping"
  },
  {
    id: "proj-technology",
    title: "CloudStack SaaS & Enterprise AI",
    category: "SaaS Growth & Performance Marketing",
    industry: "Technology",
    metric: "+310%",
    metricLabel: "Demo Sign-Ups",
    description:
      "Full-funnel B2B performance marketing, product-led SEO landing pages, and interactive software demo funnels engineered for enterprise tech and SaaS startups.",
    tags: ["SaaS Performance Marketing", "B2B Tech SEO", "Demo Conversion UX"],
    accent: "blue",
    icon: "devices"
  },
  {
    id: "proj-finance",
    title: "FinVertex Wealth & Advisory",
    category: "Fintech Web & Qualified Lead Gen",
    industry: "Finance",
    metric: "+165%",
    metricLabel: "Qualified HNI Leads",
    description:
      "High-trust wealth management web platforms, investor credibility funnels, and performance marketing driving verified inbound inquiries for financial advisory firms.",
    tags: ["Fintech Platform", "Wealth Advisory", "High-ROAS Funnel"],
    accent: "green",
    icon: "query_stats"
  },
  {
    id: "proj-other",
    title: "OmniScale Custom Growth & Branding",
    category: "Omnichannel Brand Scaling",
    industry: "Other",
    metric: "5.2x",
    metricLabel: "Revenue Multiplier",
    description:
      "Tailored 360° growth solutions, custom video productions, corporate branding identities, and multi-channel ad scaling for diverse niche businesses.",
    tags: ["Custom Brand Identity", "Omnichannel Growth", "Video Production"],
    accent: "orange",
    icon: "category"
  }
];

const serviceFilters = [
  "All",
  "Website and Seo",
  "Ai Videos",
  "Creative Content",
  "Reels"
];

export default function PortfolioShowcase({ 
  activeFilter = "All", 
  setActiveFilter,
  activeIndustry,
  setActiveIndustry 
}) {
  const [showcaseProjectsState] = useState(showcaseProjects);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  // Sync activeIndex if activeIndustry is passed from outside
  useEffect(() => {
    if (activeIndustry) {
      const idx = showcaseProjectsState.findIndex(
        (p) => p.industry.toLowerCase() === activeIndustry.toLowerCase() ||
               (activeIndustry === "Technology" && p.industry.includes("Technology"))
      );
      if (idx !== -1 && idx !== activeIndex) {
        setActiveIndex(idx);
      }
    }
  }, [activeIndustry, showcaseProjectsState]);

  const activeProject = showcaseProjectsState[activeIndex] || showcaseProjectsState[0] || { tags: [] };

  useEffect(() => {
    if (showcaseProjectsState.length === 0 || isPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % showcaseProjectsState.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [showcaseProjectsState.length, isPaused]);

  const previewBars = useMemo(() => [78, 58, 88, 48, 70, 85, 62], []);

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

  // Scroll to Category Chips when a top filter is chosen
  const handleTopFilterClick = (filter) => {
    if (setActiveFilter) setActiveFilter(filter);
    const catEl = document.getElementById("portfolio-categories");
    if (catEl) {
      const headerOffset = 110;
      const y = catEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      catEl.classList.add("categories-highlight-pulse");
      setTimeout(() => {
        catEl.classList.remove("categories-highlight-pulse");
      }, 2000);
    }
  };

  // Scroll to Content Area for that category when a category chip is chosen
  const handleCategoryChipClick = (proj, idx) => {
    setActiveIndex(idx);
    if (setActiveIndustry) setActiveIndustry(proj.industry);

    const slug = proj.industry.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setTimeout(() => {
      let target = document.getElementById(`industry-${slug}`);
      if (!target && proj.industry === "Technology") {
        target = document.getElementById("industry-technology") || document.getElementById("industry-technology-apps");
      }
      if (!target && proj.industry === "Other") {
        target = document.getElementById("industry-other") || document.querySelector(".others-toggle-container") || document.getElementById("portfolio");
      }
      if (!target) {
        // Fallback search by heading text inside industry sections
        const headings = document.querySelectorAll(".industry-copy h3");
        for (const h of headings) {
          const hText = h.textContent.trim().toLowerCase();
          if (hText === proj.industry.toLowerCase() || (proj.industry === "Technology" && hText.includes("technology"))) {
            target = h.closest("article");
            break;
          }
        }
      }

      if (target) {
        const headerOffset = 90;
        const y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
        target.classList.add("highlight-category-target");
        setTimeout(() => {
          target.classList.remove("highlight-category-target");
        }, 2500);
      } else {
        const portfolioEl = document.getElementById("portfolio");
        if (portfolioEl) {
          portfolioEl.scrollIntoView({ behavior: "smooth" });
        }
      }
    }, 100);
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

      {/* Top Blank Area Filter Buttons */}
      <div className="portfolio-hero-top-filter-bar">
        <div className="work-filter-row" aria-label="Service filters">
          {serviceFilters.map((filter) => (
            <button
              type="button"
              key={filter}
              className={activeFilter === filter ? "active" : ""}
              aria-pressed={activeFilter === filter}
              onClick={() => handleTopFilterClick(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="portfolio-hero-copy">
        <span className="eyebrow">Our Success Stories</span>
        <h1 id="portfolio-hero-title">Digital Growth Portfolio</h1>
        <p>
          Explore high-converting SEO websites, performance marketing campaigns, 
          AI videos, and creatives built for scalable growth and measurable ROI.
        </p>

        {/* Category Chips: Connected to scroll down to content area */}
        <div 
          id="portfolio-categories" 
          className="showcase-category-chips" 
          aria-label="Project showcase categories"
        >
          {showcaseProjectsState.map((proj, idx) => (
            <button
              key={proj.id}
              type="button"
              className={`chip-btn ${activeIndex === idx ? "active" : ""}`}
              onClick={() => handleCategoryChipClick(proj, idx)}
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

            <a 
              href="#portfolio" 
              className="slide-cta-btn"
              onClick={(e) => {
                e.preventDefault();
                handleCategoryChipClick(activeProject, activeIndex);
              }}
            >
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
              onClick={() => handleCategoryChipClick(project, index)}
              aria-label={`Show ${project.title}`}
              aria-pressed={activeIndex === index}
            />
          ))}
        </div>
      </article>
    </section>
  );
}
