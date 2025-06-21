const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const mongoose = require("mongoose");

// Firebase configuration (from your existing project)
const firebaseConfig = {
  apiKey: "AIzaSyAdHLH0_nqGRggAZaio1qUCHkmjqrGq-1o",
  authDomain: "portfolio-f18a3.firebaseapp.com",
  projectId: "portfolio-f18a3",
  storageBucket: "portfolio-f18a3.appspot.com",
  messagingSenderId: "545894820111",
  appId: "1:545894820111:web:de82f75d60e83886f7b67a",
};

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio";

// MongoDB Schema
const PortfolioDataSchema = new mongoose.Schema(
  {
    collectionName: {
      type: String,
      required: true,
      enum: ["profile", "Skills", "Experiences", "Projects", "Educations"],
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

async function migrateData() {
  try {
    console.log("Starting migration from Firebase to MongoDB...");

    // Initialize Firebase
    const firebaseApp = initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all documents from Firebase portfolio_data collection
    const portfolioDataCollection = collection(firestore, "portfolio_data");
    const snapshot = await getDocs(portfolioDataCollection);

    console.log(`Found ${snapshot.size} documents in Firebase`);

    // Process each document
    for (const doc of snapshot.docs) {
      const docData = doc.data();
      const collectionName = doc.id;

      console.log(`Migrating ${collectionName}...`);

      // Create or update MongoDB document
      await PortfolioData.findOneAndUpdate(
        { collectionName },
        {
          data: docData.data || [],
          lastUpdate: docData.lastUpdate?.toDate() || new Date(),
        },
        { upsert: true, new: true }
      );

      console.log(`✓ Migrated ${collectionName}`);
    }

    console.log("Migration completed successfully!");

    // Verify migration
    const mongoData = await PortfolioData.find({});
    console.log(`MongoDB now contains ${mongoData.length} collections:`);
    mongoData.forEach((doc) => {
      console.log(
        `- ${doc.collectionName}: ${
          Array.isArray(doc.data) ? doc.data.length : 1
        } items`
      );
    });
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };
