const mongoose = require("mongoose");

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio";

// MongoDB Schema
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

async function checkEducationData() {
  try {
    console.log("Checking Education data structure...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get Education data
    const educationData = await PortfolioData.findOne({
      collectionName: "Education",
    });

    if (educationData) {
      console.log("Education collection found!");
      console.log("Number of education records:", educationData.data.length);
      console.log("\nSample education record:");
      if (educationData.data.length > 0) {
        console.log(JSON.stringify(educationData.data[0], null, 2));
      }

      console.log("\nAll education records:");
      educationData.data.forEach((edu, index) => {
        console.log(`\n--- Education ${index + 1} ---`);
        console.log("ID:", edu.id);
        console.log("Name:", edu.name);
        console.log("Time:", edu.time);
        console.log("Degree Name:", edu.degName);
        console.log("Department:", edu.Department);
        console.log("CGPA:", edu.cgpa);
        console.log("Thesis:", edu.Thesis);
        console.log("All fields:", Object.keys(edu));
      });
    } else {
      console.log("Education collection not found!");

      // Check what collections exist
      const allCollections = await PortfolioData.find({});
      console.log("\nAvailable collections:");
      allCollections.forEach((col) => {
        console.log(
          `- ${col.collectionName}: ${
            Array.isArray(col.data) ? col.data.length : 1
          } items`
        );
      });
    }
  } catch (error) {
    console.error("Error checking education data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the check if this script is executed directly
if (require.main === module) {
  checkEducationData();
}

module.exports = { checkEducationData };
