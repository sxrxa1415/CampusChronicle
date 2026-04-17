import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { put } from "@vercel/blob";

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".webp", ".csv", ".xls", ".xlsx",
];

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("cc-user-id")?.value;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    // Validate file type
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { success: false, message: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_{2,}/g, "_");
    const filename = `${timestamp}_${sanitizedName}`;

    // CASE 1: Vercel Blob Storage (Production Recommended)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(filename, file, { 
          access: 'public',
          addRandomSuffix: true 
        });
        
        return NextResponse.json({
          success: true,
          message: "File uploaded to cloud storage.",
          data: {
            filename: blob.pathname,
            originalName: file.name,
            size: file.size,
            mimeType: file.type,
            url: blob.url,
          },
        });
      } catch (blobError) {
        console.error("Vercel Blob error:", blobError);
        // Fall through to local if blob fails (might be token issues)
      }
    }

    // CASE 2: Local Filesystem (Dev Only, Fails on Vercel)
    // Warning: Vercel filesystem is read-only. This block will fail if not using Blob.
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(uploadsDir, filename);
      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${filename}`;

      return NextResponse.json({
        success: true,
        message: "File uploaded locally (Note: Local uploads don't persist on Vercel).",
        data: {
          filename,
          originalName: file.name,
          size: file.size,
          mimeType: file.type,
          url: publicUrl,
        },
      });
    } catch (fsError) {
      console.error("Filesystem upload error:", fsError);
      
      // DEMO MODE FOR VERCEL (When Blob isn't configured yet)
      // If we are on Vercel and local write fails, we return a fallback static URL
      // so the user can still demonstrate the UI flow.
      const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
      
      if (isVercel && !process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json({
          success: true,
          message: "DEMO MODE: Using static fallback file (Vercel Blob not configured).",
          data: {
            filename: "demo_fallback.pdf",
            originalName: file.name,
            size: file.size,
            mimeType: file.type,
            url: "/uploads/demo_template.pdf", // Use one of the files already pushed to Git
          },
        });
      }

      return NextResponse.json(
        { 
          success: false, 
          message: "Vercel deployment detected. Please configure BLOB_READ_WRITE_TOKEN for persistent file uploads." 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("General upload error:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed. Server configuration error." },
      { status: 500 }
    );
  }
}
