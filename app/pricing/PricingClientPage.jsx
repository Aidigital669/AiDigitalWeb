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
    category: "google_ads",
    price: 7500,
    priceDisplay: "7,500",
    period: "Per Month",
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
    category: "meta_ads",
    price: 3000,
    priceDisplay: "3,000",
    period: "Per Month",
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
    period: "Per Month",
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
    period: "Per Month",
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
    period: "Per Month",
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
    category: "content",
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
    category: "content",
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
    category: "content",
    price: 500,
    priceDisplay: "500",
    period: "For 10 Posts",
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
    category: "website",
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
    category: "brand",
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

function MetaLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Meta">
      <defs>
        <linearGradient id="metaGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0064E0" />
          <stop offset="50%" stopColor="#0082FB" />
          <stop offset="100%" stopColor="#00A9FF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#metaGradIcon)"
        d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
      />
    </svg>
  );
}

function FacebookLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-label="Facebook">
      <circle cx="24" cy="24" r="23" fill="#1877F2" />
      <path
        fill="#FFFFFF"
        d="M26.7 38V24.5h4.5l.7-5.2h-5.2v-3.3c0-1.5.4-2.5 2.6-2.5h2.8V8.9c-.5-.1-2.1-.2-4-.2-4 0-6.7 2.4-6.7 6.9v3.7h-4.5v5.2h4.5V38h5.3z"
      />
    </svg>
  );
}

function GoogleLogo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-label="Google">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.91l7.35-5.73z"/>
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
    </svg>
  );
}

function PlanTierIcon({ tier }) {
  const tierId = tier?.id || "";
  const tierName = (tier?.name || tier?.scope || "").toLowerCase();
  const isDual = tierId === "plan_perf_both" || (tierName.includes("google") && (tierName.includes("meta") || tierName.includes("facebook")));

  // 1. Dual Google & Facebook: 2 small boxes with + in the middle
  if (isDual) {
    return (
      <div className="cp-dual-boxes-container" style={{ display: "flex", alignItems: "center", gap: "6px" }} title="Google & Facebook Ads">
        <div 
          className="cp-small-icon-box"
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "11px",
            background: "rgba(46, 229, 192, 0.15)",
            border: "1px solid rgba(46, 229, 192, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
          }}
        >
          <GoogleLogo size={20} />
        </div>
        <span style={{ color: "#68F0AE", fontWeight: "800", fontSize: "14px", lineHeight: 1 }}>+</span>
        <div 
          className="cp-small-icon-box"
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "11px",
            background: "rgba(46, 229, 192, 0.15)",
            border: "1px solid rgba(46, 229, 192, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
          }}
        >
          <FacebookLogo size={20} />
        </div>
      </div>
    );
  }

  // 2. Google Ads alone
  if (tierId === "plan_google_ads" || tierId === "plan_perf_google" || (tierName.includes("google") && !tierName.includes("meta") && !tierName.includes("facebook"))) {
    return <GoogleLogo size={26} />;
  }

  // 3. Meta Ads / Facebook Ads -> ONLY Facebook logo
  if (tierId === "plan_meta_ads" || tierId === "plan_perf_meta" || tierName.includes("meta") || tierName.includes("facebook")) {
    return <FacebookLogo size={26} />;
  }

  return (
    <span className="material-symbols-outlined cp-building-icon">
      {tier?.icon || "star"}
    </span>
  );
}

const formatPeriodPrefix = (period) => {
  if (!period) return "Per Month";
  const p = period.trim();
  const lower = p.toLowerCase();
  if (lower === "per month" || lower === "/month") return "Per Month";
  if (lower === "starting from" || lower === "starts from") return "Starting from";
  if (lower === "for 10 posts") return "For 10 Posts";
  return p.charAt(0).toUpperCase() + p.slice(1);
};

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

  const getTierCategory = (t) => {
    if (t.category === "meta_ads" || t.id === "plan_meta_ads") return "meta_ads";
    if (t.category === "google_ads" || t.id === "plan_google_ads") return "google_ads";
    if (t.category === "performance" || t.id.startsWith("plan_perf")) return "performance";
    if (t.category === "brand" || t.id === "plan_brand_dev") return "brand";
    if (t.category === "content" || t.category === "media" || ["plan_reel_shoot", "plan_ai_videos", "plan_social_graphics"].includes(t.id)) return "content";
    if (t.category === "website" || t.id === "plan_website_dev") return "website";
    return t.category;
  };

  const filteredTiers = activeCategory === "all" 
    ? cpTiers 
    : cpTiers.filter((t) => getTierCategory(t) === activeCategory);

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

          {/* Category Filter Tabs - 7 Dedicated Categories in a Single Row */}
          <div className="cp-category-tabs-row">
            {[
              { id: "all", label: `All Plans (${cpTiers.length})`, icon: "dashboard" },
              { id: "meta_ads", label: `Meta Ads (${cpTiers.filter((t) => getTierCategory(t) === "meta_ads").length})`, icon: "share" },
              { id: "google_ads", label: `Google Ads (${cpTiers.filter((t) => getTierCategory(t) === "google_ads").length})`, icon: "ads_click" },
              { id: "performance", label: `Performance (${cpTiers.filter((t) => getTierCategory(t) === "performance").length})`, icon: "trending_up" },
              { id: "brand", label: `Brand Growth (${cpTiers.filter((t) => getTierCategory(t) === "brand").length})`, icon: "workspace_premium" },
              { id: "content", label: `Content Marketing (${cpTiers.filter((t) => getTierCategory(t) === "content").length})`, icon: "videocam" },
              { id: "website", label: `Website Dev (${cpTiers.filter((t) => getTierCategory(t) === "website").length})`, icon: "desktop_windows" }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className="cp-category-tab-btn"
                style={{
                  border: activeCategory === cat.id ? "1.5px solid #2EE5C0" : "1px solid rgba(255, 255, 255, 0.12)",
                  background: activeCategory === cat.id ? "rgba(46, 229, 192, 0.16)" : "rgba(255, 255, 255, 0.04)",
                  color: activeCategory === cat.id ? "#FFFFFF" : "#cbd5e1"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "15px", color: activeCategory === cat.id ? "#2EE5C0" : "#68F0AE" }}>
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

                    {/* Icon */}
                    <div className={`cp-card-icon-wrap ${
                      tier?.id === "plan_perf_both" || 
                      ((tier?.name || tier?.scope || "").toLowerCase().includes("google") && 
                       ((tier?.name || tier?.scope || "").toLowerCase().includes("meta") || (tier?.name || tier?.scope || "").toLowerCase().includes("facebook")))
                        ? "is-dual" 
                        : ""
                    }`}>
                      <PlanTierIcon tier={tier} />
                    </div>

                    {/* Scope / Title */}
                    <div className="cp-card-scope-wrap">
                      <h2 className="cp-card-scope-title">{tier.scope}</h2>
                      {tier.subtitle && <p className="cp-card-subtitle">{tier.subtitle}</p>}
                    </div>

                    {/* Pricing Pill */}
                    <div className="cp-price-pill-wrap">
                      <div className="cp-gold-pill">
                        <span className="cp-pill-period">{formatPeriodPrefix(tier.period)}</span>
                        <span className="cp-pill-currency">₹</span>
                        <span className="cp-pill-amount">{tier.priceDisplay}</span>
                      </div>
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
