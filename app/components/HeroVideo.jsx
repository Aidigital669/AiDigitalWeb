"use client";

import React, { useRef, useEffect } from "react";
import PricingPopup from "./PricingPopup";

export default function HeroVideo() {
  const dialogRef = useRef(null);

  // Triggers the pricing popup natively with a 10-second delay when the page renders
  useEffect(() => {
    const timer = setTimeout(() => {
      if (dialogRef.current) {
        dialogRef.current.showModal();
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="modern-hero-section" aria-label="BizzMaker Header">
      {/* Background Pricing Lead Modal (opens on 10s delay) */}
      <PricingPopup dialogRef={dialogRef} />

      {/* Top Ambient Glow */}
      <div className="modern-hero-ambient-glow" aria-hidden="true" />

      <div className="modern-hero-container">
        {/* 1. Modern Eyebrow Pill */}
        <div className="modern-hero-badge reveal">
          <span className="modern-hero-pulse-dot" aria-hidden="true" />
          <span>BIZZMAKER • DIGITAL MARKETING AGENCY</span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span className="badge-tag-highlight">2026 ROI PLAYBOOK</span>
          <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#B9974F" }}>
            arrow_forward
          </span>
        </div>

        {/* 2. Main High-Converting Headline (H1) */}
        <h1 className="modern-hero-title reveal delay-100">
          Scale Your Business with <br />
          <span className="modern-hero-gradient-text">High-ROI Digital Marketing</span>
        </h1>

        {/* 3. Persuasive Subheading */}
        <p className="modern-hero-subtitle reveal delay-150">
          BizzMaker builds high-intent Google Search &amp; P-Max campaigns, laser-targeted Meta Ads,
          conversion-optimized websites, and viral reel production engineered to lower CAC and maximize your ROAS.
        </p>

        {/* 4. Action Dual CTAs */}
        <div className="modern-hero-cta-group reveal delay-200">
          <a href="/pricing" className="modern-hero-btn-primary">
            <span className="material-symbols-outlined">rocket_launch</span>
            Explore Growth Plans &rarr;
          </a>
          <a
            href="https://wa.me/919096090701?text=Hi%20BizzMaker!%20I%20would%20like%20to%20learn%20more%20about%20your%20digital%20marketing%20packages%20and%20scaling%20strategy."
            target="_blank"
            rel="noopener noreferrer"
            className="modern-hero-btn-secondary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
