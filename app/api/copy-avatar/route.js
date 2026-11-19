export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const src = "C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\39bf27ff-b84c-4113-b4a5-b21c0e81b126\\assistant_avatar_1784531999723.png";
    const dest = path.join(process.cwd(), "public", "assistant_avatar.png");
    
    // Ensure public folder exists
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.copyFileSync(src, dest);
    return NextResponse.json({ success: true, message: `Copied from ${src} to ${dest}` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
