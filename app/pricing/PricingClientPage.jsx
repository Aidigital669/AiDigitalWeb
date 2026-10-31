"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Icon, SiteFooter, SiteHeader } from "../components/SiteChrome";
import { useCart } from "../hooks/useCart";
import { useRouter } from "next/navigation";
import useScrollReveal from "../hooks/useScrollReveal";
import { useVisibility } from "../context/VisibilityContext";
import PageHiddenNotice from "../components/PageHiddenNotice";

const defaultIndustries = [
  {
    id: "real-estate",
    name: "Real Estate",
    badge: "Digital Marketing Partner for Real Estate",
    bannerImage: "/Price.jpeg",
    contactPhone: "9096090701",
    contactWebsite: "www.aidigital.biz",
    contactLocation: "Pune, Maharashtra",
    package: {
      id: "builder_complete_2lac_3mo",
      name: "Complete Digital Marketing Package",
      hook: "COMPLETE DIGITAL MARKETING PACKAGE",
      headline: "Digital Marketing Partner for Real Estate",
      subtitle: "Scale Property Sales, Site Visits & Closings",
      channelPartner: "Associate Channel",
      price: 200000,
      priceDisplay: "2 LAC",
      period: "FOR 3 MONTHS",
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
    },
    faqs: [
      {
        question: "What is included in the ₹2 Lac Complete Real Estate Marketing Package?",
        answer: "This package provides a comprehensive 3-month growth engine for builders, developers, and real estate channel partners. It includes WhatsApp Marketing + Quality Data, Leads Calling, Project Website & Landing Page, Meta & Youtube & Google Ads, Reels & Short-Form Content, AI Promotional Videos, Associated Channels support, and Campaign Monitoring & Optimization."
      },
      {
        question: "Does the ₹2 Lac fee include advertising budget or is it separate?",
        answer: "The ₹2 Lac fee covers our full agency management, creative production, video development, landing page building, lead qualification team, and strategy for all 3 months. Ad spend (paid directly to Meta and Google) is separate and determined based on your target unit sales, inventory ticket size, and project locality. We help you set an optimal ad budget with zero wastage."
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
        answer: "We execute rapidly. Your custom project landing page, ad creatives, and campaign setup will be fully configured and launched within 5 to 7 business days from onboarding and receiving your project collateral."
      },
      {
        question: "What types of real estate projects is this package best suited for?",
        answer: "This package is specifically engineered for residential apartment launches, luxury villa developments, commercial retail/office spaces, and plotted townships seeking predictable, high-volume buyer inquiries and booked site visits."
      },
      {
        question: "Do we get complete ownership of the landing page, videos, and leads?",
        answer: "Yes, 100%. All landing pages, domain configurations, AI promotional videos, ad creative designs, and prospective buyer databases belong exclusively to your firm."
      },
      {
        question: "How do we monitor performance and communicate with your team?",
        answer: "You receive a dedicated Growth Account Manager. You get live lead alerts on WhatsApp/Email, weekly analytical reports tracking Cost Per Lead (CPL) and site visits, and scheduled bi-weekly review calls."
      },
      {
        question: "How do I get started with the ₹2 Lac Builder Package?",
        answer: "You can click 'Select Plan & Get Started' to initiate onboarding online, message us on WhatsApp, or call our team directly at 9096090701. We will schedule a kickoff session within 24 hours."
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

  const handleBuyNow = () => {
    clearCart();
    addToCart({
      id: pkg.id || "pkg_" + currentIndustry.id,
      name: pkg.name || `${currentIndustry.name} Digital Marketing Package`,
      price: pkg.price || 200000,
      period: pkg.period || "/3 months",
      features: (pkg.features || []).map((f) => f.title)
    });
    router.push("/checkout");
  };

  const getWhatsAppInquiryUrl = () => {
    const msg = `Hi! I am interested in your ${currentIndustry.name} marketing package (${pkg.name} - ₹${pkg.priceDisplay || pkg.price}). Please connect with me.`;
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
            onClick={handleBuyNow}
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
          Unlock growth with data-driven marketing and high-performance assets tailored for your business needs.
        </p>
      </section>

      {/* Package Showcase: Banner + Pricing Card for Selected Industry */}
      <section id="package" className="builder-pricing-section">
        <div className="builder-container">
          <div className="builder-grid">
            {/* Left Column: Visual Banner */}
            <div className="builder-banner-wrapper reveal">
              <div className="builder-banner-frame">
                <Image
                  src={currentIndustry.bannerImage || "/Price.jpeg"}
                  alt={`${currentIndustry.name} Marketing Package Banner`}
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
                <div className="builder-strip-item">
                  <span className="material-symbols-outlined">location_on</span>
                  <div>
                    <span className="strip-label">OUR LOCATION</span>
                    <strong>{currentIndustry.contactLocation || "Pune, Maharashtra"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Pricing & Deliverables Card */}
            <div className="builder-card-wrapper reveal delay-100">
              <div className="builder-package-card">
                <div className="builder-header-tags">
                  <div className="builder-card-badge">
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>verified</span>
                    {currentIndustry.badge || "Digital Marketing Partner for Real Estate"}
                  </div>
                  {(pkg.channelPartner || currentIndustry.id === "real-estate") && (
                    <div className="builder-asicote-badge">
                      <span className="material-symbols-outlined">handshake</span>
                      <span>AI DIGITAL ASSOCIATE CHANNEL</span>
                    </div>
                  )}
                </div>

                <span className="builder-hook-eyebrow">{pkg.hook || "COMPLETE DIGITAL MARKETING PACKAGE"}</span>
                <h2 className="builder-card-title">
                  {pkg.headline || "Digital Marketing Partner for Real Estate"}
                </h2>
                <p className="builder-card-subtitle">
                  {pkg.subtitle || "Scale Property Sales, Site Visits & Closings"}
                </p>

                {/* Dark Luxury Price Banner */}
                <div className="builder-price-banner">
                  <div>
                    <span className="builder-price-lead">COMPLETE DIGITAL MARKETING PACKAGE</span>
                    <div className="builder-price-main">
                      <span className="builder-price-currency">₹</span>
                      <span className="builder-price-amount">{pkg.priceDisplay || pkg.price}</span>
                      <span className="builder-price-gst" style={{ fontSize: "16px", fontWeight: "700", color: "#FDE68A", marginLeft: "6px" }}>+ GST</span>
                      {pkg.period && <span className="builder-price-period">{pkg.period}</span>}
                    </div>
                  </div>
                  <div className="builder-price-subtext">
                    {pkg.price && typeof pkg.price === "number" && pkg.period?.includes("3")
                      ? `Effectively ~₹${Math.round(pkg.price / 3).toLocaleString()}/month`
                      : "High-ROI Execution"}
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
                  <button onClick={handleBuyNow} className="builder-btn-buy">
                    <span className="material-symbols-outlined">rocket_launch</span>
                    Select Plan & Get Started (₹{pkg.priceDisplay || pkg.price})
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

      {/* FAQs Related to Plans (Just Down Area) */}
      {faqs && faqs.length > 0 && (
        <section id="faqs" className="builder-faqs-section">
          <div className="builder-faqs-container">
            <div className="builder-faqs-header">
              <span className="builder-faqs-badge">Got Questions?</span>
              <h2 className="builder-faqs-title">
                Frequently Asked Questions About The {currentIndustry.name} Package
              </h2>
              <p className="builder-faqs-sub">
                Everything you need to know about our {currentIndustry.name} marketing strategy and deliverables.
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
                            onClick={handleBuyNow}
                            className="builder-faq-btn-primary"
                          >
                            <span className="material-symbols-outlined">rocket_launch</span>
                            Select Plan &amp; Get Started (₹{pkg.priceDisplay || pkg.price})
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
