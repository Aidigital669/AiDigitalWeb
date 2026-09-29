"use client";

import { useMemo, useState } from "react";
import CreativeGrid from "./CreativeGrid";

const filters = [
  "All",
  "Website & SEO",
  "Campaigns",
  "AI Videos",
  "Creative Content",
  "Reels"
];

const websiteTypes = ["Static Websites", "Dynamic Websites"];

const industries = [
  {
    name: "Real Estate",
    description:
      "Websites, campaigns, AI property promotions, creative branding, and real estate reels.",
    projects: [
      { title: "Property Listing Website", type: "Website & SEO" },
      { title: "ANV Realty Website", type: "Website & SEO" },
      { title: "Real Estate Lead Campaign", type: "Campaigns" },
      { title: "AI Property Promo", type: "AI Videos" },
      { title: "Real Estate Instagram Reel", type: "Reels" }
    ]
  },
  {
    name: "Education",
    description:
      "Educational websites, admission campaigns, student-focused creatives, and promotional reels.",
    projects: [
      { title: "School Website", type: "Website & SEO" },
      { title: "Admission Campaign", type: "Campaigns" },
      { title: "Educational AI Video", type: "AI Videos" },
      { title: "Student Awareness Reel", type: "Reels" }
    ]
  },
  {
    name: "Healthcare",
    description:
      "Healthcare websites, awareness campaigns, AI medical videos, and promotional content.",
    projects: [
      { title: "Hospital Website", type: "Website & SEO" },
      { title: "Healthcare Campaign", type: "Campaigns" },
      { title: "AI Medical Promo", type: "AI Videos" },
      { title: "Healthcare Branding Creative", type: "Creative Content" },
      { title: "Dr. Ritesh Gupta Promo", type: "AI Videos" }
    ]
  },
  {
    name: "Finance",
    description:
      "Finance dashboards, investment campaigns, branding creatives, and educational reels.",
    projects: [
      { title: "Finance Dashboard", type: "Website & SEO" },
      { title: "Investment Campaign", type: "Campaigns" },
      { title: "Finance Social Creative", type: "Creative Content" },
      { title: "Finance Awareness Reel", type: "Reels" },
      { title: "RR Capital Promo", type: "AI Videos" },
      { title: "TaxClair AI Promo", type: "AI Videos" }
    ]
  },
  {
    name: "Hospitality",
    description:
      "Hotel booking platforms, restaurant campaigns, AI hospitality promos, and social media reels.",
    projects: [
      { title: "Hotel Booking Website", type: "Website & SEO" },
      { title: "Restaurant Campaign", type: "Campaigns" },
      { title: "AI Hotel Promo", type: "AI Videos" },
      { title: "Hospitality Reel", type: "Reels" }
    ]
  },
  {
    name: "Solar",
    description:
      "Solar websites, green energy campaigns, AI solar videos, and promotional clean energy reels.",
    projects: [
      { title: "Solar Landing Page", type: "Website & SEO" },
      { title: "Green Energy Campaign", type: "Campaigns" },
      { title: "KwikM Solar Promo", type: "AI Videos" }
    ]
  },
  {
    name: "Agriculture",
    description:
      "Agricultural products, cattle nutrition, organic manure, crop protection, and farming solution creatives.",
    projects: [
      { title: "Suday Healthcare Cattle Nutrition", type: "Creative Content" },
      { title: "Suday Healthcare Daymin Gold AD3", type: "Creative Content" },
      { title: "Mack Agro Mack 007 Organic Manure", type: "Creative Content" },
      { title: "Mack Agro Farming Revolution", type: "Creative Content" },
      { title: "Agrifield Magic Flower Drop Control", type: "Creative Content" },
      { title: "Agrifield Magic Crop Protection", type: "Creative Content" },
      { title: "Agricultural Landing Page", type: "Website & SEO" },
      { title: "Sustainable Farm Campaign", type: "Campaigns" },
      { title: "Mack Agro Promo", type: "AI Videos" }
    ]
  },
  {
    name: "Construction",
    description:
      "All-in-one Construction ERP & Project Management software showcase, web portal, and local SEO campaign.",
    projects: [
      { title: "Hitoffice Construction ERP", type: "Website & SEO" }
    ]
  },
  {
    name: "E-Commerce",
    description:
      "High-converting e-commerce platforms, wellness product showcases, and retail marketing campaigns.",
    projects: [
      { title: "Ayurmor Ayurvedic Wellness", type: "Website & SEO" },
      { title: "Pureplush E-Commerce", type: "Website & SEO" }
    ]
  }
];

const filterIcons = {
  "Website & SEO": "language",
  Campaigns: "campaign",
  "AI Videos": "movie",
  "Creative Content": "palette",
  Reels: "smart_display"
};

const otherProjects = [
  { title: "E-commerce Store Development", type: "Website & SEO" },
  { title: "SaaS Platform Launch Campaign", type: "Campaigns" },
  { title: "AI Voice Agent Demo Video", type: "AI Videos" },
  { title: "Corporate Identity Redesign", type: "Creative Content" },
  { title: "Product Launch Promotional Reel", type: "Reels" },
  { title: "Custom Dashboard Integration", type: "Website & SEO" }
];

import { useEffect, useMemo, useState } from "react";
import CreativeGrid from "./CreativeGrid";
import { useVisibility } from "../context/VisibilityContext";

const filterTypeKeyMap = {
  "Website & SEO": "portfolio_type_websites",
  "Campaigns": "portfolio_type_campaigns",
  "AI Videos": "portfolio_type_aivideos",
  "Creative Content": "portfolio_type_creatives",
  "Reels": "portfolio_type_reels",
};

