export const dynamic = "force-dynamic";

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
      return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No valid file uploaded" }, { status: 400 });
    }

    const rawName = file.name || "upload";
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save destination: public/uploads/
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Determine extension and media type
    const mimeType = file.type || "";
    let fileExtension = path.extname(rawName).toLowerCase();
    if (!fileExtension) {
      if (mimeType.includes("jpeg") || mimeType.includes("jpg")) fileExtension = ".jpg";
      else if (mimeType.includes("png")) fileExtension = ".png";
      else if (mimeType.includes("webp")) fileExtension = ".webp";
      else if (mimeType.includes("mp4")) fileExtension = ".mp4";
      else if (mimeType.includes("webm")) fileExtension = ".webm";
      else fileExtension = ".png";
    }

    const baseName = path.basename(rawName, fileExtension).replace(/[^a-zA-Z0-9_-]/g, "_") || "media";
    const uniqueFileName = `${baseName}_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Write file to public/uploads
    fs.writeFileSync(filePath, buffer);

    const isVideo = mimeType.startsWith("video/") || [".mp4", ".webm", ".mov", ".ogg"].includes(fileExtension);

    return NextResponse.json({
      success: true,
      url: `/uploads/${uniqueFileName}`,
      fileName: uniqueFileName,
      mediaType: isVideo ? "video" : "image"
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file: " + error.message }, { status: 500 });
  }
}
