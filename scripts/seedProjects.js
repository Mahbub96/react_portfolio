const mongoose = require("mongoose");

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/portfolio";

// Portfolio Data Schema
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

const PortfolioData =
  mongoose.models.PortfolioData ||
  mongoose.model("PortfolioData", PortfolioDataSchema);

// Sample Projects Data
const sampleProjects = [
  {
    id: "project_1",
    name: "E-Commerce Platform",
    desc: "A full-stack e-commerce platform built with React, Node.js, and MongoDB. Features include user authentication, product management, shopping cart, and payment integration.",
    src: "https://via.placeholder.com/400x250/64ffda/0f0f1a?text=E-Commerce",
    lang: "React, Node.js, MongoDB, Express, Stripe",
    liveUrl: "https://github.com/mahbub96/ecommerce-platform",
    downloadUrl:
      "https://github.com/mahbub96/ecommerce-platform/archive/main.zip",
    githubUrl: "https://github.com/mahbub96/ecommerce-platform",
  },
  {
    id: "project_2",
    name: "Portfolio Website",
    desc: "Modern portfolio website built with Next.js and MongoDB. Features SSR, SEO optimization, dark/light theme, and visitor analytics.",
    src: "https://via.placeholder.com/400x250/64ffda/0f0f1a?text=Portfolio",
    lang: "Next.js, MongoDB, CSS Modules, React Icons",
    liveUrl: "https://mahbub.dev",
    downloadUrl: "https://github.com/mahbub96/portfolio/archive/main.zip",
    githubUrl: "https://github.com/mahbub96/portfolio",
  },
  {
    id: "project_3",
    name: "VoIP Management System",
    desc: "Enterprise-level VoIP solution for call management, routing, and analytics. Built with Laravel and MySQL for scalability.",
    src: "https://via.placeholder.com/400x250/64ffda/0f0f1a?text=VoIP+System",
    lang: "Laravel, PHP, MySQL, JavaScript, Bootstrap",
    liveUrl: "https://github.com/mahbub96/voip-system",
    downloadUrl: "https://github.com/mahbub96/voip-system/archive/main.zip",
    githubUrl: "https://github.com/mahbub96/voip-system",
  },
  {
    id: "project_4",
    name: "Task Management App",
    desc: "Collaborative task management application with real-time updates, team collaboration, and progress tracking.",
    src: "https://via.placeholder.com/400x250/64ffda/0f0f1a?text=Task+Manager",
    lang: "React, Firebase, Material-UI, Socket.io",
    liveUrl: "https://github.com/mahbub96/task-manager",
    downloadUrl: "https://github.com/mahbub96/task-manager/archive/main.zip",
    githubUrl: "https://github.com/mahbub96/task-manager",
  },
  {
    id: "project_5",
    name: "Weather Dashboard",
    desc: "Real-time weather dashboard with location-based forecasts, interactive maps, and historical data visualization.",
    src: "https://via.placeholder.com/400x250/64ffda/0f0f1a?text=Weather+App",
    lang: "React, OpenWeather API, Chart.js, Geolocation",
    liveUrl: "https://github.com/mahbub96/weather-dashboard",
    downloadUrl:
      "https://github.com/mahbub96/weather-dashboard/archive/main.zip",
    githubUrl: "https://github.com/mahbub96/weather-dashboard",
  },
  {
    id: "project_6",
    name: "Blog Platform",
    desc: "Full-featured blog platform with markdown support, user authentication, comments, and admin dashboard.",
    src: "https://via.placeholder.com/400x250/64ffda/0f0f1a?text=Blog+Platform",
    lang: "Next.js, Prisma, PostgreSQL, Tailwind CSS",
    liveUrl: "https://github.com/mahbub96/blog-platform",
    downloadUrl: "https://github.com/mahbub96/blog-platform/archive/main.zip",
    githubUrl: "https://github.com/mahbub96/blog-platform",
  },
];

