"use client";

import { useMemo, useState } from "react";

const goals = [
  {
    label: "Increase Organic Traffic",
    result: "Advanced SEO Strategy + Content Marketing + Growth Framework",
    description: "Drive high-intent organic traffic to your website with a custom technical SEO roadmap, SEO-optimized blog content, and growth-focused marketing frameworks."
  },
  {
    label: "Maximize Lead Generation",
    result: "PPC Performance Marketing + Landing Page CRO + Conversion Tracking",
    description: "Acquire highly qualified B2B and local leads using conversion-optimized landing pages, targeted Google Ads & Meta campaigns, and end-to-end ROI analytics."
  },
  {
    label: "Dominate Google Rankings",
    result: "Technical SEO + High-Intent Keyword Research + Authority Link Building",
    description: "Climb to the top of Google search engine results pages (SERPs) by resolving technical SEO audits, executing in-depth keyword analysis, and securing high-authority backlinks."
  },
  {
    label: "Boost Social Engagement",
    result: "Viral Content Strategy + Community Management + Paid Social Ads",
    description: "Build a thriving digital brand community through creative social media content, daily proactive page management, and highly-targeted Instagram and Facebook ad campaigns."
  },
  {
    label: "Scale Property Sales",
    result: "High-Intent Buyer Ads + Project Microsite CRO + Site-Visit Retargeting",
    description: "Accelerate residential and commercial bookings with high-converting project microsites, geo-fenced Meta & Google buyer campaigns, and automated site-visit funnels."
  },
  {
    label: "Elevate Brand Identity",
    result: "Premium UI/UX Design + Brand Positioning + Visual Identity",
    description: "Set your business apart from competitors with premium logo designs, conversion-focused UI/UX aesthetics, and a cohesive, authoritative brand messaging framework."
  }
];

export default function GoalSelector() {
  const [activeGoal, setActiveGoal] = useState(null);
  const selected = useMemo(
    () => goals.find((goal) => goal.label === activeGoal),
    [activeGoal]
  );

  return (
    <section className="goal-panel" aria-labelledby="goal-title">
      <h2 id="goal-title">What's your primary goal?</h2>
      <div className="goal-grid" role="list">
        {goals.map((goal) => {
          const isActive = goal.label === activeGoal;

          return (
            <button
              className={`goal-card ${isActive ? "active" : ""}`}
              type="button"
              aria-pressed={isActive}
              key={goal.label}
              onClick={() => setActiveGoal(isActive ? null : goal.label)}
            >
              {goal.label}
            </button>
          );
        })}
      </div>
      
      {selected && (
        <div className="goal-details-panel">
          <div className="recommendation-kicker">Recommended strategy</div>
          <div className="recommendation" aria-live="polite">
            {selected.result}
          </div>
          <p className="goal-description">{selected.description}</p>
          <a className="goal-pricing-btn" href="/pricing">Check Pricing</a>
        </div>
      )}
    </section>
  );
}
