"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Icon, SiteFooter, SiteHeader } from "../components/SiteChrome";
import { useCart } from "../hooks/useCart";
import { useRouter } from "next/navigation";
import useScrollReveal from "../hooks/useScrollReveal";
import { useVisibility } from "../context/VisibilityContext";
import PageHiddenNotice from "../components/PageHiddenNotice";

const defaultCpTiers = [
  {
    id: "plan_google_ads",
    name: "Google Ads Management",
    scope: "Google Ads Management",
    ticketRange: "Paid Search & PPC",
    category: "ads",
    price: 7500,
    priceDisplay: "7,500",
    period: "per Month",
    monthlyEffective: "₹7,500 Effective per Month",
    subtitle: "High-Intent Google Search, PPC, Display & Performance Max Ad Campaigns",
    icon: "ads_click",
    popular: true,
    features: [
      "Google Search & PPC Setup",
      "High-Intent Keyword Research",
      "Negative Keyword Filtering",
      "Conversion & Goal Tracking",
      "Monthly ROAS Optimization & Reporting"
    ]
  },
  {
    id: "plan_meta_ads",
    name: "Meta Ads (FB & Instagram)",
    scope: "Meta Ads",
    ticketRange: "Paid Social",
    category: "ads",
    price: 3000,
    priceDisplay: "3,000",
    period: "per Month",
    monthlyEffective: "₹3,000 Effective per Month",
    subtitle: "Laser-Targeted Instagram & Facebook Paid Ads & Retargeting Funnels",
    icon: "share",
    popular: false,
    features: [
      "Facebook & Instagram Ads Setup",
      "Audience Demographic Targeting",
      "Ad Creative & Copy Testing",
      "Meta Pixel & Event Integration",
      "Lead Generation & Traffic Funnels"
    ]
  },
  {
    id: "plan_perf_meta",
    name: "Performance Marketing (Meta)",
    scope: "Performance Marketing (Meta)",
    ticketRange: "Paid Social Growth",
    category: "performance",
    price: 5000,
    priceDisplay: "5,000",
    period: "per Month",
    monthlyEffective: "₹5,000 Effective per Month",
    subtitle: "Full-Funnel Meta Conversion Scaling, CAC Reduction & Laser Instagram Targeting",
    icon: "trending_up",
    popular: false
  },
  {
    id: "plan_perf_google",
    name: "Performance Marketing (Google)",
    scope: "Performance Marketing (Google)",
    ticketRange: "Paid Search & P-Max Growth",
    category: "performance",
    price: 10000,
    priceDisplay: "10,000",
    period: "per Month",
    monthlyEffective: "₹10,000 Effective per Month",
    subtitle: "High-ROAS Google Search, Performance Max Scaling & Conversion Optimization",
    icon: "trending_up",
    popular: false
  },
  {
    id: "plan_perf_both",
    name: "Performance Marketing (Meta & Google)",
    scope: "Performance Marketing (Meta & Google)",
    ticketRange: "Full-Funnel Dual Engine",
    category: "performance",
    price: 15000,
    priceDisplay: "15,000",
    period: "per Month",
    monthlyEffective: "₹15,000 Effective per Month",
    subtitle: "Omnichannel Cross-Platform Scaling, CAC Reduction & Combined Attribution on Meta + Google",
    icon: "trending_up",
    popular: true
  },
  {
    id: "plan_reel_shoot",
    name: "Reel Shoot",
    scope: "Reel Shoot",
    ticketRange: "Media Production",
    category: "media",
    price: 6000,
    priceDisplay: "6,000",
    period: "Starting from",
    monthlyEffective: "Starts at ₹6,000 per Shoot",
    subtitle: "On-Location Shoot with Scripting, Direction & 4K Video Editing",
    icon: "videocam",
    popular: false,
    features: [
      "On-Location HD / 4K Shoot",
      "Direction & Creative Coaching",
      "Scripted Concepts & Storylines",
      "Studio Lighting & Pro Audio Sync",
      "3-5 High-Converting Reels/Shorts"
    ]
  },
  {
    id: "plan_ai_videos",
    name: "AI Videos",
    scope: "AI Videos",
    ticketRange: "AI Media",
    category: "media",
    price: 599,
    priceDisplay: "599",
    period: "Starting from",
    monthlyEffective: "Starts at ₹599 per Video",
    subtitle: "Cinematic AI Promotional Videos, Realistic Voiceovers & Viral Product Teasers",
    icon: "movie",
    popular: false,
    features: [
      "AI Video Generation (30-45 Sec)",
      "Realistic AI Voiceover & Scripts",
      "Cinematic Visuals & Transitions",
      "Sound Effects & Background Audio",
      "Ready for Reels, Shorts & Ads"
    ]
  },
  {
    id: "plan_social_graphics",
    name: "Social Media Graphics (10 Posts)",
    scope: "Social Media Graphics",
    ticketRange: "Content Pack",
    category: "media",
    price: 500,
    priceDisplay: "500",
    period: "for 10 Posts",
    monthlyEffective: "Just ₹50 per Custom Creative",
    subtitle: "10 Custom High-Res Branded Post Creatives, Flyers & Promotional Banners",
    icon: "palette",
    popular: true,
    features: [
      "10 Custom High-Res Post Graphics",
      "Brand Palette & Font Matching",
      "Promotional Flyers & Banners",
      "Optimized for Instagram, FB & LinkedIn",
      "PNG & JPG Formats Included"
    ]
  },
  {
    id: "plan_website_dev",
    name: "Website Development",
    scope: "Website Development",
    ticketRange: "Web & Tech",
    category: "growth",
    price: 5000,
    priceDisplay: "5,000",
    period: "Starting from",
    monthlyEffective: "Starts at ₹5,000 One-Time",
    subtitle: "High-Speed, Mobile-Responsive, SEO-Ready Business Website & Landing Pages",
    icon: "desktop_windows",
    popular: false,
    features: [
      "Custom Responsive Website / Landing Page",
      "Mobile, Tablet & Desktop Optimized",
      "Fast Loading Speed & High-CRO Layout",
      "Contact Form & WhatsApp Integration",
      "Basic SEO Meta Tags & Schema"
    ]
  },
  {
    id: "plan_brand_dev",
    name: "Brand Development Program",
    scope: "Brand Development Program",
    ticketRange: "Brand Authority",
    category: "growth",
    price: 20000,
    priceDisplay: "20,000",
    period: "Starting from",
    monthlyEffective: "Starts at ₹20,000 One-Time",
    subtitle: "360° Complete Brand Identity, Logo Design, Guidelines & Launch Strategy",
    icon: "workspace_premium",
    popular: true,
    features: [
      "Official Logo Design & Icon Variations",
      "Brand Color Palette & Typography Rules",
      "Complete Brand Style Guidelines Doc",
      "Collateral Kit (Cards, Letterhead, Social Kit)",
      "Brand Positioning & Market Launch Strategy"
    ]
  }
];

