require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const mongoose = require("mongoose");
const legacyDb = require("../db.json");

// MongoDB connection string
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio";

// Define PortfolioData schema
const PortfolioDataSchema = new mongoose.Schema(
  {
    collectionName: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "profile",
        "Skills",
        "Experiences",
        "Projects",
        "Educations",
        "Banner",
        "About",
        "Contact",
      ],
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

// ---- SAMPLE DATA ---- //
const sampleData = {
  profile: {
    name: "Mahbub Alam",
    title: "Software Engineer | Full-Stack, Backend & Applied AI",
    bio: "Software Engineer building full-stack, backend, cloud-enabled, and applied AI solutions across enterprise, healthcare, education, and automation-focused systems.",
    image: "/assets/img/profile.png",
    email: "mahbubcse96@gmail.com",
    phone: "+880-1784-310996",
    location: "Dhaka, Bangladesh",
    github: "https://github.com/mahbub96",
    linkedin: "https://www.linkedin.com/in/mahbubcse96",
    twitter: "https://twitter.com/mahbubcse96",
    company: "Brotecs Technologies Ltd.",
    website: "https://mahbub.dev",
  },
  Skills: legacyDb.skills,
  Experiences: legacyDb.experiences,
  Educations: legacyDb.educations,
  Projects: legacyDb.projects,
  Banner: {
    name: "Mahbub Alam",
    jobTitle: "Software Engineer | Full-Stack, Backend & Applied AI",
    location: "Dhaka, Bangladesh",
    bio: "Software Engineer building full-stack, backend, cloud-enabled, and applied AI solutions across enterprise, healthcare, education, and automation-focused systems.",
    headline: "I build maintainable web applications, backend APIs, and practical AI-enabled systems for real business workflows.",
    socialLinks: {
      email: "mahbubcse96@gmail.com",
      github: "https://github.com/mahbub96",
      facebook: "https://fb.me/MahbubCSE96",
      linkedin: "https://www.linkedin.com/in/mahbubcse96",
    },
  },
  About: {
    title: "About Me",
    description:
      "Software Engineer with professional experience in full-stack and backend application development, production workflows, cloud-enabled systems, and applied AI interests.",
    skills: ["React", "Next.js", "Node.js", "Python", "FastAPI", "Laravel", "MySQL", "Docker"],
  },
  Contact: {
    title: "Get In Touch",
    description:
      "For professional communication, technical collaboration, or project discussions, feel free to contact me.",
    email: "mahbubcse96@gmail.com",
    phone: "+880-1784-310996",
    location: "Dhaka, Bangladesh",
  },
};

// ---- SEED FUNCTION ---- //
async function seedDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🧹 Clearing existing data...");
    await PortfolioData.deleteMany({});

    console.log("📝 Inserting new data...");
    for (const [collectionName, data] of Object.entries(sampleData)) {
      await PortfolioData.create({
        collectionName,
        data,
        lastUpdate: new Date(),
      });
      console.log(`✔ Inserted: ${collectionName}`);
    }

    const count = await PortfolioData.countDocuments();
    console.log(`\n🎉 Seeding complete! Total collections: ${count}`);
  } catch (error) {
    console.log("❌ Error seeding database:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run seeding
seedDatabase();
