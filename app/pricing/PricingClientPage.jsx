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
    id: "cp_80l",
    name: "Project Upto ₹80 Lakh",
    ticketScope: "Project upto ₹80 Lakh",
    price: 75000,
    priceDisplay: "75,000",
    period: "for 3 Months",
    monthlyEffective: "₹25,000 Effective per Month",
    icon: "apartment",
    popular: false
  },
  {
    id: "cp_1_5cr",
    name: "Project ₹80 Lakh to ₹1.5 Cr",
    ticketScope: "Project ₹80 Lakh to ₹1.5 Cr",
    price: 90000,
    priceDisplay: "90,000",
    period: "for 3 Months",
    monthlyEffective: "₹30,000 Effective per Month",
    icon: "domain",
    popular: true
  },
  {
    id: "cp_3cr",
    name: "Project ₹1.5 Cr to ₹3 Cr",
    ticketScope: "Project ₹1.5 Cr to ₹3 Cr",
    price: 150000,
    priceDisplay: "1.5 Lakh",
    period: "for 3 Months",
    monthlyEffective: "₹50,000 Effective per Month",
    icon: "corporate_fare",
    popular: false
  }
];

const defaultBuilderPackage = {
  id: "builder_complete_2lac_3mo",
  category: "builder",
  tabLabel: "🏢 Builder Package (₹2 LAC)",
  name: "Complete Digital Marketing Package for Builders",
  hook: "COMPLETE DIGITAL MARKETING PACKAGE",
  headline: "Digital Marketing Partner for Real Estate Builders",
  subtitle: "Scale Property Sales, Site Visits & Closings",
  badge: "Digital Marketing Partner for Real Estate",
  channelPartner: "AI DIGITAL ASSOCIATE CHANNEL",
  bannerImage: "/Price.jpeg",
  price: 200000,
  priceDisplay: "2 LAC",
  period: "FOR 3 MONTHS",
  monthlyEffective: "₹66,667 Effective per Month",
  features: [
    { title: "WhatsApp Marketing + Quality Data", desc: "Automated broadcast, instant brochure sharing & verified buyer data", icon: "chat" },
    { title: "Leads Calling", desc: "Proactive buyer outreach, tele-calling & phone qualification for inquiries", icon: "call" },
    { title: "Project Website & Landing Page", desc: "High-CRO launch microsite with floor plans & automated lead capture funnels", icon: "desktop_windows" },
    { title: "Meta & Youtube & Google Ads", desc: "High-intent buyer campaigns across Meta (FB & IG), Google Search & YouTube Ads", icon: "bar_chart" },
    { title: "Reels & Short-Form Content", desc: "Engaging property reels showcasing amenities, site progress & walkthroughs", icon: "smart_display" },
    { title: "AI Promotional Videos", desc: "AI-assisted cinematic property walkthroughs, teasers & social promo videos", icon: "memory" },
    { title: "Associated Channels", desc: "Channel partner network collaboration & broker channel activation support", icon: "handshake" },
    { title: "Campaign Monitoring & Optimization", desc: "Daily ad tracking, continuous ROAS scaling & weekly verified CPL reporting", icon: "troubleshoot" }
  ],
  outcomes: [
    "More Quality Leads",
    "Stronger Brand Presence",
    "Better Project Visibility",
    "End-to-End Support"
  ]
};

