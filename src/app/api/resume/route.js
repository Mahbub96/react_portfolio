import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getPortfolioDataFromDb } from "@/lib/getPortfolioData";
import { generateResumePdf } from "@/lib/generateResumePdf";
import { getResumeConfig } from "@/lib/resumeConfig";

function pdfResponse(buffer, filename) {
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

async function serveStaticResume() {
  const { staticFile } = getResumeConfig();
  const relativePath = staticFile.replace(/^\//, "");
  const filePath = path.join(process.cwd(), "public", relativePath);

  const buffer = await readFile(filePath);
  const filename = path.basename(filePath);

  return pdfResponse(buffer, filename);
}

async function serveDynamicResume() {
  const portfolioData = await getPortfolioDataFromDb();
  const { buffer, filename } = generateResumePdf(portfolioData);
  return pdfResponse(buffer, filename);
}

async function handleResumeRequest() {
  const { mode } = getResumeConfig();

  if (mode === "static") {
    return serveStaticResume();
  }

  return serveDynamicResume();
}

export async function GET() {
  try {
    return await handleResumeRequest();
  } catch (error) {
    console.log("Error serving resume:", error);
    const status = error.code === "ENOENT" ? 404 : 500;
    return NextResponse.json(
      {
        error:
          error.code === "ENOENT"
            ? "Static resume file not found. Upload PDF to public/resume/ and set RESUME_STATIC_FILE."
            : error.message || "Failed to generate resume",
      },
      { status }
    );
  }
}

export async function POST() {
  return GET();
}
