const mongoose = require("mongoose");

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio";

// MongoDB Schema - Updated to match actual collection names
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
  {
    timestamps: true,
  }
);

const PortfolioData = mongoose.model("PortfolioData", PortfolioDataSchema);

async function fixImagePaths() {
  try {
    console.log("Starting to fix image paths in MongoDB...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all portfolio data
    const portfolioData = await PortfolioData.find({});
    console.log(`Found ${portfolioData.length} collections`);

    for (const doc of portfolioData) {
      console.log(`Processing ${doc.collectionName}...`);

      if (doc.collectionName === "Skills" && Array.isArray(doc.data)) {
        // Fix Skills image paths
        doc.data = doc.data.map((skill) => ({
          ...skill,
          src:
            skill.src?.replace(/^\.\.\/\.\.\/assets\/img\//, "/assets/img/") ||
            skill.src,
        }));
        console.log(`Fixed ${doc.data.length} skills`);
      }

      if (
        (doc.collectionName === "projectsData" ||
          doc.collectionName === "Projects") &&
        Array.isArray(doc.data)
      ) {
        // Fix Projects image paths
        doc.data = doc.data.map((project) => ({
          ...project,
          src:
            project.src?.replace(
              /^\.\.\/\.\.\/assets\/img\//,
              "/assets/img/"
            ) || project.src,
        }));
        console.log(
          `Fixed ${doc.data.length} projects in ${doc.collectionName}`
        );
      }

      // Save the updated document
      await doc.save();
      console.log(`✓ Updated ${doc.collectionName}`);
    }

    console.log("Image paths fixed successfully!");

    // Verify the fixes
    const updatedData = await PortfolioData.find({});
    console.log("Verification - Sample data:");
    updatedData.forEach((doc) => {
      if (doc.collectionName === "Skills" && doc.data.length > 0) {
        console.log(`Skills sample: ${doc.data[0].name} -> ${doc.data[0].src}`);
      }
      if (
        (doc.collectionName === "projectsData" ||
          doc.collectionName === "Projects") &&
        doc.data.length > 0
      ) {
        console.log(
          `Projects sample (${doc.collectionName}): ${doc.data[0].name} -> ${doc.data[0].src}`
        );
      }
    });
  } catch (error) {
    console.error("Failed to fix image paths:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the fix if this script is executed directly
if (require.main === module) {
  fixImagePaths();
}

module.exports = { fixImagePaths };
