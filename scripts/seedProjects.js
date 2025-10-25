require("dotenv").config();
const mongoose = require("mongoose");

// MongoDB connection string
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio";

console.log("MONGODB_URI", MONGODB_URI);

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
    title: "Full Stack Developer",
    bio: "Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies. Based in Dhaka, Bangladesh.",
    image: "/assets/img/profile.png",
    email: "admin@mahbub.dev",
    phone: "+880-1784-310996",
    location: "Dhaka, Bangladesh",
    github: "https://github.com/mahbub96",
    linkedin: "https://linkedin.com/in/md-mahbub-alam-6b751821b",
    twitter: "https://twitter.com/mahbubcse96",
    company: "Brotecs Technologies Ltd",
    website: "https://mahbub.dev",
  },
  Skills: [
    { id: 100, name: "PHP", src: "/assets/img/php.png" },
    { id: 101, name: "React JS", src: "/assets/img/javaScript.png" },
    { id: 116, name: "React Native", src: "/assets/img/react-native.png" },
    { id: 104, name: "Node Js", src: "/assets/img/nodejs.png" },
    { id: 105, name: "MY SQL", src: "/assets/img/mysql.png" },
    { id: 106, name: "git", src: "/assets/img/git.png" },
    { id: 109, name: "Bootstarp", src: "/assets/img/bootstarp.png" },
    { id: 110, name: "tailwind", src: "/assets/img/tailwind.png" },
    { id: 111, name: "python", src: "/assets/img/python.png" },
    { id: 112, name: "C Plus Plus", src: "/assets/img/c++.png" },
    { id: 114, name: "Assembly Language", src: "/assets/img/asm.png" },
    { id: 115, name: "SQlite3", src: "/assets/img/sqlite3.png" },
    { id: 117, name: "Swings", src: "/assets/img/swings.png" },
  ],
  Experiences: [
    {
      id: 1,
      name: "Software Engineer Intern (Remote)",
      time: "September 2023 - March 2024",
      how: "Stitel Networks LLC.",
    },
    {
      id: 2,
      name: "Junior Software Engineer I (Remote)",
      time: "March 2024 - March 2025",
      how: "Stitel Networks LLC.",
    },
    {
      id: 3,
      name: "Junior Software Engineer II (Remote)",
      time: "March 2025 - Present",
      how: "Stitel Networks LLC.",
    },
    {
      id: 4,
      name: "Software Engineer Intern",
      time: "September 2023 - March 2024",
      how: "Brotecs Technologies Ltd",
    },
    {
      id: 5,
      name: "Junior Software Engineer I",
      time: "March 2024 - March 2025",
      how: "Brotecs Technologies Ltd",
    },
    {
      id: 6,
      name: "Junior Software Engineer II",
      time: "March 2025 - Present",
      how: "Brotecs Technologies Ltd",
    },
  ],
  Educations: [
    {
      id: 1,
      time: "2009 - 2014",
      name: "Shyamkur High School",
      degName: "Secondary School Certificate (SSC)",
      cgpa: "4.44 out of 5.00",
      group: "Science",
      Thesis: "No",
    },
    {
      id: 2,
      time: "2014 - 2016",
      name: "BAF SHAHEEN COLLEGE,JESSORE",
      degName: "Higher Secondary Certificate (HSC)",
      cgpa: "4.00 out of 5.00",
      group: "Science",
      Thesis: "No",
    },
    {
      id: 3,
      time: "2019 - 2022",
      name: "Stamford University Bangladesh",
      degName: "Bachelor Of Science",
      cgpa: "3.75 out of 4.00",
      Department: "Computer Science and Engineering",
      Thesis: "Speech to Emotion Detection Using Deep Learning",
    },
  ],
  Projects: [
    {
      id: 1,
      name: "Test-Buddy",
      src: "/assets/img/testbuddy.png",
      desc: "Software Engineering Demo Project for University Course. A React-based application for managing and conducting tests/exams with a modern UI.",
      lang: ["React JS", "HTML", "CSS", "JavaScript"],
      githubUrl: "https://github.com/Mahbub96/Test-Buddy",
      liveUrl: "https://test-buddy.mahbub.dev",
    },
    {
      id: 2,
      name: "Blood Donation Management System",
      src: "/assets/img/blood.png",
      desc: "A Java desktop application for managing blood donation and donor information with SQLite database.",
      lang: ["Java", "SQLite3", "Swing"],
      githubUrl: "https://github.com/Mahbub96/BloodDonationManagementSystem",
      liveUrl: "https://blood.mahbub.dev",
    },
    {
      id: 3,
      name: "Dot Matrix Display",
      src: "/assets/img/assembly.png",
      desc: "Interactive dot matrix display built with HTML, CSS, and JavaScript.",
      lang: ["HTML", "CSS", "JavaScript"],
      githubUrl: "https://github.com/Mahbub96/dot_matrix",
      liveUrl: "https://dot-matrix.mahbub.dev",
    },
    {
      id: 4,
      name: "Chat Application",
      src: "/assets/img/chat.png",
      desc: "Real-time chat app using React, Node.js, and Socket.io.",
      lang: ["React JS", "Node Js", "Socket.io"],
      githubUrl: "https://github.com/Mahbub96/chat-application",
      liveUrl: "https://chat.mahbub.dev",
    },
    {
      id: 5,
      name: "Speech Emotion Recognition",
      src: "/assets/img/python.png",
      desc: "Detect emotions from speech using deep learning (Python).",
      lang: ["Python", "Machine Learning"],
      githubUrl: "https://github.com/Mahbub96/speech-emotion-recognition",
      liveUrl: "https://speech-emotion.mahbub.dev",
    },
    {
      id: 6,
      name: "Next Portfolio",
      src: "/assets/img/react.png",
      desc: "Personal portfolio built with React & Firebase.",
      lang: ["React JS", "Firebase"],
      githubUrl: "https://github.com/Mahbub96/react_portfolio",
      liveUrl: "https://portfolio.mahbub.dev",
    },
  ],
  Banner: {
    title: "Hi, I'm Mahbub Alam",
    subtitle: "Full Stack Developer",
    description:
      "I build exceptional and accessible digital experiences for the web.",
    cta: "Get In Touch",
    background: "/assets/img/banner-bg.jpg",
  },
  About: {
    title: "About Me",
    description:
      "I'm a passionate Full Stack Developer with expertise in modern web technologies. I love creating user-friendly applications and solving complex problems through code.",
    skills: ["React", "Node.js", "PHP", "MongoDB", "MySQL", "AWS", "Docker"],
  },
  Contact: {
    title: "Get In Touch",
    description:
      "I'm open to new opportunities. Whether you have a question or want to say hi, I'll reply soon!",
    email: "admin@mahbub.dev",
    phone: "+880-1XXX-XXXXXX",
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
    console.error("❌ Error seeding database:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run seeding
seedDatabase();
