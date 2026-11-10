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

const defaultIndustries = [
  {
    id: "real-estate",
    name: "Real Estate",
    badge: "Digital Marketing Partner for Real Estate Channel Partners",
    bannerImage: "/Price_CP.jpg",
    contactPhone: "9096090701",
    contactWebsite: "www.aidigital.biz",
    contactLocation: "Office No: 315, Boulevard Tower, Bramha Corp, Sadhu Vaswani Chowk, Camp, Pune, Maharashtra 411001",
    package: {
      id: "cp_growth_engine_3mo",
      name: "Real Estate Channel Partner Marketing Plan",
      hook: "REAL ESTATE CHANNEL PARTNER MARKETING PACKAGE",
      headline: "Digital Marketing Partner for Real Estate Channel Partners",
      subtitle: "Your Success Our Business — Scale Property Sales, Site Visits & Closings",
      channelPartner: "AI DIGITAL ASSOCIATE CHANNEL",
      price: 75000,
      priceDisplay: "75,000",
      period: "FOR 3 MONTHS",
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
    },
    faqs: [
      {
        question: "What are the 3 Channel Partner (CP) plan options based on ticket size?",
        answer: "Our Real Estate Channel Partner Plan has 3 tailored options based on property ticket size: (1) Project upto ₹80 Lakh at ₹75,000 for 3 Months (₹25,000/mo), (2) Project ₹80 Lakh to ₹1.5 Cr at ₹90,000 for 3 Months (₹30,000/mo), and (3) Project ₹1.5 Cr to ₹3 Cr at ₹1.5 Lakh for 3 Months (₹50,000/mo). You can choose your option directly on the checkout page or pricing card."
      },
      {
        question: "What is included across all CP marketing package options?",
        answer: "Every tier includes WhatsApp Marketing + Quality Data, Leads Calling & Qualification, Project Landing Page, Meta Ads & Google Search Ads management, Reels & Short-Form Content, AI Promotional Videos, Associated Channels CP network activation, and daily Campaign Optimization."
      },
      {
        question: "Does the fee include advertising budget or is it separate?",
        answer: "The fee covers agency execution, creative production, video generation, landing page development, tele-calling lead qualification, and strategic management for the full 3-month cycle. Ad spend (paid directly to Meta and Google) is separate so you maintain 100% control over your daily ad budget without markups."
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
        answer: "We execute rapidly. Your custom project landing page, ad creatives, WhatsApp funnels, and campaigns will be fully configured and launched within 5 to 7 business days from onboarding and collateral collection."
      },
      {
        question: "Do we get complete ownership of the landing page, videos, and leads?",
        answer: "Yes, 100%. All landing pages, domain configurations, AI promotional videos, ad creative designs, and prospective buyer databases belong exclusively to your firm."
      },
      {
        question: "How do I get started with the Channel Partner Plan?",
        answer: "Click 'Select Plan & Get Started' to proceed to checkout where you can choose your project ticket size option, message us on WhatsApp, or call our team directly at 9096090701. We will schedule a kickoff session within 24 hours."
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
  const [selectedTierId, setSelectedTierId] = useState("cp_80l");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

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
  const pkg = currentIndustry?.package || defaultIndustries[0].package;
  const faqs = currentIndustry?.faqs || defaultIndustries[0].faqs;
  const tiers = pkg.tiers || defaultCpTiers;
  const activeTier = tiers.find((t) => t.id === selectedTierId) || tiers[0];

  const handleBuyNow = (tierToBuy = activeTier) => {
    clearCart();
    const target = tierToBuy || activeTier;
    const planName = `${pkg.name} (${target.ticketScope || target.name})`;
    addToCart({
      id: target.id || pkg.id || "pkg_" + currentIndustry.id,
      name: planName,
      price: target.price || 75000,
      period: target.period || "/3 months",
      features: (pkg.features || []).map((f) => f.title)
    });
    router.push(`/checkout?plan=${encodeURIComponent(planName)}&price=${target.price}`);
  };

  const getWhatsAppInquiryUrl = () => {
    const msg = `Hi! I am interested in your Real Estate Channel Partner Marketing Plan for ${activeTier.ticketScope || activeTier.name} (₹${activeTier.priceDisplay} for 3 Months). Please connect with me.`;
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
          <button
            type="button"
            onClick={() => handleBuyNow()}
            className="builder-faq-inline-cta"
            title="Click to select plan and get started"
          >
            {selectPlanPhrase}
          </button>
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
          Unlock growth with data-driven marketing and high-performance assets tailored for Real Estate Channel Partners.
        </p>
      </section>

      {/* 1 Single Plan Showcase: Flyer Banner on Left + Pricing Card on Right */}
      <section id="package" className="builder-pricing-section">
        <div className="builder-container">
          <div className="builder-grid">
            {/* Left Column: Visual Banner */}
            <div className="builder-banner-wrapper reveal">
              <div className="builder-banner-frame">
                <Image
                  src={currentIndustry.bannerImage || "/Price_CP.jpg"}
                  alt={`${currentIndustry.name} Channel Partner Marketing Package`}
                  width={1086}
                  height={1448}
                  priority
                  className="builder-banner-image"
                />
              </div>

              {/* Direct Contact Strip matching banner */}
              <div className="builder-contact-strip">
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
                    <strong>{currentIndustry.contactLocation || "Camp, Pune, Maharashtra"}</strong>
                  </div>
                </a>
              </div>
            </div>

            {/* Right Column: 1 Unified Channel Partner Pricing & Deliverables Card */}
            <div className="builder-card-wrapper reveal delay-100">
              <div className="builder-package-card">
                <div className="builder-header-tags">
                  <div className="builder-card-badge">
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>verified</span>
                    {currentIndustry.badge || "Digital Marketing Partner for Real Estate Channel Partners"}
                  </div>
                  <div className="builder-asicote-badge">
                    <span className="material-symbols-outlined">handshake</span>
                    <span>AI DIGITAL ASSOCIATE CHANNEL</span>
                  </div>
                </div>

                <span className="builder-hook-eyebrow">{pkg.hook || "REAL ESTATE CHANNEL PARTNER MARKETING PACKAGE"}</span>
                <h2 className="builder-card-title">
                  {pkg.headline || "Digital Marketing Partner for Real Estate Channel Partners"}
                </h2>
                <p className="builder-card-subtitle">
                  {pkg.subtitle || "Your Success Our Business — Scale Property Sales, Site Visits & Closings"}
                </p>

                {/* 3 Choose Options based on Project Ticket Size */}
                <div className="builder-ticket-picker">
                  <div className="builder-ticket-picker-label">
                    <span className="material-symbols-outlined">tune</span>
                    <span>CHOOSE YOUR PROJECT TICKET SIZE:</span>
                  </div>
                  <div className="builder-ticket-options">
                    {tiers.map((t) => {
                      const isSel = selectedTierId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTierId(t.id)}
                          className={`builder-ticket-option-btn ${isSel ? "active" : ""}`}
                        >
                          <span className="material-symbols-outlined">{t.icon || "apartment"}</span>
                          <div className="ticket-btn-info">
                            <strong>{t.ticketScope || t.name}</strong>
                            <span>₹{t.priceDisplay}</span>
                          </div>
                          {t.popular && <span className="ticket-popular-pill">Popular</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dark Luxury Price Banner */}
                <div className="builder-price-banner">
                  <div>
                    <span className="builder-price-lead">
                      {activeTier.ticketScope || activeTier.name}
                    </span>
                    <div className="builder-price-main">
                      <span className="builder-price-currency">₹</span>
                      <span className="builder-price-amount">{activeTier.priceDisplay}</span>
                      <span className="builder-price-gst" style={{ fontSize: "16px", fontWeight: "700", color: "#FDE68A", marginLeft: "6px" }}>+ GST</span>
                      <span className="builder-price-period">{activeTier.period || "FOR 3 MONTHS"}</span>
                    </div>
                  </div>
                  <div className="builder-price-subtext">
                    {activeTier.monthlyEffective || `Effectively ~₹${Math.round(activeTier.price / 3).toLocaleString()}/month`}
                    <br />
                    Full Agency Growth Engine
                  </div>
                </div>

                {/* Associate Channel Growth Outcomes Card */}
                <div className="builder-asicote-card">
                  <div className="builder-asicote-card-header">
                    <span className="material-symbols-outlined asicote-handshake-icon">handshake</span>
                    <div className="asicote-brand-wrap">
                      <span className="asicote-brand">AI DIGITAL</span>
                      <span className="asicote-sub">ASSOCIATE CHANNEL</span>
                    </div>
                  </div>
                  <div className="builder-outcomes-grid">
                    {(pkg.outcomes && pkg.outcomes.length > 0
                      ? pkg.outcomes
                      : [
                          "More Quality Leads",
                          "Stronger Brand Presence",
                          "Better Project Visibility",
                          "End-to-End Support"
                        ]
                    ).map((item, idx) => (
                      <div className="builder-outcome-item" key={idx}>
                        <span className="material-symbols-outlined">check_circle</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services Deliverables Grid */}
                {pkg.features && pkg.features.length > 0 && (
                  <div id="deliverables" className="builder-services-wrapper">
                    <div className="builder-services-heading">
                      <span>What's Included in This Package</span>
                      <span className="builder-services-count">{pkg.features.length} Core Deliverables</span>
                    </div>

                    <div className="builder-services-grid">
                      {pkg.features.map((feat, idx) => (
                        <div className="builder-service-card" key={idx}>
                          <div className="builder-service-icon">
                            <Icon name={feat.icon || "check_circle"} />
                          </div>
                          <div className="builder-service-text">
                            <strong>{feat.title}</strong>
                            <p>{feat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="builder-actions">
                  <button onClick={() => handleBuyNow()} className="builder-btn-buy">
                    <span className="material-symbols-outlined">rocket_launch</span>
                    Select Plan &amp; Proceed to Checkout (₹{activeTier.priceDisplay})
                  </button>

                  <div className="builder-actions-secondary">
                    <a
                      href={getWhatsAppInquiryUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="builder-btn-wa"
                    >
                      <span className="material-symbols-outlined">chat</span>
                      Inquire on WhatsApp
                    </a>
                    <a
                      href={`tel:${(currentIndustry.contactPhone || "+91 9096090701").replace(/\s+/g, "")}`}
                      className="builder-btn-call"
                    >
                      <span className="material-symbols-outlined">call</span>
                      Call: {currentIndustry.contactPhone || "9096090701"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Related to Plans */}
      {faqs && faqs.length > 0 && (
        <section id="faqs" className="builder-faqs-section">
          <div className="builder-faqs-container">
            <div className="builder-faqs-header">
              <span className="builder-faqs-badge">Got Questions?</span>
              <h2 className="builder-faqs-title">
                Frequently Asked Questions About The Channel Partner Package
              </h2>
              <p className="builder-faqs-sub">
                Everything you need to know about our Real Estate Channel Partner marketing strategy and deliverables.
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
                          <button
                            type="button"
                            onClick={() => handleBuyNow()}
                            className="builder-faq-btn-primary"
                          >
                            <span className="material-symbols-outlined">rocket_launch</span>
                            Select Plan &amp; Proceed to Checkout (₹{activeTier.priceDisplay})
                          </button>

                          <a
                            href="#package"
                            onClick={(e) => {
                              e.preventDefault();
                              const el = document.getElementById("package");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="builder-faq-btn-secondary"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                            View Plan Details
                          </a>

                          <a
                            href={getWhatsAppInquiryUrl()}
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
