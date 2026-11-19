export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
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

    // 1. Backup pricing_plans
    const [pricingRows] = await pool.query("SELECT * FROM pricing_plans");
    const pricingData = {
      googlePlans: [],
      facebookPlans: [],
      combinePlans: [],
      websitePlans: [],
      creativePacks: [],
      aiVideoPlans: [],
    };
    pricingRows.forEach((plan) => {
      const parsedPlan = {
        id: plan.id,
        platform: plan.platform,
        badgeClass: plan.badge_class,
        level: plan.level,
        pillClass: plan.pill_class,
        price: plan.price.includes(",") ? plan.price : Number(plan.price),
        period: plan.period,
        features: JSON.parse(plan.features),
        buttonText: plan.button_text,
        isPopular: Boolean(plan.is_popular),
        serviceName: plan.service_name,
        planParameter: plan.plan_parameter,
        tagClass: plan.tag_class,
        isHighlight: Boolean(plan.is_highlight),
        highlightStyles: plan.highlight_styles ? JSON.parse(plan.highlight_styles) : undefined,
      };
      if (pricingData[plan.category]) {
        pricingData[plan.category].push(parsedPlan);
      }
    });

    const pricingBackupPath = path.join(process.cwd(), "data", "pricingData.json");
    fs.writeFileSync(pricingBackupPath, JSON.stringify(pricingData, null, 2), "utf-8");

    // 2. Backup portfolio_items
    const [portfolioRows] = await pool.query("SELECT * FROM portfolio_items");
    const portfolioData = {
      showcaseProjects: [],
      industries: [],
      otherProjects: [],
      creativeGroups: [],
    };

    const industriesMap = {};
    const creativeGroupsMap = {};

    portfolioRows.forEach((item) => {
      if (item.section === "showcase") {
        portfolioData.showcaseProjects.push({
          id: item.id,
          title: item.title,
          category: item.category,
          industry: item.industry,
          metric: item.metric,
          metricLabel: item.metric_label,
          description: item.description,
          tags: JSON.parse(item.tags || "[]"),
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

    return NextResponse.json({
      success: true,
      message: "Database tables exported to JSON backups successfully.",
      backupData: {
        pricing: pricingData,
        portfolio: portfolioData
      }
    });
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json({ error: "Backup failed: " + error.message }, { status: 500 });
  }
}
