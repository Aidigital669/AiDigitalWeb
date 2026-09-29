import { NextResponse } from "next/server";
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

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save destination: public/uploads/
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique name to prevent collisions
    const fileExtension = path.extname(file.name) || ".png";
    const baseName = path.basename(file.name, fileExtension).replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueFileName = `${baseName}_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Write file
    fs.writeFileSync(filePath, buffer);

    // Return reference URL
    const relativeUrl = `/uploads/${uniqueFileName}`;
    return NextResponse.json({ success: true, url: relativeUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file: " + error.message }, { status: 500 });
  }
}
