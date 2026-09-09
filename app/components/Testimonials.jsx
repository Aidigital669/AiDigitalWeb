"use client";

import Script from "next/script";

export default function Testimonials() {
  return (
    <section className="section testimonials-section" style={{ paddingBlock: "100px", background: "linear-gradient(180deg, #f6fbff 0%, #ffffff 100%)", position: "relative", overflow: "hidden" }}>
      {/* Decorative Background Elements */}
      <div style={{ position: "absolute", top: "-50px", left: "-50px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(38, 132, 185, 0.08) 0%, transparent 70%)", borderRadius: "50%" }}></div>
      <div style={{ position: "absolute", bottom: "-100px", right: "-50px", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(229, 96, 48, 0.05) 0%, transparent 70%)", borderRadius: "50%" }}></div>

      <div className="section-heading" style={{ position: "relative", zIndex: 2, marginBottom: "54px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <span className="eyebrow" style={{ display: "inline-flex", marginBottom: "16px", border: "1px solid rgba(38, 132, 185, 0.2)", borderRadius: "999px", padding: "8px 16px", color: "#2684b9", background: "#ffffff", fontSize: "11px", fontWeight: "800", letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: "0 4px 14px rgba(38, 132, 185, 0.08)" }}>
          Real Results. Real Feedback.
        </span>
        <h2 style={{ fontFamily: "var(--font-headline, 'Sora', sans-serif)", fontSize: "clamp(32px, 4vw, 44px)", lineHeight: "1.1", color: "#0f172a", margin: "0 0 16px 0", maxWidth: "600px" }}>
          See What Our Clients <br/><span style={{ color: "#e56030" }}>Are Saying</span>
        </h2>
        <p style={{ color: "#64748b", fontSize: "15px", maxWidth: "500px", margin: "0" }}>
          Don't just take our word for it. Here are genuine reviews from businesses we've helped grow.
        </p>
      </div>

      <div style={{ position: "relative", zIndex: 2, maxWidth: "1100px", margin: "0 auto", padding: "0 20px" }}>
        {/* Widget Container with Premium Frame */}
        <div style={{ background: "#ffffff", borderRadius: "24px", padding: "20px", boxShadow: "0 20px 40px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)", border: "1px solid rgba(226, 232, 240, 0.8)" }}>
          {/* Elfsight All-in-One Reviews Widget */}
          <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
          <div className="elfsight-app-8a4acbd3-d813-43e7-a303-15ff4fc467e2" data-elfsight-app-lazy></div>
        </div>
      </div>
    </section>
  );
}
