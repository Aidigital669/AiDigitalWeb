import { NextResponse } from "next/server";
import pool, { ensureAllTables } from "../../../../lib/db";
import { writeFallback } from "../../../../lib/dbFallback";
import fs from "fs";
import path from "path";

function checkAuth(req) {
  const session = req.cookies.get("admin_session");
  return session && session.value === "authenticated";
}

export async function POST(req) {
  try {
    if (!checkAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureAllTables();

    // 1. Backup pricing_plans
    let pricingData = {
      googlePlans: [],
      facebookPlans: [],
      combinePlans: [],
      websitePlans: [],
      creativePacks: [],
      aiVideoPlans: [],
    };
    try {
      const [pricingRows] = await pool.query("SELECT * FROM pricing_plans");
      pricingRows.forEach((plan) => {
        let featuresParsed = [];
        try { featuresParsed = JSON.parse(plan.features); } catch (e) {}
        let highlightParsed = undefined;
        try { highlightParsed = plan.highlight_styles ? JSON.parse(plan.highlight_styles) : undefined; } catch (e) {}

        const parsedPlan = {
          id: plan.id,
          platform: plan.platform,
          badgeClass: plan.badge_class,
          level: plan.level,
          pillClass: plan.pill_class,
          price: plan.price.includes(",") ? plan.price : Number(plan.price),
          period: plan.period,
          features: featuresParsed,
          buttonText: plan.button_text,
          isPopular: Boolean(plan.is_popular),
          serviceName: plan.service_name,
          planParameter: plan.plan_parameter,
          tagClass: plan.tag_class,
          isHighlight: Boolean(plan.is_highlight),
          highlightStyles: highlightParsed,
        };
        if (pricingData[plan.category]) {
          pricingData[plan.category].push(parsedPlan);
        }
      });
      const pricingBackupPath = path.join(process.cwd(), "data", "pricingData.json");
      fs.writeFileSync(pricingBackupPath, JSON.stringify(pricingData, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not backup pricing_plans from DB:", e.message);
    }

    // 2. Backup portfolio_items
    let portfolioData = {
      showcaseProjects: [],
      industries: [],
      otherProjects: [],
      creativeGroups: [],
    };
    try {
      const [portfolioRows] = await pool.query("SELECT * FROM portfolio_items");
      const industriesMap = {};
      const creativeGroupsMap = {};

      portfolioRows.forEach((item) => {
        if (item.section === "showcase") {
          let tagsParsed = [];
          try { tagsParsed = JSON.parse(item.tags || "[]"); } catch (e) {}
          portfolioData.showcaseProjects.push({
            id: item.id,
            title: item.title,
            category: item.category,
            industry: item.industry,
            metric: item.metric,
            metricLabel: item.metric_label,
            description: item.description,
            tags: tagsParsed,
            accent: item.accent,
            icon: item.icon,
          });
        } else if (item.section === "featured") {
          const indName = item.industry || "General";
          if (!industriesMap[indName]) {
            industriesMap[indName] = {
              name: indName,
              description: item.description || "",
              projects: [],
            };
          }
          industriesMap[indName].projects.push({
            title: item.title,
            type: item.category || "Website & SEO",
          });
        } else if (item.section === "other") {
          portfolioData.otherProjects.push({
            title: item.title,
            type: item.category || "Campaigns",
          });
        } else if (item.section === "creative") {
          const indName = item.industry || "Other Projects";
          if (!creativeGroupsMap[indName]) {
            creativeGroupsMap[indName] = {
              industry: indName,
              description: item.description || "Creative assets",
              images: [],
            };
          }
          creativeGroupsMap[indName].images.push({
            src: item.src,
            title: item.title,
            description: item.description,
            globalIndex: item.global_index || undefined,
            type: item.type || "image",
          });
        }
      });

      portfolioData.industries = Object.values(industriesMap);
      portfolioData.creativeGroups = Object.values(creativeGroupsMap);

      const portfolioBackupPath = path.join(process.cwd(), "data", "portfolioData.json");
      fs.writeFileSync(portfolioBackupPath, JSON.stringify(portfolioData, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not backup portfolio_items from DB:", e.message);
    }

    // 3. Backup onboarding_details, job_applications, payment_reminders, promo_codes
    let onboardingData = [];
    try {
      const [onb] = await pool.query("SELECT * FROM onboarding_details");
      onboardingData = onb;
      writeFallback("onboarding", onboardingData);
    } catch (e) {}

    let applicationsData = [];
    try {
      const [apps] = await pool.query("SELECT * FROM job_applications");
      applicationsData = apps;
      writeFallback("applications", applicationsData);
    } catch (e) {}

    let remindersData = [];
    try {
      const [rems] = await pool.query("SELECT * FROM payment_reminders");
      remindersData = rems;
      writeFallback("reminders", remindersData);
    } catch (e) {}

    let promoData = [];
    try {
      const [prms] = await pool.query("SELECT * FROM promo_codes");
      promoData = prms;
      writeFallback("promos", promoData);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: "Database tables exported to JSON backups successfully.",
      backupData: {
        pricing: pricingData,
        portfolio: portfolioData,
        onboarding: onboardingData,
        applications: applicationsData,
        reminders: remindersData,
        promos: promoData,
      }
    });
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json({ error: "Backup failed: " + error.message }, { status: 500 });
  }
}