const industryKeyMap = {
  "Real Estate": "portfolio_ind_realestate",
  "Education": "portfolio_ind_education",
  "Healthcare": "portfolio_ind_healthcare",
  "Finance": "portfolio_ind_finance",
  "Hospitality": "portfolio_ind_hospitality",
  "Hotels and Resorts": "portfolio_ind_hospitality",
  "Hospitality & Food": "portfolio_ind_hospitality",
  "Solar": "portfolio_ind_solar",
  "Agriculture": "portfolio_ind_agriculture",
  "Construction": "portfolio_ind_construction",
  "E-Commerce": "portfolio_ind_ecommerce",
  "Interior Design": "portfolio_ind_interior",
  "Technology & Apps": "portfolio_ind_tech",
  "Tours & Travels": "portfolio_ind_travel",
  "Sports": "portfolio_ind_sports",
  "Car Dealership": "portfolio_ind_cars",
  "Digital Marketing": "portfolio_ind_marketing",
};

export default function FeaturedWork() {
  const { isVisible } = useVisibility();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOthers, setShowOthers] = useState(false);
  const [industriesState, setIndustriesState] = useState(industries);
  const [otherProjectsState, setOtherProjectsState] = useState(otherProjects);

  // Filter out any service filter pill whose type is hidden in admin
  const availableFilters = useMemo(() => {
    return filters.filter((filter) => {
      if (filter === "All") return true;
      const key = filterTypeKeyMap[filter];
      return key ? isVisible(key) : true;
    });
  }, [isVisible]);

  // If current active filter gets hidden, auto-fallback to "All"
  useEffect(() => {
    if (activeFilter !== "All") {
      const key = filterTypeKeyMap[activeFilter];
      if (key && !isVisible(key)) {
        setActiveFilter("All");
      }
    }
  }, [activeFilter, isVisible]);

  const visibleIndustries = useMemo(() => {
    return industriesState
      .filter((industry) => {
        const indKey = industryKeyMap[industry.name];
        if (indKey && !isVisible(indKey)) return false;
        return true;
      })
      .map((industry) => ({
        ...industry,
        projects: industry.projects.filter((project) => {
          const typeKey = filterTypeKeyMap[project.type];
          if (typeKey && !isVisible(typeKey)) return false;
          if (activeFilter === "All") return true;
          return project.type === activeFilter;
        })
      }))
      .filter((industry) => industry.projects.length > 0);
  }, [activeFilter, industriesState, isVisible]);

  const visibleOtherProjects = useMemo(() => {
    return otherProjectsState.filter((project) => {
      const typeKey = filterTypeKeyMap[project.type];
      if (typeKey && !isVisible(typeKey)) return false;
      if (activeFilter === "All") return true;
      return project.type === activeFilter;
    });
  }, [activeFilter, otherProjectsState, isVisible]);

  return (
    <section id="portfolio" className="section featured-work">
      <div className="section-heading">
        <h2>Featured Projects</h2>
        <p>
          A showcase of our best websites, campaigns, AI videos, creatives, and reels.
        </p>
      </div>

      {isVisible("portfolio_search_bar") && (
        <div className="project-search-row">
          <div className="project-search-bar">
            <span className="material-symbols-outlined search-icon" aria-hidden="true">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, keyword, or industry..."
              aria-label="Search projects"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
        </div>
      )}

      {isVisible("portfolio_filter_bar") && (
        <div className="work-filter-row" aria-label="Service filters">
          {availableFilters.map((filter) => (
            <button
              type="button"
              key={filter}
              className={activeFilter === filter ? "active" : ""}
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {activeFilter === "Website & SEO" && isVisible("portfolio_type_websites") && (
        <div className="website-type-row" aria-label="Website and SEO project types">
          {websiteTypes.map((type) => (
            <span key={type}>{type}</span>
          ))}
        </div>
      )}

      <div className="industry-list">
        {activeFilter === "Creative Content" || activeFilter === "AI Videos" || activeFilter === "Reels" || activeFilter === "Website & SEO" || activeFilter === "All" || activeFilter === "Campaigns" ? (
          <CreativeGrid
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        ) : (
          <>
            {visibleIndustries.map((industry) => (
              <article className="industry-section" key={industry.name}>
                <div className="industry-copy">
                  <span className="industry-label">Industry</span>
                  <h3>{industry.name}</h3>
                  <p>{industry.description}</p>
                </div>
                <div className="featured-project-grid">
                  {industry.projects.map((project) => (
                    <div className="featured-project-card" key={project.title}>
                      <span className="material-symbols-outlined" aria-hidden="true">
                        {filterIcons[project.type] ?? "dashboard"}
                      </span>
                      <strong>{project.title}</strong>
                      <small>{project.type}</small>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </>
        )}

        {isVisible("portfolio_other_projects") && visibleOtherProjects.length > 0 && (
          <div className="others-toggle-container">
            <button
              type="button"
              className={`others-toggle-button ${showOthers ? "active" : ""}`}
              onClick={() => setShowOthers(!showOthers)}
              aria-expanded={showOthers}
            >
              <span>{showOthers ? "Show Fewer Projects" : "View Other Projects"}</span>
              <span className="material-symbols-outlined">
                {showOthers ? "keyboard_arrow_up" : "keyboard_arrow_down"}
              </span>
            </button>
          </div>
        )}

        {isVisible("portfolio_other_projects") && showOthers && (
          <CreativeGrid
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onlyShowOtherCreative={true}
          />
        )}

      </div>
    </section>
  );
}