// Sample Skills Data
const sampleSkills = [
  {
    id: "skill_1",
    name: "React",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
  {
    id: "skill_2",
    name: "Node.js",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  },
  {
    id: "skill_3",
    name: "JavaScript",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  },
  {
    id: "skill_4",
    name: "TypeScript",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  },
  {
    id: "skill_5",
    name: "PHP",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
  },
  {
    id: "skill_6",
    name: "Laravel",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-plain.svg",
  },
  {
    id: "skill_7",
    name: "MongoDB",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  },
  {
    id: "skill_8",
    name: "MySQL",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  },
  {
    id: "skill_9",
    name: "AWS",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg",
  },
  {
    id: "skill_10",
    name: "Docker",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  },
  {
    id: "skill_11",
    name: "Git",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
  },
  {
    id: "skill_12",
    name: "Next.js",
    src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  },
];

// Sample Profile Data
const sampleProfile = {
  name: "Mahbub Alam",
  title: "Full Stack Developer",
  bio: "Passionate Full Stack Developer with expertise in React, Node.js, PHP, and modern web technologies. Specializing in scalable web applications and enterprise-level VoIP solutions.",
  image: "/assets/img/profile.png",
  email: "mahbub@example.com",
  phone: "+880 1234-567890",
  location: "Dhaka, Bangladesh",
  github: "https://github.com/mahbub96",
  linkedin: "https://linkedin.com/in/md-mahbub-alam-6b751821b",
  twitter: "https://twitter.com/mahbubcse96",
};

// Sample Experiences Data
const sampleExperiences = [
  {
    id: "exp_1",
    name: "Senior Software Engineer",
    time: "2022 - Present",
    how: "Leading development of scalable web applications and VoIP solutions. Implemented microservices architecture improving system performance by 40%.",
  },
  {
    id: "exp_2",
    name: "Full Stack Developer",
    time: "2020 - 2022",
    how: "Developed and maintained multiple web applications using React, Node.js, and PHP. Reduced deployment time by 60% through CI/CD implementation.",
  },
  {
    id: "exp_3",
    name: "Junior Developer",
    time: "2019 - 2020",
    how: "Built responsive web interfaces and RESTful APIs. Collaborated with cross-functional teams to deliver high-quality software solutions.",
  },
];

// Sample Educations Data
const sampleEducations = [
  {
    id: "edu_1",
    name: "Stamford University Bangladesh",
    time: "2015 - 2019",
    degName: "Bachelor of Science in Computer Science & Engineering",
    Department: "Computer Science & Engineering",
    cgpa: "3.85/4.00",
    Thesis: "Machine Learning in Web Security",
  },
  {
    id: "edu_2",
    name: "Dhaka College",
    time: "2013 - 2015",
    degName: "Higher Secondary Certificate",
    Department: "Science",
    cgpa: "5.00/5.00",
  },
];

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully!");

    // Seed Projects
    console.log("Seeding Projects...");
    await PortfolioData.findOneAndUpdate(
      { collectionName: "Projects" },
      {
        collectionName: "Projects",
        data: sampleProjects,
        lastUpdate: new Date(),
      },
      { upsert: true, new: true }
    );

    // Seed Skills
    console.log("Seeding Skills...");
    await PortfolioData.findOneAndUpdate(
      { collectionName: "Skills" },
      {
        collectionName: "Skills",
        data: sampleSkills,
        lastUpdate: new Date(),
      },
      { upsert: true, new: true }
    );

    // Seed Profile
    console.log("Seeding Profile...");
    await PortfolioData.findOneAndUpdate(
      { collectionName: "profile" },
      {
        collectionName: "profile",
        data: sampleProfile,
        lastUpdate: new Date(),
      },
      { upsert: true, new: true }
    );

    // Seed Experiences
    console.log("Seeding Experiences...");
    await PortfolioData.findOneAndUpdate(
      { collectionName: "Experiences" },
      {
        collectionName: "Experiences",
        data: sampleExperiences,
        lastUpdate: new Date(),
      },
      { upsert: true, new: true }
    );

    // Seed Educations
    console.log("Seeding Educations...");
    await PortfolioData.findOneAndUpdate(
      { collectionName: "Educations" },
      {
        collectionName: "Educations",
        data: sampleEducations,
        lastUpdate: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log("✅ Database seeded successfully!");
    console.log("📊 Sample data added:");
    console.log(`   - ${sampleProjects.length} Projects`);
    console.log(`   - ${sampleSkills.length} Skills`);
    console.log(`   - ${sampleExperiences.length} Experiences`);
    console.log(`   - ${sampleEducations.length} Educations`);
    console.log(`   - 1 Profile`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seeding
seedDatabase();
