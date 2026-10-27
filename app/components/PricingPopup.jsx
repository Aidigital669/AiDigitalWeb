"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "../hooks/useCart";
import { useRouter } from "next/navigation";

const defaultIndustries = [
  {
    id: "real-estate",
    name: "Real Estate",
    badge: "Digital Marketing Partner For Builders",
    contactPhone: "9096090701",
    package: {
      id: "builder_complete_2lac_3mo",
      name: "Complete Digital Marketing Package",
      price: 200000,
      priceDisplay: "2 LAC",
      period: "FOR 3 MONTHS",
      subtitle: "Let Us Help You Generate More Leads & Sales",
      channelPartner: "ASICOTE® CHANNEL PARTNER",
      features: [
        "WhatsApp Marketing",
        "Cold Calling Support",
        "Static Project Website",
        "Meta (FB & IG) Ads",
        "Google Search Ads",
        "Reels & Short Videos",
        "AI Promotional Videos",
        "Lead Verification",
        "Lead Qualification",
        "Campaign Optimization"
      ],
      outcomes: [
        "More Quality Leads",
        "Stronger Brand Presence",
        "Better Project Visibility",
        "End-to-End Support"
      ]
    }
  }
];

export default function PricingPopup({ dialogRef }) {
  const [industryList, setIndustryList] = useState(defaultIndustries);
  const [selectedIndustry, setSelectedIndustry] = useState("real-estate");
  const { addToCart, clearCart } = useCart();
  const router = useRouter();

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
      .catch((err) => console.warn("Using default static popup plans:", err));
  }, [selectedIndustry]);

  const handleClose = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

  const currentIndustry =
    industryList.find((i) => i.id === selectedIndustry) || industryList[0] || defaultIndustries[0];
  const pkg = currentIndustry?.package || defaultIndustries[0].package;

  const handleBuyNow = () => {
    clearCart();
    const planName = `${pkg.name} (${currentIndustry.name} - ₹${pkg.priceDisplay || pkg.price})`;
    const featureTitles = (pkg.features || []).map((f) => (typeof f === "string" ? f : f.title));
    addToCart({
      id: pkg.id || `plan_${currentIndustry.id}`,
      name: planName,
      price: Number(pkg.price) || 200000,
      period: "/3 months",
      features: featureTitles
    });
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    router.push("/checkout");
  };

  const getWhatsAppInquiryUrl = () => {
    const msg = `Hi AiDigital team! I am interested in the ${currentIndustry.name} package (${pkg.name} - ₹${pkg.priceDisplay || pkg.price}). Please connect with me.`;
    return `https://wa.me/919096090701?text=${encodeURIComponent(msg)}`;
  };

  const formatDeliverableTitle = (item) => {
    if (!item) return "";
    const clean = typeof item === "string" ? item : item.title || "";
    if (clean.includes("Static Project Website")) return "Static Project Website";
    if (clean.includes("Meta Advertising") || clean.includes("Meta Ads")) return "Meta (FB & IG) Ads";
    if (clean.includes("Google Advertising") || clean.includes("Google Ads")) return "Google Search Ads";
    if (clean.includes("Reels")) return "Reels & Short Videos";
    if (clean.includes("Campaign Monitoring") || clean.includes("Campaign Optimization")) return "Campaign Optimization";
    if (clean.includes("Lead Qualification")) return "Lead Qualification";
    if (clean.includes("Lead Verification")) return "Lead Verification";
    if (clean.includes("Cold Calling")) return "Cold Calling Support";
    if (clean.includes("WhatsApp")) return "WhatsApp Marketing";
    if (clean.includes("AI Promotion") || clean.includes("AI Promo")) return "AI Promo Videos";
    return clean;
  };

  const rawFeatures = pkg.features || defaultIndustries[0].package.features;
  const deliverableTitles = rawFeatures.map(formatDeliverableTitle);

  return (
    <dialog
      ref={dialogRef}
      className="popup-card-dialog popup-compact-dialog"
      onClick={(e) => {
        if (e.target === dialogRef.current) handleClose();
      }}
    >
      <div className="popup-card-internal popup-compact-mode" onClick={(e) => e.stopPropagation()}>
        {/* Scoped CSS with Increased Size, Legibility, and Zero Scrollbars */}
        <style dangerouslySetInnerHTML={{ __html: `
          .popup-compact-dialog {
            max-width: 1040px !important;
            width: 95% !important;
            overflow: visible !important;
            border: none !important;
            background: transparent !important;
          }
          .popup-compact-mode {
            padding: 28px 32px !important;
            max-height: none !important;
            overflow: visible !important;
            border-radius: 26px !important;
            background: #FFFFFF !important;
            box-shadow: 0 25px 60px -10px rgba(15, 23, 42, 0.3) !important;
            position: relative !important;
          }
          .popup-custom-close-btn {
            position: absolute !important;
            right: 22px !important;
            top: 22px !important;
            width: 36px !important;
            height: 36px !important;
            background: #F1F5F9 !important;
            border: 1px solid #E2E8F0 !important;
            border-radius: 50% !important;
            color: #64748B !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.2s ease !important;
            padding: 0 !important;
            outline: none !important;
          }
          .popup-custom-close-btn:hover {
            background: #E2E8F0 !important;
            color: #0F172A !important;
            transform: rotate(90deg) scale(1.05) !important;
          }
          .popup-custom-close-btn svg {
            width: 20px !important;
            height: 20px !important;
          }
          .popup-compact-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 18px;
            padding-right: 48px;
          }
          .popup-compact-brand {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .popup-compact-title {
            font-size: 22.5px !important;
            font-weight: 800 !important;
            color: #0F172A !important;
            margin: 0 !important;
            line-height: 1.25 !important;
            letter-spacing: -0.01em !important;
          }
          .popup-compact-title span {
            color: #3B82F6 !important;
          }
          .popup-compact-sub {
            font-size: 14px !important;
            color: #64748B !important;
            margin: 4px 0 0 0 !important;
            line-height: 1.3 !important;
          }
          .popup-compact-industry-select select {
            font-size: 13.5px;
            font-weight: 700;
            padding: 6px 14px;
            border-radius: 8px;
            border: 1px solid #CBD5E1;
            background: #F8FAFC;
            color: #1E293B;
            outline: none;
            cursor: pointer;
          }
          .popup-compact-body {
            display: grid;
            grid-template-columns: 1fr 1.08fr;
            gap: 20px;
            background: #FFFFFF;
            border: 1.5px solid #E2E8F0;
            border-radius: 20px;
            padding: 20px 22px;
            box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
          }
          .popup-compact-left {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 10px;
          }
          .popup-badge-row {
            display: flex;
            align-items: center;
          }
          .popup-mini-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #FFF7ED;
            color: #EA580C;
            border: 1px solid #FFEDD5;
            padding: 4px 12px;
            border-radius: 99px;
            font-size: 11.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
          .popup-mini-badge .material-symbols-outlined {
            font-size: 15px;
          }
          .popup-compact-price-wrap {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 14px;
            padding: 12px 16px;
          }
          .popup-compact-price-main {
            display: flex;
            align-items: baseline;
            gap: 5px;
          }
          .popup-c-currency {
            font-size: 22px;
            font-weight: 800;
            color: #0F172A;
          }
          .popup-c-amount {
            font-size: 38px;
            font-weight: 900;
            color: #0F172A;
            letter-spacing: -0.02em;
            line-height: 1;
          }
          .popup-c-period {
            font-size: 14px;
            font-weight: 800;
            color: #E56030;
            text-transform: uppercase;
            margin-left: 5px;
          }
          .popup-c-effective {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 600;
            color: #059669;
            margin-top: 5px;
          }
          .popup-c-effective .material-symbols-outlined {
            font-size: 16px;
          }
          .popup-compact-highlights {
            display: flex;
            flex-direction: column;
            gap: 7px;
            margin: 4px 0;
          }
          .popup-h-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13.5px;
            font-weight: 600;
            color: #334155;
            line-height: 1.35;
          }
          .popup-h-item .material-symbols-outlined {
            font-size: 17px;
            color: #10B981;
            flex-shrink: 0;
          }
          .popup-compact-ctas {
            display: flex;
            flex-direction: column;
            gap: 9px;
            margin-top: 4px;
          }
          .popup-c-btn-buy {
            background: linear-gradient(135deg, #1877F2 0%, #2563EB 100%);
            color: #FFFFFF;
            border: none;
            border-radius: 12px;
            padding: 12px 20px;
            font-size: 14.5px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.2s ease;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
            width: 100%;
          }
          .popup-c-btn-buy:hover {
            background: linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(37, 99, 235, 0.35);
          }
          .popup-c-btn-buy .material-symbols-outlined {
            font-size: 18px;
          }
          .popup-c-contact-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .popup-c-btn-wa {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            background: #F0FDF4;
            color: #15803D;
            border: 1px solid #BBF7D0;
            padding: 9px 14px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
            transition: background 0.15s ease;
          }
          .popup-c-btn-wa:hover {
            background: #DCFCE7;
          }
          .popup-c-btn-wa .material-symbols-outlined {
            font-size: 16px;
          }
          .popup-c-btn-call {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            background: #F8FAFC;
            color: #334155;
            border: 1px solid #CBD5E1;
            padding: 9px 14px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
            transition: background 0.15s ease;
          }
          .popup-c-btn-call:hover {
            background: #F1F5F9;
          }
          .popup-c-btn-call .material-symbols-outlined {
            font-size: 16px;
          }
          .popup-compact-right {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 16px;
            padding: 16px 18px;
          }
          .popup-c-deliv-header {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 800;
            color: #0F172A;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 10px;
          }
          .popup-c-deliv-header .material-symbols-outlined {
            font-size: 18px;
            color: #E56030;
          }
          .popup-c-deliv-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 14px;
          }
          .popup-c-deliv-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 600;
            color: #1E293B;
            white-space: nowrap;
            line-height: 1.4;
          }
          .popup-c-deliv-item .material-symbols-outlined {
            font-size: 16px;
            color: #10B981;
            flex-shrink: 0;
          }
          .popup-c-deliv-item .deliv-name {
            white-space: nowrap;
          }
          .popup-c-trust-strip {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 12px;
            padding-top: 10px;
            border-top: 1px solid #E2E8F0;
            font-size: 12px;
            font-weight: 700;
            color: #64748B;
          }
          .popup-c-view-all {
            text-align: center;
            margin-top: 8px;
          }
          .popup-c-view-all a {
            font-size: 13px;
            font-weight: 700;
            color: #2563EB;
            text-decoration: none;
          }
          .popup-c-view-all a:hover {
            text-decoration: underline;
          }
          @media (max-width: 768px) {
            .popup-compact-body {
              grid-template-columns: 1fr;
              gap: 12px;
              padding: 12px;
            }
            .popup-c-deliv-grid {
              grid-template-columns: 1fr;
            }
          }
        ` }} />

        {/* Clean circular close button */}
        <button onClick={handleClose} className="popup-custom-close-btn" aria-label="Close popup">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Row */}
        <div className="popup-compact-header">
          <div className="popup-compact-brand">
            <Image
              src="/Logo.ai.png"
              alt="AI Digital"
              width={48}
              height={48}
              className="popup-header-logo"
              priority
            />
            <div>
              <h2 className="popup-compact-title">
                Elevate Your {currentIndustry.name} Presence with <span>aidigitals</span>
              </h2>
              <p className="popup-compact-sub">
                Join 300+ customer businesses & builders accelerating site visits & closings
              </p>
            </div>
          </div>

          {industryList.length > 1 && (
            <div className="popup-compact-industry-select">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                aria-label="Filter Industry"
              >
                {industryList.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 2-Column Showcase */}
        <div className="popup-compact-body">
          {/* Left Column: Pricing, Value Bullets, CTAs */}
          <div className="popup-compact-left">
            <div className="popup-badge-row">
              <span className="popup-mini-badge">
                <span className="material-symbols-outlined">verified</span>
                {currentIndustry.badge || "Digital Marketing Partner For Builders"}
              </span>
              {(pkg.channelPartner || currentIndustry.id === "real-estate") && (
                <span className="popup-mini-badge" style={{ background: "#FFFFFF", borderColor: "#D4AF37", color: "#0F172A" }}>
                  <span className="material-symbols-outlined" style={{ color: "#D4AF37" }}>handshake</span>
                  {pkg.channelPartner || "ASICOTE® CHANNEL PARTNER"}
                </span>
              )}
            </div>

            <div className="popup-compact-price-wrap">
              <div className="popup-compact-price-main">
                <span className="popup-c-currency">₹</span>
                <span className="popup-c-amount">{pkg.priceDisplay || "2 LAC"}</span>
                <span className="popup-c-period">/ 3 MONTHS</span>
              </div>
              <div className="popup-c-effective">
                <span className="material-symbols-outlined">payments</span>
                <span>Effectively ~₹66,666 / mo • Full Agency Engine</span>
              </div>
            </div>

            {/* High-Impact Outcomes from Banner */}
            <div className="popup-compact-highlights">
              {(pkg.outcomes && pkg.outcomes.length > 0
                ? pkg.outcomes
                : [
                    "More Quality Leads",
                    "Stronger Brand Presence",
                    "Better Project Visibility",
                    "End-to-End Support"
                  ]
              ).map((out, oIdx) => (
                <div className="popup-h-item" key={oIdx}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>{out}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="popup-compact-ctas">
              <button onClick={handleBuyNow} className="popup-c-btn-buy">
                <span>Select Plan & Buy Now (₹2 Lac)</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>

              <div className="popup-c-contact-row">
                <a
                  href={getWhatsAppInquiryUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="popup-c-btn-wa"
                >
                  <span className="material-symbols-outlined">chat</span>
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`tel:${(currentIndustry.contactPhone || "+91 9096090701").replace(/\s+/g, "")}`}
                  className="popup-c-btn-call"
                >
                  <span className="material-symbols-outlined">call</span>
                  <span>{currentIndustry.contactPhone || "+91 9096090701"}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: 10 Deliverables in 2 Sub-Columns */}
          <div className="popup-compact-right">
            <div className="popup-c-deliv-header">
              <span className="material-symbols-outlined">checklist</span>
              <span>10 Deliverables Included:</span>
            </div>

            <div className="popup-c-deliv-grid">
              {deliverableTitles.slice(0, 10).map((item, idx) => (
                <div key={idx} className="popup-c-deliv-item" title={item}>
                  <span className="material-symbols-outlined">check</span>
                  <span className="deliv-name">{item}</span>
                </div>
              ))}
            </div>

            <div className="popup-c-trust-strip">
              <span>⚡ 5-7 Day Launch</span>
              <span>•</span>
              <span>🔒 100% Asset Ownership</span>
              <span>•</span>
              <span>🎯 Zero Junk Leads</span>
            </div>

            <div className="popup-c-view-all">
              <a href="/pricing/details" onClick={handleClose}>
                View Complete Plan Deliverables & FAQs →
              </a>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}