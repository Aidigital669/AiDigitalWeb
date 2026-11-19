export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import fs from "fs";
import path from "path";

const BASE_SYSTEM_PROMPT = `
You are "BizzMaker Bot", the helpful AI assistant for BizzMaker, a premium digital marketing and tech agency.
Your goal is to answer visitor questions, give information about our services and pricing, and guide them to make a purchase or submit an inquiry.

Core Tone and Style:
- Professional, welcoming, concise, and helpful.
- Suggest solutions based on the services we offer.
- Keep responses short (under 2-3 sentences where possible) to maintain engagement in a chat widget interface.

About BizzMaker:
- We specialize in AI-powered digital growth, high-performance web development, SEO, and paid ad campaigns.
- We have a shopping cart integrated into the website. Clicking "Buy Now" on any plan adds it to their cart and redirects them to the checkout page (/checkout) where they can complete details and purchase directly via WhatsApp.

Services & Packages:
[SERVICES_AND_PACKAGES_PLACEHOLDER]

Action Directives:
- If a client wants to buy a plan: Tell them to click the "Buy Now" button on that plan inside our "Pricing" page to add it to their cart and proceed to payment.
- If a client has custom needs or wants to contact us: Guide them to fill out the contact form at the bottom of the Home page, or send an inquiry.
- Keep answers accurate to this pricing context. Do not invent plans or prices outside of these.
`;

import { googlePlans, facebookPlans, combinePlans, websitePlans, creativePacks, aiVideoPlans } from "../../pricing/pricingData";

function getJsonFallback() {
  try {
    const filePath = path.join(process.cwd(), "data", "pricingData.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        adsPlans: [
          ...(parsed.googlePlans || []),
          ...(parsed.facebookPlans || []),
          ...(parsed.combinePlans || [])
        ],
        websitePlans: parsed.websitePlans || [],
        creativePacks: parsed.creativePacks || [],
        aiVideoPlans: parsed.aiVideoPlans || []
      };
    }
  } catch (err) {
    console.warn("Could not read backup pricing JSON file, using static code import. Error:", err.message);
  }
  return {
    adsPlans: [...googlePlans, ...facebookPlans, ...combinePlans],
    websitePlans,
    creativePacks,
    aiVideoPlans
  };
}

async function getActivePricingContext() {
  let plansData = { adsPlans: [], websitePlans: [], creativePacks: [], aiVideoPlans: [] };

  try {
    const [rows] = await pool.query("SELECT * FROM pricing_plans");
    if (rows && rows.length > 0) {
      rows.forEach((plan) => {
        const parsedPlan = {
          platform: plan.platform,
          level: plan.level,
          price: plan.price,
          period: plan.period,
          features: JSON.parse(plan.features),
        };
        
        if (plan.category === "googlePlans" || plan.category === "facebookPlans" || plan.category === "combinePlans") {
          plansData.adsPlans.push(parsedPlan);
        } else if (plansData[plan.category]) {
          plansData[plan.category].push(parsedPlan);
        }
      });
    } else {
      plansData = getJsonFallback();
    }
  } catch (err) {
    console.warn("Chat API DB query failed, using fallback JSON pricing backup. Error:", err.message);
    plansData = getJsonFallback();
  }

  // Format the pricing context string for Gemini
  let context = "\nActive Services & Pricing Packages (Live from database):\n";
  
  if (plansData.adsPlans && plansData.adsPlans.length > 0) {
    context += "1. Lead Campaign Plans (Paid Ads):\n";
    plansData.adsPlans.forEach(p => {
      const plat = p.platform ? `${p.platform} ` : "";
      context += `   - ${plat}${p.level}: ₹${p.price}${p.period || ""} (Inclusions: ${p.features.join(", ")})\n`;
    });
  }
  
  if (plansData.websitePlans && plansData.websitePlans.length > 0) {
    context += "2. Websites (Design & Development):\n";
    plansData.websitePlans.forEach(p => {
      const feats = p.features.map(f => typeof f === "string" ? f : f.text).join(", ");
      context += `   - ${p.level} Website: ₹${p.price}${p.period || ""} (Inclusions: ${feats})\n`;
    });
  }

  if (plansData.creativePacks && plansData.creativePacks.length > 0) {
    context += "3. Creative Design Packs (Social Media Graphics):\n";
    plansData.creativePacks.forEach(p => {
      const feats = p.features.map(f => typeof f === "string" ? f : f.text).join(", ");
      context += `   - ${p.level}: ₹${p.price}${p.period || ""} (Inclusions: ${feats})\n`;
    });
  }

  if (plansData.aiVideoPlans && plansData.aiVideoPlans.length > 0) {
    context += "4. AI Video Production:\n";
    plansData.aiVideoPlans.forEach(p => {
      const feats = p.features.map(f => typeof f === "string" ? f : f.text).join(", ");
      context += `   - ${p.level}: ₹${p.price}${p.period || ""} (Inclusions: ${feats})\n`;
    });
  }

  return context;
}

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        role: "model",
        text: "Hi there! I am the BizzMaker Bot. (API Key not configured yet, showing demo mode). How can I help you with SEO, performance campaigns, or website packages today?"
      });
    }

    // Retrieve active live pricing context dynamically
    const pricingContext = await getActivePricingContext();
    const dynamicPrompt = BASE_SYSTEM_PROMPT.replace("[SERVICES_AND_PACKAGES_PLACEHOLDER]", pricingContext);

    // Structure contents array with prepended system grounding instructions
    const contents = [
      {
        role: "user",
        parts: [{ text: `System Instructions: ${dynamicPrompt}` }]
      },
      {
        role: "model",
        parts: [{ text: "Understood. I will act as BizzMaker Bot under these instructions." }]
      },
      ...messages.map(msg => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }))
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Gemini API Error details:", data);
      throw new Error(data.error?.message || "Failed to fetch response from Gemini API");
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I could not process that query. Please try again.";

    return NextResponse.json({
      role: "model",
      text: replyText
    });
  } catch (error) {
    console.error("Chat API route error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