const defaultPillars = [
  {
    title: "Google & Meta Ads Management",
    desc: "High-intent Google Search (₹7,500) and laser-targeted Meta Ads (₹3,000) built for scalable lead generation.",
    icon: "ads_click"
  },
  {
    title: "Performance Marketing",
    desc: "Advanced multi-channel attribution and CAC reduction across Meta (₹5,000) and Google (₹10,000).",
    icon: "trending_up"
  },
  {
    title: "Professional Media & Video Shoots",
    desc: "On-location reel shoots (₹6,000) and high-impact AI promotional video production (₹599).",
    icon: "videocam"
  },
  {
    title: "Content, Web & Brand Growth",
    desc: "10 custom social graphics for ₹500, modern websites from ₹5,000, and 360° brand development programs from ₹20,000.",
    icon: "workspace_premium"
  }
];

const defaultDeliverables = [
  { title: "Google Ads & PPC Campaigns", desc: "High-intent keyword targeting, negative keyword filtering, conversion tracking & monthly ROAS scaling (₹7,500/mo).", icon: "ads_click" },
  { title: "Meta Ads & Retargeting Funnels", desc: "Laser audience segmentation, creative visual testing & lead generation on Facebook & Instagram (₹3,000/mo).", icon: "share" },
  { title: "Data-Driven Performance Marketing", desc: "Advanced full-funnel CAC reduction and conversion scaling on Meta (₹5,000) & Google (₹10,000).", icon: "trending_up" },
  { title: "Professional Reel Shoots & Video Content", desc: "On-location shoots with scripted concepts, studio lighting & 4K editing (Starts at ₹6,000).", icon: "videocam" },
  { title: "AI Promotional Videos & Teasers", desc: "AI-generated short video reels with realistic voiceovers, dynamic visuals & captions (Starts at ₹599).", icon: "movie" },
  { title: "Social Media Graphics Pack", desc: "10 custom high-resolution branded post creatives, promotional flyers & banners (₹500 for 10 Posts).", icon: "palette" },
  { title: "High-Conversion Website Development", desc: "Lightning-fast, mobile-responsive, SEO-optimized business websites & landing funnels (Starts at ₹5,000).", icon: "desktop_windows" },
  { title: "360° Brand Development Program", desc: "Complete brand identity: custom logo, color system, style guidelines & launch roadmap (Starts at ₹20,000).", icon: "workspace_premium" }
];

