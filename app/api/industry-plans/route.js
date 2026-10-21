export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "industryPlans.json");

function getIndustryPlans() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const raw = fs.readFileSync(dataFilePath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading industryPlans.json:", err);
  }
  return { industries: [] };
}

function saveIndustryPlans(data) {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error saving industryPlans.json:", err);
    return false;
  }
}

export async function GET() {
  const data = getIndustryPlans();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const data = getIndustryPlans();

    // Upsert industry plan
    const { industry } = body;
    if (!industry || !industry.id || !industry.name) {
      return NextResponse.json({ success: false, error: "Invalid industry data" }, { status: 400 });
    }

    const existingIndex = data.industries.findIndex((item) => item.id === industry.id);
    if (existingIndex >= 0) {
      data.industries[existingIndex] = { ...data.industries[existingIndex], ...industry };
    } else {
      data.industries.push(industry);
    }

    const ok = saveIndustryPlans(data);
    if (!ok) {
      return NextResponse.json({ success: false, error: "Failed to persist industry plan" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Industry plan saved successfully!", industries: data.industries });
  } catch (err) {
    console.error("Error updating industry plan:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing industry id" }, { status: 400 });
    }

    const data = getIndustryPlans();
    data.industries = data.industries.filter((item) => item.id !== id);
    const ok = saveIndustryPlans(data);

    if (!ok) {
      return NextResponse.json({ success: false, error: "Failed to delete industry plan" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Industry plan deleted successfully!", industries: data.industries });
  } catch (err) {
    console.error("Error deleting industry plan:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
