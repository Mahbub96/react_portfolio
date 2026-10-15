import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { readFileSync } from "node:fs";
import { resumeContent } from "../src/lib/resumeContent.js";

const legacyDb = JSON.parse(readFileSync(join(process.cwd(), "db.json"), "utf8"));

dotenv.config({ path: ".env.local" });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio";

const PortfolioDataSchema = new mongoose.Schema(
  {
    collectionName: {
      type: String,
      required: true,
      unique: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    lastUpdate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const PortfolioData =
  mongoose.models.PortfolioData ||
  mongoose.model("PortfolioData", PortfolioDataSchema);

async function runMigration() {
  console.log("🚀 Starting Portfolio CMS Data Migration...");
  console.log(`🔌 Connecting to MongoDB: ${MONGODB_URI.replace(/\/\/.*@/, "//***:***@")}`);

  await mongoose.connect(MONGODB_URI);
  console.log("✅ MongoDB connected successfully.");

  // 1. Snapshot backup
  const allExisting = await PortfolioData.find({}).lean();
  const backupDir = join(process.cwd(), "content", "backups");
  await mkdir(backupDir, { recursive: true });
  const backupFile = join(backupDir, `portfolio_backup_${Date.now()}.json`);
  await writeFile(backupFile, JSON.stringify(allExisting, null, 2), "utf8");
  console.log(`💾 Pre-migration backup saved to: ${backupFile}`);

  // 2. Normalize existing array collections
  const arrayCollections = [
    "Projects",
    "Skills",
    "Experiences",
    "Educations",
    "CoreStrengths",
  ];

  for (const col of arrayCollections) {
    let doc = await PortfolioData.findOne({ collectionName: col });

    // If missing from DB, initialize from legacyDb
    if (!doc) {
      const fallbackKey =
        col === "Projects"
          ? "projects"
          : col === "Skills"
          ? "skills"
          : col === "Experiences"
          ? "experiences"
          : col === "Educations"
          ? "educations"
          : col === "CoreStrengths"
          ? "coreStrengths"
          : null;

      const seedArray = fallbackKey && legacyDb[fallbackKey] ? legacyDb[fallbackKey] : [];
      doc = await PortfolioData.create({
        collectionName: col,
        data: seedArray,
        lastUpdate: new Date(),
      });
      console.log(`✨ Created missing collection document: ${col} with ${seedArray.length} items`);
    }

    if (Array.isArray(doc.data)) {
      const normalized = doc.data.map((item, index) => ({
        ...item,
        id: item.id !== undefined && item.id !== null ? String(item.id) : `${col.toLowerCase()}_${index + 1}`,
        published: item.published !== undefined ? Boolean(item.published) : true,
        order: typeof item.order === "number" ? item.order : index,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastModifiedBy: item.lastModifiedBy || "system-migration",
      }));

      doc.data = normalized;
      doc.lastUpdate = new Date();
      doc.markModified("data");
      await doc.save();
      console.log(`✔ Normalized ${col}: ${normalized.length} items.`);
    }
  }

  // 3. Migrate Certifications from resumeContent.js if not yet present
  let certDoc = await PortfolioData.findOne({ collectionName: "Certifications" });
  if (!certDoc) {
    const rawCerts = resumeContent.certifications || [];
    const formattedCerts = rawCerts.map((cert, index) => {
      if (typeof cert === "string") {
        return {
          id: `cert_${index + 1}`,
          title: cert,
          issuer: "Independent / Problem Solving",
          url: "https://www.hackerrank.com/profile/mahbubcse96",
          issueDate: "",
          description: cert,
          published: true,
          order: index,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastModifiedBy: "system-migration",
        };
      }
      return {
        id: `cert_${index + 1}`,
        title: cert.title || "Certification",
        issuer: cert.issuer || "Online Platform",
        url: cert.url || "",
        issueDate: "",
        description: cert.description || "",
        published: true,
        order: index,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastModifiedBy: "system-migration",
      };
    });

    await PortfolioData.create({
      collectionName: "Certifications",
      data: formattedCerts,
      lastUpdate: new Date(),
    });
    console.log(`✔ Seeded Certifications collection with ${formattedCerts.length} items.`);
  }

  // 4. Migrate Achievements / Leadership if not yet present
  let achDoc = await PortfolioData.findOne({ collectionName: "Achievements" });
  if (!achDoc) {
    const rawLeadership = resumeContent.leadership || [];
    const formattedAchs = rawLeadership.map((item, index) => ({
      id: `ach_${index + 1}`,
      title: typeof item === "string" ? item.split(",")[0] : item.title || "Achievement",
      organization: "Community & University",
      description: typeof item === "string" ? item : item.description || "",
      date: "",
      published: true,
      order: index,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastModifiedBy: "system-migration",
    }));

    await PortfolioData.create({
      collectionName: "Achievements",
      data: formattedAchs,
      lastUpdate: new Date(),
    });
    console.log(`✔ Seeded Achievements collection with ${formattedAchs.length} items.`);
  }

  console.log("🎉 Portfolio Data Migration finished successfully!");
  await mongoose.disconnect();
}

runMigration().catch((err) => {
  console.error("❌ Migration error:", err);
  process.exit(1);
});