const defaultFaqs = [
  {
    question: "Which plan is best for getting immediate customer inquiries?",
    answer: "For immediate high-intent leads, our Google Ads Management (₹7,500/mo) and Meta Ads (₹3,000/mo) or Performance Marketing (Meta ₹5,000 / Google ₹10,000) deliver measurable customer inquiries within days."
  },
  {
    question: "What is included in the Reel Shoot (Starting ₹6,000)?",
    answer: "It includes an on-location video shoot featuring scripted creative concepts, professional lighting, directional coaching, and 3-5 edited high-converting reels/shorts."
  },
  {
    question: "How does the AI Videos service work (Starting ₹599)?",
    answer: "Our team leverages state-of-the-art AI video tools to create engaging 30-45 second video reels with realistic voiceovers, dynamic visuals, and branded captions optimized for social media ads."
  },
  {
    question: "How fast will my 10 Social Media Graphics (₹500) be delivered?",
    answer: "Initial drafts are typically delivered within 2-3 business days. You receive 10 custom high-resolution graphics matching your brand colors and typography, with one round of revisions included."
  },
  {
    question: "Can I combine multiple services into a custom package?",
    answer: "Absolutely! You can select multiple individual plans or contact our team for a tailored combo package combining website design, social media content, and paid advertising."
  }
];

function PlanTierIcon({ tier }) {
  const tierId = tier?.id || "";
  const tierName = (tier?.name || tier?.scope || "").toLowerCase();

  // 1. Dual Google & Meta
  if (tierId === "plan_perf_both" || (tierName.includes("meta") && tierName.includes("google"))) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }} title="Google & Meta Ads">
        <svg width="20" height="20" viewBox="0 0 48 48" aria-label="Google">
          <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
          <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
          <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.91l7.35-5.73z"/>
          <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
        </svg>
        <span style={{ color: "#8AD6D1", fontWeight: "800", fontSize: "13px" }}>+</span>
        <svg width="20" height="20" viewBox="0 0 48 48" aria-label="Facebook">
          <circle cx="24" cy="24" r="23" fill="#1877F2"/>
          <path fill="#FFFFFF" d="M26.7 38V24.5h4.5l.7-5.2h-5.2v-3.3c0-1.5.4-2.5 2.6-2.5h2.8V8.9c-.5-.1-2.1-.2-4-.2-4 0-6.7 2.4-6.7 6.9v3.7h-4.5v5.2h4.5V38h5.3z"/>
        </svg>
      </div>
    );
  }

  // 2. Google Ads or Performance Marketing (Google)
  if (tierId === "plan_google_ads" || tierId === "plan_perf_google" || (tierName.includes("google") && !tierName.includes("meta"))) {
    return (
      <svg width="26" height="26" viewBox="0 0 48 48" aria-label="Google Ads">
        <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
        <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
        <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.91l7.35-5.73z"/>
        <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
      </svg>
    );
  }

  // 3. Meta Ads or Performance Marketing (Meta)
  if (tierId === "plan_meta_ads" || tierId === "plan_perf_meta" || tierName.includes("meta") || tierName.includes("facebook")) {
    return (
      <svg width="34" height="34" viewBox="0 0 48 48" aria-label="Facebook Meta">
        <circle cx="24" cy="24" r="23" fill="#1877F2"/>
        <path fill="#FFFFFF" d="M26.7 38V24.5h4.5l.7-5.2h-5.2v-3.3c0-1.5.4-2.5 2.6-2.5h2.8V8.9c-.5-.1-2.1-.2-4-.2-4 0-6.7 2.4-6.7 6.9v3.7h-4.5v5.2h4.5V38h5.3z"/>
      </svg>
    );
  }

  return (
    <span className="material-symbols-outlined cp-building-icon">
      {tier?.icon || "star"}
    </span>
  );
}