const defaultCpPackage = {
  id: "cp_growth_engine_3mo",
  category: "cp",
  tabLabel: "🤝 Channel Partner (CP) Package",
  name: "Real Estate Channel Partner Marketing Plan",
  hook: "REAL ESTATE CHANNEL PARTNER MARKETING PACKAGE",
  headline: "Digital Marketing Partner for Real Estate Channel Partners",
  subtitle: "Your Success Our Business — Scale Property Sales, Site Visits & Closings",
  badge: "Digital Marketing Partner for Real Estate Channel Partners",
  channelPartner: "AI DIGITAL ASSOCIATE CHANNEL",
  bannerImage: "/Price_CP.jpg",
  price: 75000,
  priceDisplay: "75,000",
  period: "FOR 3 MONTHS",
  monthlyEffective: "Starting ₹25,000 Effective per Month",
  tiers: defaultCpTiers,
  features: [
    { title: "WhatsApp Marketing + Quality Data", desc: "Automated broadcast, instant brochure sharing & verified buyer data", icon: "chat" },
    { title: "Leads Calling & Verification", desc: "Proactive buyer outreach, tele-calling & phone qualification for inquiries", icon: "call" },
    { title: "Project Website & Landing Page", desc: "High-CRO launch microsite with floor plans & automated lead capture funnels", icon: "desktop_windows" },
    { title: "Meta & Youtube & Google Ads", desc: "High-intent buyer campaigns across Meta (FB & IG), Google Search & YouTube Ads", icon: "bar_chart" },
    { title: "Reels & Short-Form Content", desc: "Engaging property reels showcasing amenities, site progress & walkthroughs", icon: "smart_display" },
    { title: "AI Promotional Videos", desc: "AI-assisted cinematic property walkthroughs, teasers & social promo videos", icon: "memory" },
    { title: "Associated Channels", desc: "Channel partner network collaboration & broker channel activation support", icon: "handshake" },
    { title: "Campaign Monitoring & Optimization", desc: "Daily ad tracking, continuous ROAS scaling & weekly verified CPL reporting", icon: "troubleshoot" }
  ],
  outcomes: [
    "More Quality Leads",
    "Stronger Brand Presence",
    "Better Project Visibility",
    "End-to-End Support"
  ]
};

const defaultIndustries = [
  {
    id: "real-estate",
    name: "Real Estate",
    badge: "Digital Marketing Partner for Real Estate",
    bannerImage: "/Price.jpeg",
    contactPhone: "9096090701",
    contactWebsite: "www.aidigital.biz",
    contactLocation: "Office No: 315, Boulevard Tower, Bramha Corp, Sadhu Vaswani Chowk, Camp, Pune, Maharashtra 411001",
    packages: [defaultBuilderPackage, defaultCpPackage],
    package: defaultBuilderPackage,
    faqs: [
      {
        question: "What is the difference between the Builder Package and Channel Partner (CP) Package?",
        answer: "The Builder Package (₹2 LAC for 3 Months) is engineered for builders and real estate developers looking for a comprehensive 3-month flagship launch engine. The Channel Partner (CP) Package is tailored specifically for real estate channel partners with 3 flexible options based on property ticket size (₹75k for projects upto ₹80L, ₹90k for ₹80L-₹1.5Cr, and ₹1.5L for ₹1.5Cr-₹3Cr)."
      },
      {
        question: "What is included in the ₹2 Lac Complete Builder Marketing Package?",
        answer: "This package provides a comprehensive 3-month growth engine for builders, developers, and large real estate launches. It includes WhatsApp Marketing + Quality Data, Leads Calling, Project Website & Landing Page, Meta & Youtube & Google Ads, Reels & Short-Form Content, AI Promotional Videos, Associated Channels support, and Campaign Monitoring & Optimization."
      },
      {
        question: "Does the fee include advertising budget or is it separate?",
        answer: "The fee covers full agency execution, creative production, video generation, landing page development, tele-calling lead qualification, and strategic management for the full 3-month cycle. Ad spend (paid directly to Meta and Google) is separate so you maintain 100% control over your daily ad budget without markups."
      },
      {
        question: "How does the Associated Channels collaboration work?",
        answer: "Through Associated Channels, we provide verified real estate marketing expertise, structured channel partner alignment, broker channel activation, and proven lead qualification funnels designed to deliver more quality leads, stronger brand presence, better project visibility, and end-to-end sales support."
      },
      {
        question: "How does the Lead Verification and Qualification support work?",
        answer: "We ensure your sales team never wastes time on junk or fake inquiries. Our dedicated qualification team calls and WhatsApp-verifies every incoming inquiry to confirm the buyer's budget, preferred unit configuration (e.g., 2 BHK, 3 BHK, Penthouse), location interest, and buying timeframe before handing them over or booking a site visit."
      },
      {
        question: "How quickly will our project website and campaigns go live?",
        answer: "We execute rapidly. Your custom project landing page, ad creatives, WhatsApp funnels, and campaigns will be fully configured and live within 5 to 7 business days from onboarding and collateral collection."
      },
      {
        question: "Do we get complete ownership of the landing page, videos, and leads?",
        answer: "Yes, 100%. All landing pages, domain configurations, AI promotional videos, ad creative designs, and prospective buyer databases belong exclusively to your firm."
      },
      {
        question: "How do I get started?",
        answer: "Select your desired package (Builder Package or Channel Partner Plan), click 'Select Plan & Get Started' to initiate onboarding online, message us on WhatsApp, or call our team directly at 9096090701. We will schedule a kickoff session within 24 hours."
      }
    ]
  }
];

