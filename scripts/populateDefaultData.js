const mongoose = require("mongoose");

// MongoDB connection string
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio";

// PortfolioData Schema
const PortfolioDataSchema = new mongoose.Schema(
  {
    collectionName: {
      type: String,
      required: true,
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

// Default data for new collections
const defaultData = {
  Banner: {
    name: "Mahbub Alam",
    location: "Dhaka, Bangladesh",
    bio: "As a Junior Software Engineer at Brotecs Technologies Ltd., I specialize in the backend development of web applications and cloud-based VoIP calling solutions. I have hands-on experience with PHP frameworks like CodeIgniter and Laravel, and have also worked with modern JavaScript frameworks such as Node.js and React. Additionally, I am familiar with ASTPP and various UI frameworks including Tailwind, MaterialUI, and Bootstrap.\n\nMy background extends into Python, particularly for deep learning applications, and I am continually exploring new technologies in cloud and DevSecOps to expand my skill set. I am committed to ongoing learning, believing it is key to personal and professional growth.",
    roles: [
      "< Full Stack Developer />",
      1500,
      "{ Mobile App Developer }",
      1500,
      "[ ML Engineer ]",
      1500,
      "< Data Scientist />",
      1500,
      "{ DevSecOps Engineer }",
      1500,
    ],
    socialLinks: {
      email: "admin@mahbub.dev",
      github: "https://github.com/mahbub96",
      facebook: "https://fb.me/MahbubCSE96",
      linkedin: "https://www.linkedin.com/in/md-mahbub-alam-6b751821b",
    },
  },
  About: {
    location: "Dhaka, Bangladesh",
    company: "Brotecs Technologies Ltd",
    companyUrl: "https://brotecs.com",
    description:
      "I'm a Software Engineer at Brotecs Technologies Ltd, where I specialize in developing scalable web applications and enterprise-level VoIP solutions. With a strong foundation in both frontend and backend development, I focus on creating efficient, maintainable, and high-performance software solutions.",
    achievements:
      "In my current role, I've successfully implemented microservices architecture for VoIP systems, improving scalability and reducing deployment time by 40%. I've also led the development of RESTful APIs that handle 100K+ daily requests, and contributed to reducing system downtime by 60% through implementing robust error handling and monitoring solutions.",
    approach:
      "My approach to software development emphasizes clean code principles, test-driven development, and continuous integration practices. I'm particularly passionate about system architecture, performance optimization, and implementing DevSecOps best practices.",
    technicalSkills: {
      "Languages & Frameworks": [
        "JavaScript (ES6+)",
        "TypeScript",
        "PHP",
        "Python",
        "React.js",
        "Node.js",
        "Laravel",
        "CodeIgniter",
      ],
      "Database & Cloud": [
        "MySQL",
        "MongoDB",
        "PostgreSQL",
        "AWS",
        "Docker",
        "MongoDB",
      ],
      "Development Tools": [
        "Git",
        "VS Code",
        "Jira",
        "Postman",
        "Linux/Unix",
        "CI/CD",
      ],
      "Specialized Skills": [
        "RESTful APIs",
        "VoIP Solutions",
        "System Architecture",
        "Deep Learning",
        "Agile/Scrum",
        "TDD",
      ],
    },
  },
  Contact: {
    contactInfo: {
      location: "Dhaka, Bangladesh",
      email: "admin@mahbub.dev",
    },
    message:
      "I'm currently looking for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!",
  },
};

async function populateDefaultData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Populate each collection
    for (const [collectionName, data] of Object.entries(defaultData)) {
      try {
        // Check if collection already exists
        const existing = await PortfolioData.findOne({ collectionName });

        if (existing) {
          console.log(
            `Collection ${collectionName} already exists, skipping...`
          );
          continue;
        }

        // Create new collection with data
        await PortfolioData.create({
          collectionName,
          data,
          lastUpdate: new Date(),
        });

        console.log(`✅ Successfully created ${collectionName} collection`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(
            `Collection ${collectionName} already exists, skipping...`
          );
        } else {
          console.error(
            `❌ Error creating ${collectionName} collection:`,
            error.message
          );
        }
      }
    }

    console.log("\n🎉 Default data population completed!");

    // List all collections
    const allCollections = await PortfolioData.find({}).select(
      "collectionName lastUpdate"
    );
    console.log("\n📊 Current collections in database:");
    allCollections.forEach((collection) => {
      console.log(
        `  - ${collection.collectionName} (last updated: ${collection.lastUpdate})`
      );
    });
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
populateDefaultData();