export default function PricingClientPage() {
  const { isVisible, isPageVisible } = useVisibility();
  const { addToCart, clearCart } = useCart();
  const router = useRouter();

  const [cpTiers, setCpTiers] = useState(defaultCpTiers);
  const [selectedTierId, setSelectedTierId] = useState("plan_google_ads");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [showFlyerModal, setShowFlyerModal] = useState(false);
  const [industryData, setIndustryData] = useState(null);

  useScrollReveal([]);

  // Fetch dynamic plans from API
  useEffect(() => {
    fetch("/api/industry-plans?t=" + Date.now(), { cache: "no-store" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Offline");
      })
      .then((data) => {
        if (data && Array.isArray(data.industries) && data.industries.length > 0) {
          const mainInd = data.industries[0];
          setIndustryData(mainInd);
          if (Array.isArray(mainInd.cpTiers) && mainInd.cpTiers.length > 0) {
            setCpTiers(mainInd.cpTiers);
            if (!mainInd.cpTiers.some((t) => t.id === selectedTierId)) {
              setSelectedTierId(mainInd.cpTiers[0].id);
            }
          }
        }
      })
      .catch((err) => console.warn("Using default service plans:", err));
  }, []);

  const activeTier = cpTiers.find((t) => t.id === selectedTierId) || cpTiers[0] || defaultCpTiers[0];

  const handleBuyNow = (tierToBuy = activeTier) => {
    clearCart();
    const targetTier = tierToBuy || activeTier;
    const finalPrice = Number(targetTier.price) || 5000;
    const finalPriceDisplay = targetTier.priceDisplay || "5,000";
    const planTitle = `${targetTier.name} (₹${finalPriceDisplay})`;

    addToCart({
      id: targetTier.id,
      name: planTitle,
      price: finalPrice,
      period: targetTier.period,
      features: targetTier.features || [
        `Service Scope: ${targetTier.scope}`,
        targetTier.monthlyEffective,
        targetTier.subtitle
      ]
    });
    router.push(`/checkout?plan=${encodeURIComponent(planTitle)}&price=${finalPrice}`);
  };

  const getWhatsAppInquiryUrl = (tier = activeTier) => {
    const finalPriceDisplay = tier.priceDisplay || "5,000";
    const msg = `Hi! I am interested in your ${tier.name} package (₹${finalPriceDisplay} ${tier.period || ""}). Please share more details and help me get started.`;
    return `https://wa.me/919096090701?text=${encodeURIComponent(msg)}`;
  };

  if (!isPageVisible("pricing")) {
    return <PageHiddenNotice pageName="Pricing Plans" />;
  }

  const pillars = industryData?.pillars || defaultPillars;
  const deliverables = industryData?.package?.features || defaultDeliverables;
  const faqs = industryData?.faqs || defaultFaqs;

  const filteredTiers = activeCategory === "all" 
    ? cpTiers 
    : cpTiers.filter((t) => t.category === activeCategory);

  return (
    <div className="pricing-page-wrapper cp-compressed-page">
      <SiteHeader active="pricing" />

      {/* Main Section: Agency Services & Growth Plans */}
      <section id="plans" className="cp-pricing-hero-section">
        <div className="cp-container">
          {/* Header Banner */}
          <div className="cp-header-block reveal" style={{ marginBottom: "20px" }}>
            <h1 className="cp-main-title">Plans</h1>
          </div>

          {/* Category Filter Tabs */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", margin: "32px 0 20px 0" }}>
            {[
              { id: "all", label: `All Plans (${cpTiers.length})`, icon: "dashboard" },
              { id: "ads", label: `Paid Ads (${cpTiers.filter((t) => t.category === "ads").length})`, icon: "campaign" },
              { id: "performance", label: `Performance Marketing (${cpTiers.filter((t) => t.category === "performance").length})`, icon: "trending_up" },
              { id: "media", label: `Media & Video Production (${cpTiers.filter((t) => t.category === "media").length})`, icon: "videocam" },
              { id: "growth", label: `Web & Brand Growth (${cpTiers.filter((t) => t.category === "growth").length})`, icon: "rocket_launch" }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 18px",
                  borderRadius: "100px",
                  fontSize: "13px",
                  fontWeight: activeCategory === cat.id ? "700" : "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: activeCategory === cat.id ? "1.5px solid #FF8C52" : "1px solid rgba(255, 255, 255, 0.12)",
                  background: activeCategory === cat.id ? "#359FA0" : "rgba(255, 255, 255, 0.04)",
                  color: activeCategory === cat.id ? "#FFFFFF" : "#cbd5e1"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px", color: activeCategory === cat.id ? "#FF8C52" : "#8AD6D1" }}>
                  {cat.icon}
                </span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* PLANS GRID SECTION */}
          <div className="cp-grid-section reveal delay-200">
            <div className="cp-grid-header">
              <div className="cp-grid-title-wrap">
                <span className="material-symbols-outlined cp-grid-icon">tune</span>
                <span className="cp-grid-label">CHOOSE YOUR GROWTH PACKAGE</span>
              </div>
              <span className="cp-grid-hint">Select a growth package to get started</span>
            </div>

            <div className="cp-plans-grid">
              {filteredTiers.map((tier) => {
                const isSelected = tier.id === selectedTierId;
                return (
                  <div
                    key={tier.id}
                    className={`cp-plan-card ${isSelected ? "selected" : ""} ${tier.popular ? "popular" : ""}`}
                    onClick={() => setSelectedTierId(tier.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedTierId(tier.id);
                      }
                    }}
                    aria-label={`Select ${tier.scope} Plan`}
                  >
                    {/* Badge top corner if popular */}
                    {tier.popular && (
                      <div className="cp-card-popular-badge">
                        <span className="material-symbols-outlined">hotel_class</span>
                        TOP RECOMMENDED
                      </div>
                    )}

                    {/* Icon */}
                    <div className="cp-card-icon-wrap">
                      <PlanTierIcon tier={tier} />
                    </div>

                    {/* Scope / Title */}
                    <div className="cp-card-scope-wrap">
                      <span className="cp-scope-prefix">{tier.ticketRange || "Service Package"}</span>
                      <h2 className="cp-card-scope-title">{tier.scope}</h2>
                      {tier.subtitle && <p className="cp-card-subtitle">{tier.subtitle}</p>}
                    </div>

                    {/* Pricing Pill */}
                    <div className="cp-price-pill-wrap">
                      <div className="cp-gold-pill">
                        <span className="cp-pill-currency">₹</span>
                        <span className="cp-pill-amount">{tier.priceDisplay}</span>
                        <span className="cp-pill-period">{tier.period || "/month"}</span>
                      </div>
                    </div>

                    {/* Monthly Effective / Unit Cost */}
                    <div className="cp-card-monthly-box">
                      <span className="material-symbols-outlined">payments</span>
                      <strong>{tier.monthlyEffective}</strong>
                    </div>

                    {/* Action Button inside card */}
                    <div className="cp-card-action">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTierId(tier.id);
                          handleBuyNow(tier);
                        }}
                        className="cp-card-btn active"
                      >
                        <span className="material-symbols-outlined">rocket_launch</span>
                        Choose Plan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQs Accordion */}
          {faqs && faqs.length > 0 && (
            <div className="cp-faqs-section reveal delay-400">
              <div className="cp-faqs-header">
                <span className="cp-faqs-badge">Got Questions?</span>
                <h2 className="cp-faqs-title">Frequently Asked Questions</h2>
                <p className="cp-faqs-sub">
                  Everything you need to know about our agency services, delivery timelines, and pricing plans.
                </p>
              </div>

              <div className="cp-faqs-list">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div className={`cp-faq-item ${isOpen ? "open" : ""}`} key={index}>
                      <button
                        type="button"
                        className="cp-faq-trigger"
                        onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                        aria-expanded={isOpen}
                      >
                        <h3>{faq.question}</h3>
                        <span className="material-symbols-outlined cp-faq-toggle-icon">
                          {isOpen ? "close" : "add"}
                        </span>
                      </button>
                      <div
                        className="cp-faq-content"
                        style={{
                          maxHeight: isOpen ? "500px" : "0",
                          opacity: isOpen ? 1 : 0,
                          padding: isOpen ? "0 24px 20px 24px" : "0 24px 0 24px"
                        }}
                      >
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
