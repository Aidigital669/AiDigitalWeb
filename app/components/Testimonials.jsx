"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function Testimonials() {
  useEffect(() => {
    // Function to inject luxury forest & gold styling into Elfsight shadowRoot or widget container
    const injectElfsightTheme = () => {
      const container = document.querySelector(".elfsight-app-8a4acbd3-d813-43e7-a303-15ff4fc467e2");
      if (!container) return;

      const applyStylesToRoot = (rootNode) => {
        if (!rootNode || rootNode.querySelector?.("#elfsight-theme-override")) return;
        const style = document.createElement("style");
        style.id = "elfsight-theme-override";
        style.textContent = `
          /* Main Button (Write a Review) */
          [class*="header-write-review-button"],
          [class*="WriteReviewButton"],
          [class*="button-base"][class*="header"],
          button[class*="Button"] {
            background: #1E4D42 !important;
            background-color: #1E4D42 !important;
            color: #FFFFFF !important;
            border: 1.5px solid #B9974F !important;
            border-radius: 999px !important;
            box-shadow: 0 4px 14px rgba(30, 77, 66, 0.25) !important;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
            cursor: pointer !important;
          }
          [class*="header-write-review-button"]:hover,
          [class*="WriteReviewButton"]:hover,
          [class*="button-base"][class*="header"]:hover,
          button[class*="Button"]:hover {
            background: #B9974F !important;
            background-color: #B9974F !important;
            border-color: #9E7F3D !important;
            color: #FFFFFF !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 18px rgba(185, 151, 79, 0.35) !important;
          }
          [class*="header-write-review-button"] *,
          [class*="WriteReviewButton"] * {
            color: #FFFFFF !important;
            fill: #FFFFFF !important;
          }

          /* Active Tabs & Underlines */
          [class*="tabs-item-active-line"],
          [class*="TabIndicator"],
          [class*="Tabs__TabIndicator"],
          [class*="active-line"] {
            background: #B9974F !important;
            background-color: #B9974F !important;
            height: 3px !important;
            border-radius: 2px !important;
          }
          [class*="tab"][class*="active"],
          [class*="Tab--active"],
          [class*="Tabs__TabActive"] {
            color: #1E4D42 !important;
            font-weight: 700 !important;
          }

          /* Stars & Ratings */
          [class*="rating-item"] svg,
          [class*="Rating__Stars"] svg,
          [class*="star"] svg {
            fill: #B9974F !important;
            color: #B9974F !important;
          }

          /* Read More & Verified Accent */
          [class*="read-more"],
          [class*="ReadMore"],
          [class*="verified-badge"],
          [class*="VerifiedBadge"] {
            color: #B9974F !important;
          }

          /* Review card container */
          [class*="review-container"] {
            border-radius: 16px !important;
            border: 1px solid rgba(185, 151, 79, 0.12) !important;
          }
        `;
        rootNode.appendChild(style);
      };

      if (container.shadowRoot) {
        applyStylesToRoot(container.shadowRoot);
      }
      applyStylesToRoot(container);
    };

    // Run periodically to catch dynamic shadowRoot attachment
    const interval = setInterval(injectElfsightTheme, 250);

    const container = document.querySelector(".elfsight-app-8a4acbd3-d813-43e7-a303-15ff4fc467e2");
    let observer = null;
    if (container) {
      observer = new MutationObserver(() => injectElfsightTheme());
      observer.observe(container, { childList: true, subtree: true });
    }

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <section className="section testimonials-section" style={{ paddingBlock: "100px", background: "linear-gradient(180deg, var(--bg-ivory, #F8F5EF) 0%, #FFFFFF 50%, var(--bg-ivory, #F8F5EF) 100%)", position: "relative", overflow: "hidden" }}>
      {/* Decorative Luxury Background Glow Elements */}
      <div style={{ position: "absolute", top: "-50px", left: "-50px", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(185, 151, 79, 0.16) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }}></div>
      <div style={{ position: "absolute", bottom: "-100px", right: "-50px", width: "420px", height: "420px", background: "radial-gradient(circle, rgba(30, 77, 66, 0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }}></div>

      <div className="section-heading" style={{ position: "relative", zIndex: 2, marginBottom: "54px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <span className="eyebrow" style={{ display: "inline-flex", marginBottom: "16px", border: "1px solid rgba(185, 151, 79, 0.35)", borderRadius: "999px", padding: "8px 18px", color: "var(--cta-gold, #B9974F)", background: "#ffffff", fontSize: "11.5px", fontWeight: "800", letterSpacing: "0.12em", textTransform: "uppercase", boxShadow: "0 4px 14px rgba(185, 151, 79, 0.12)" }}>
          Real Results. Real Feedback.
        </span>
        <h2 style={{ fontFamily: "var(--font-headline, 'Sora', sans-serif)", fontSize: "clamp(32px, 4vw, 44px)", lineHeight: "1.15", color: "var(--brand-forest, #1E4D42)", margin: "0 0 16px 0", maxWidth: "600px", fontWeight: "800" }}>
          See What Our Clients <br/><span style={{ color: "var(--cta-gold, #B9974F)" }}>Are Saying</span>
        </h2>
        <p style={{ color: "var(--text-charcoal-muted, #556B64)", fontSize: "15.5px", maxWidth: "520px", margin: "0", lineHeight: "1.6" }}>
          Don't just take our word for it. Here are genuine reviews from businesses we've helped grow.
        </p>
      </div>

      <div style={{ position: "relative", zIndex: 2, maxWidth: "1100px", margin: "0 auto", padding: "0 20px" }}>
        {/* Widget Container with Luxury Frame */}
        <div className="testimonials-widget-card" style={{ background: "#ffffff", borderRadius: "24px", padding: "24px", boxShadow: "0 24px 50px rgba(30, 77, 66, 0.08), 0 0 0 1px rgba(185, 151, 79, 0.18)", border: "1.5px solid var(--line-soft, #EDE7DA)" }}>
          {/* Elfsight All-in-One Reviews Widget */}
          <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
          <div className="elfsight-app-8a4acbd3-d813-43e7-a303-15ff4fc467e2" data-elfsight-app-lazy></div>
        </div>
      </div>
    </section>
  );
}