export default function PricingClientPage() {
  const { isVisible, isPageVisible } = useVisibility();
  const { addToCart, clearCart } = useCart();
  const router = useRouter();

  const [industryList, setIndustryList] = useState(defaultIndustries);
  const [selectedIndustry, setSelectedIndustry] = useState("real-estate");
  const [selectedCpTierId, setSelectedCpTierId] = useState("cp_80l");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);

  useScrollReveal([]);

  // Fetch dynamic industries and packages configured by admin
  useEffect(() => {
    fetch("/api/industry-plans?t=" + Date.now(), { cache: "no-store" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Offline");
      })
      .then((data) => {
        if (data && Array.isArray(data.industries) && data.industries.length > 0) {
          setIndustryList(data.industries);
          if (!data.industries.some((i) => i.id === selectedIndustry)) {
            setSelectedIndustry(data.industries[0].id);
          }
        }
      })
      .catch((err) => console.warn("Using default industry plans:", err));
  }, []);

  const currentIndustry =
    industryList.find((i) => i.id === selectedIndustry) || industryList[0] || defaultIndustries[0];

  // Get available packages: both Builder and CP
  const availablePackages =
    currentIndustry?.packages && Array.isArray(currentIndustry.packages) && currentIndustry.packages.length > 0
      ? currentIndustry.packages
      : [defaultBuilderPackage, defaultCpPackage];

  // Distinguish both packages so they appear side-by-side in one row
  const builderPkg =
    availablePackages.find((p) => p.category === "builder" || p.id?.includes("builder")) ||
    defaultBuilderPackage;

  const cpPkg =
    availablePackages.find((p) => p.category === "cp" || p.id?.includes("cp")) ||
    defaultCpPackage;

  // CP Tiers for the Channel Partner package
  const cpTiers = cpPkg.tiers || defaultCpTiers;
  const activeCpTier = cpTiers.find((t) => t.id === selectedCpTierId) || cpTiers[0];

  const faqs = currentIndustry?.faqs || defaultIndustries[0].faqs;

  // Universal purchase handler for any package
  const handleBuyPackage = (pkgItem) => {
    clearCart();
    const hasTiers = pkgItem.tiers && Array.isArray(pkgItem.tiers) && pkgItem.tiers.length > 0;
    const activeTier = hasTiers
      ? pkgItem.tiers.find((t) => t.id === selectedCpTierId) || pkgItem.tiers[0]
      : null;

    const planId = activeTier ? activeTier.id : (pkgItem.id || "pkg_" + Date.now());
    const planName = activeTier
      ? `${pkgItem.name} (${activeTier.ticketScope || activeTier.name})`
      : pkgItem.name;
    const planPrice = activeTier ? activeTier.price : (pkgItem.price || 200000);

    addToCart({
      id: planId,
      name: planName,
      price: planPrice,
      period: activeTier?.period || pkgItem.period || "/3 months",
      features: (pkgItem.features || []).map((f) => f.title)
    });

    const queryParams = new URLSearchParams({
      package: pkgItem.id || planId,
      price: planPrice.toString()
    });
    if (activeTier) {
      queryParams.set("tier", activeTier.id);
    }
    router.push(`/checkout?${queryParams.toString()}`);
  };

  // WhatsApp inquiry URL for any package
  const getPackageWhatsAppUrl = (pkgItem) => {
    const hasTiers = pkgItem.tiers && Array.isArray(pkgItem.tiers) && pkgItem.tiers.length > 0;
    const activeTier = hasTiers
      ? pkgItem.tiers.find((t) => t.id === selectedCpTierId) || pkgItem.tiers[0]
      : null;
    const scopePart = activeTier ? ` for ${activeTier.ticketScope || activeTier.name}` : "";
    const priceDisplay = activeTier ? activeTier.priceDisplay : (pkgItem.priceDisplay || "2 LAC");
    const msg = `Hi! I am interested in your ${pkgItem.name}${scopePart} (₹${priceDisplay} for 3 Months). Please connect with me.`;
    return `https://wa.me/919096090701?text=${encodeURIComponent(msg)}`;
  };

  const isGetStartedFaq = (question = "") => {
    const q = question.toLowerCase();
    return q.includes("get started") || q.includes("how do i get started") || q.includes("select plan");
  };

  const renderFaqAnswer = (answer = "") => {
    if (!answer) return null;
    const selectPlanPhrase = "'Select Plan & Get Started'";
    if (answer.includes(selectPlanPhrase)) {
      const parts = answer.split(selectPlanPhrase);
      return (
        <>
          {parts[0]}
          <a
            href="#packages"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById("packages");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="builder-faq-inline-cta"
            title="Click to view plans and get started"
          >
            {selectPlanPhrase}
          </a>
          {parts[1]}
        </>
      );
    }
    return answer;
  };

  if (!isPageVisible("pricing")) {
    return <PageHiddenNotice pageName="Pricing Plans" />;
  }

  return (
    <div className="pricing-page-wrapper">
      <SiteHeader active="pricing" />

      {/* Top Hero Section */}
      <section className="pricing-hero">
        <div className="badge-pill reveal">Your Success, Our Business</div>
        <h1 className="pricing-main-title reveal delay-100">
          AiDigital <span>Plans</span>
        </h1>
        <p className="pricing-hero-sub reveal delay-200">
          High-performance real estate marketing engines engineered for Builders, Developers &amp; Channel Partners.
        </p>
      </section>

      {/* PACKS IN ONE ROW SECTION (Dynamically renders all packages from admin) */}
      <section id="packages" className="builder-pricing-section">
        <div className="builder-container">
          <div className={`builder-plans-row ${availablePackages.length === 2 ? "two-packs" : availablePackages.length === 3 ? "three-packs" : ""}`}>
            {availablePackages.map((pkgItem, pIdx) => {
              const hasTiers = pkgItem.tiers && Array.isArray(pkgItem.tiers) && pkgItem.tiers.length > 0;
              const activeTier = hasTiers
                ? pkgItem.tiers.find((t) => t.id === selectedCpTierId) || pkgItem.tiers[0]
                : null;

              const displayPriceVal = activeTier ? activeTier.priceDisplay : (pkgItem.priceDisplay || pkgItem.price);
              const displayPeriod = activeTier ? (activeTier.period || "for 3 Months") : (pkgItem.period || "FOR 3 MONTHS");
              const displayMonthly = activeTier ? activeTier.monthlyEffective : (pkgItem.monthlyEffective || "Full Agency Growth Engine");
              const bannerImg = pkgItem.bannerImage || (pIdx === 0 ? "/Price.jpeg" : "/Price_CP.jpg");

              return (
                <div id={pkgItem.id || `pack-${pIdx}`} key={pkgItem.id || pIdx} className="builder-plan-column-card reveal">
                  <div>
                    {/* Minimized Image Banner */}
                    <div
                      className="builder-min-banner-wrap"
                      onClick={() => setLightboxImage(bannerImg)}
                      title="Click to view full flyer"
                    >
                      <Image
                        src={bannerImg}
                        alt={pkgItem.name}
                        width={1086}
                        height={1448}
                        className="builder-min-banner-img"
                        priority={pIdx < 2}
                      />
                      <div className="builder-min-banner-overlay" />
                      <span className="builder-min-banner-tag">
                        <span className="material-symbols-outlined">
                          {pkgItem.category === "cp" ? "handshake" : "apartment"}
                        </span>
                        {pkgItem.badge || pkgItem.tabLabel?.replace(/[🏢🤝]/g, "").trim() || "SPECIAL PACKAGE"}
                      </span>
                      <span className="builder-min-banner-zoom">
                        <span className="material-symbols-outlined">zoom_in</span>
                        View Flyer
                      </span>
                    </div>

                    {/* Minimized Badges */}
                    <div className="builder-min-badges">
                      <span className="builder-min-badge">
                        <span className="material-symbols-outlined">verified</span>
                        {pkgItem.badge || "Verified Package"}
                      </span>
                      <span className="builder-min-asicote">
                        <span className="material-symbols-outlined">handshake</span>
                        AI DIGITAL ASSOCIATE CHANNEL
                      </span>
                    </div>

                    {/* Minimized Titles */}
                    <span className="builder-min-hook">{pkgItem.hook || "PERFORMANCE MARKETING PACKAGE"}</span>
                    <h2 className="builder-min-title">{pkgItem.headline || pkgItem.name}</h2>
                    <p className="builder-min-subtitle">{pkgItem.subtitle || "Scale Property Sales, Site Visits & Closings"}</p>

                    {/* If package has Tiers (e.g. CP Package 3 Options) */}
                    {hasTiers && (
                      <div className="builder-min-ticket-wrap">
                        <div className="builder-min-ticket-label">
                          <span className="material-symbols-outlined">tune</span>
                          CHOOSE PROJECT TICKET SIZE:
                        </div>
                        <div className="builder-min-ticket-grid">
                          {pkgItem.tiers.map((t) => {
                            const isSel = activeTier?.id === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setSelectedCpTierId(t.id)}
                                className={`builder-min-ticket-btn ${isSel ? "active" : ""}`}
                              >
                                {t.popular && <span className="builder-min-ticket-pop">POPULAR</span>}
                                <span className="builder-min-ticket-scope">{t.ticketScope || t.name}</span>
                                <span className="builder-min-ticket-price">₹{t.priceDisplay}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Minimized Dark Luxury Price Strip */}
                    <div className="builder-min-price-box">
                      <div className="builder-min-price-main">
                        <span className="builder-min-price-curr">₹</span>
                        <span className="builder-min-price-val">{displayPriceVal}</span>
                        <span className="builder-min-price-gst">+ GST</span>
                        <span className="builder-min-price-dur">{displayPeriod.toUpperCase()}</span>
                      </div>
                      <div className="builder-min-price-sub">
                        {displayMonthly}
                        <br />
                        <span>Full Agency Growth Engine</span>
                      </div>
                    </div>

                    {/* Minimized Deliverables Grid */}
                    {pkgItem.features && pkgItem.features.length > 0 && (
                      <div className="builder-min-deliverables">
                        <div className="builder-min-deliv-header">
                          <span>What's Included</span>
                          <span className="builder-min-deliv-count">{pkgItem.features.length} Deliverables</span>
                        </div>
                        <div className="builder-min-deliv-grid">
                          {pkgItem.features.map((feat, idx) => (
                            <div className="builder-min-deliv-item" key={idx}>
                              <span className="material-symbols-outlined">{feat.icon || "check_circle"}</span>
                              <div>
                                <strong>{feat.title}</strong>
                                <p>{feat.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="builder-min-actions">
                    <button onClick={() => handleBuyPackage(pkgItem)} className="builder-min-btn-buy">
                      <span className="material-symbols-outlined">rocket_launch</span>
                      Select Plan &amp; Buy Now (₹{displayPriceVal})
                    </button>
                    <div className="builder-min-btn-row">
                      <a
                        href={getPackageWhatsAppUrl(pkgItem)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="builder-min-btn-wa"
                      >
                        <span className="material-symbols-outlined">chat</span>
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${(currentIndustry.contactPhone || "+91 9096090701").replace(/\s+/g, "")}`}
                        className="builder-min-btn-call"
                      >
                        <span className="material-symbols-outlined">call</span>
                        Call: {currentIndustry.contactPhone || "9096090701"}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Consolidated Contact Strip below both cards */}
          <div className="builder-shared-contact-strip reveal delay-200">
            <a
              href={`tel:${(currentIndustry.contactPhone || "9096090701").replace(/\s+/g, "")}`}
              className="builder-strip-item"
            >
              <span className="material-symbols-outlined">call</span>
              <div>
                <span className="strip-label">CALL US NOW</span>
                <strong>{currentIndustry.contactPhone || "9096090701"}</strong>
              </div>
            </a>
            <a
              href={`https://${(currentIndustry.contactWebsite || "www.aidigital.biz").replace(/^https?:\/\//, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="builder-strip-item"
            >
              <span className="material-symbols-outlined">language</span>
              <div>
                <span className="strip-label">VISIT OUR WEBSITE</span>
                <strong>{currentIndustry.contactWebsite || "www.aidigital.biz"}</strong>
              </div>
            </a>
            <a
              href="https://maps.app.goo.gl/ouQRtxBcSQCpJdZW9"
              target="_blank"
              rel="noopener noreferrer"
              className="builder-strip-item"
            >
              <span className="material-symbols-outlined">location_on</span>
              <div>
                <span className="strip-label">OUR LOCATION</span>
                <strong>{currentIndustry.contactLocation || "Boulevard Tower, Bramha Corp, Camp, Pune"}</strong>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Full Flyer View */}
      {lightboxImage && (
        <div className="builder-flyer-lightbox" onClick={() => setLightboxImage(null)}>
          <div className="builder-flyer-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="builder-flyer-lightbox-close"
              onClick={() => setLightboxImage(null)}
              title="Close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <Image
              src={lightboxImage}
              alt="Plan Flyer Full Size"
              width={1086}
              height={1448}
              style={{ maxHeight: "85vh", width: "auto", display: "block", objectFit: "contain" }}
            />
          </div>
        </div>
      )}

      {/* FAQs Related to Plans */}
      {faqs && faqs.length > 0 && (
        <section id="faqs" className="builder-faqs-section">
          <div className="builder-faqs-container">
            <div className="builder-faqs-header">
              <span className="builder-faqs-badge">Got Questions?</span>
              <h2 className="builder-faqs-title">
                Frequently Asked Questions
              </h2>
              <p className="builder-faqs-sub">
                Everything you need to know about our Builder and Channel Partner marketing packages.
              </p>
            </div>

            <div className="builder-faqs-list">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div className={`builder-faq-item ${isOpen ? "open" : ""}`} key={index}>
                    <button
                      className="builder-faq-trigger"
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                    >
                      <h3>{faq.question}</h3>
                      <span className="builder-faq-toggle-icon material-symbols-outlined">
                        {isOpen ? "close" : "add"}
                      </span>
                    </button>
                    <div
                      className="builder-faq-content"
                      style={{
                        maxHeight: isOpen ? "600px" : "0",
                        opacity: isOpen ? 1 : 0,
                        padding: isOpen ? "0 24px 22px 24px" : "0 24px 0 24px"
                      }}
                    >
                      <p>{renderFaqAnswer(faq.answer)}</p>

                      {isGetStartedFaq(faq.question) && (
                        <div className="builder-faq-actions">
                          {availablePackages.slice(0, 2).map((p, idx) => (
                            <button
                              key={p.id || idx}
                              type="button"
                              onClick={() => handleBuyPackage(p)}
                              className="builder-faq-btn-primary"
                              style={idx === 1 ? { background: "#059669" } : {}}
                            >
                              <span className="material-symbols-outlined">
                                {p.category === "cp" ? "handshake" : "apartment"}
                              </span>
                              Select {p.name?.includes("Builder") ? "Builder Package" : p.name?.includes("Channel") ? "CP Plan" : p.name} (₹{p.priceDisplay || p.price})
                            </button>
                          ))}

                          <a
                            href="#packages"
                            onClick={(e) => {
                              e.preventDefault();
                              const el = document.getElementById("packages");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="builder-faq-btn-secondary"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                            Compare All Plans
                          </a>

                          <a
                            href={getPackageWhatsAppUrl(availablePackages[0])}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="builder-faq-btn-wa"
                          >
                            <span className="material-symbols-outlined">chat</span>
                            WhatsApp Us
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
