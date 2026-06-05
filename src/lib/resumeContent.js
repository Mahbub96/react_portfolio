/**
 * ATS resume content — mirrors the LaTeX reference layout.
 * Contact/header fields are merged from MongoDB portfolio data at generation time.
 */
export const resumeContent = {
  professionalSummary:
    "Software Engineer with 2+ years of professional experience in full-stack web development, cloud-based VoIP systems, microservices architecture, and AI-driven solutions. Proficient in PHP (Laravel, CodeIgniter), JavaScript/TypeScript (React.js, Next.js, Node.js), and Python (FastAPI, Computer Vision, Deep Learning). Proven ability to design scalable RESTful APIs, implement automated CI/CD pipelines, and integrate machine learning models into production environments. Targeting growth as an AI Full-Stack Developer.",

  skillCategories: [
    {
      label: "Languages:",
      items:
        "PHP, JavaScript, TypeScript, Python, Java, C, C++",
    },
    {
      label: "Frameworks & Libraries:",
      items:
        "Laravel, CodeIgniter, Node.js, Express.js, React.js, Next.js, FastAPI, Django, Prisma",
    },
    {
      label: "Databases:",
      items: "MySQL, PostgreSQL, MongoDB, SQLite, Firebase",
    },
    {
      label: "DevOps & Tools:",
      items:
        "Git, GitHub, Docker, GitHub Actions, CI/CD, DevSecOps, Microservices, REST APIs",
    },
    {
      label: "AI / Machine Learning:",
      items:
        "YOLO, FaceNet, OpenCV, CNN, Keras, Speech Emotion Recognition, Computer Vision",
    },
    {
      label: "Languages:",
      items: "Bangla (Native), English (Professional)",
    },
  ],

  workExperiences: [
    {
      title: "Junior Software Engineer II",
      period: "Sep 2023 - Present",
      company: "Brotecs Technologies Ltd.",
      location: "Dhaka, Bangladesh",
      bullets: [
        "Designed, developed, and maintained scalable **full-stack application features** using the **MERN Stack**, adhering to clean architecture principles.",
        "Developed and optimized **backend services and microservices** using **FastAPI**, **Node.js**, and **PostgreSQL**, improving system performance and reliability.",
        "Contributed to cloud-based **VoIP systems** supporting real-time communication and high availability for enterprise clients.",
        "Integrated secure **payment gateways** and implemented authentication and **role-based authorization** mechanisms across multiple platforms.",
        "Implemented automated **CI/CD pipelines** using **GitHub Actions**, following **DevSecOps** best practices and reducing deployment time.",
        "Collaborated with cross-functional teams across **React.js, Next.js, PHP, Python, Prisma**, and **MongoDB** environments to deliver end-to-end solutions.",
      ],
      note: "Career progression: Intern Engineer (Sep 2023) -> Junior Software Engineer I -> Junior Software Engineer II (current)",
    },
  ],

  featuredProjects: [
    {
      name: "AI-Powered Video Surveillance System",
      tech: "Python, YOLO, FaceNet, OpenCV, Docker",
      bullets: [
        "Extended an open-source NVR (Frigate) platform with **real-time object detection** (YOLO) and **face identification** (FaceNet) without reliance on proprietary cloud services.",
        "Built and optimized scalable **video analytics pipelines**; ongoing work improving detection accuracy and system throughput.",
      ],
    },
    {
      name: "Healthcare Platform",
      tech: "MERN Stack, SSLCommerz",
      bullets: [
        "Developed a multi-role healthcare management system with **real-time patient vitals monitoring** and secure **online payment integration**.",
      ],
    },
    {
      name: "IoT Management System",
      tech: "FastAPI, PostgreSQL, React.js",
      bullets: [
        "Designed RESTful backend APIs and interactive dashboards for IoT **device management** and **real-time data visualization**.",
      ],
    },
    {
      name: "Speech Emotion Recognition System",
      tech: "Python, CNN, Keras",
      bullets: [
        "Built a **deep learning model** to classify emotions from Bangla speech; integrated with a real-time Android application.",
      ],
    },
    {
      name: "Digital Stethoscope ECG Visualizer",
      tech: "React, D3.js, Web Audio API",
      bullets: [
        "Implemented **real-time heart sound playback** and ECG waveform visualization aligned with clinical representation standards.",
      ],
    },
    {
      name: "Next.js E-Commerce Platform",
      tech: "Next.js, TypeScript, PostgreSQL",
      bullets: [
        "Built a full-stack e-commerce application with **role-based access control**, product management, and secure checkout flow.",
      ],
    },
  ],

  additionalProjects: [
    {
      name: "Mobile Mess Management App",
      tech: "React Native, Express.js, Firebase",
      desc: "Role-based mobile app for meal, member, and shared expense management.",
    },
    {
      name: "Enterprise Academic System",
      tech: "Laravel, MySQL",
      desc: "Academic management system for student, faculty, and administrative workflows.",
    },
    {
      name: "E-Learning Platform",
      tech: "React, Node.js",
      desc: "Online learning platform with quizzes, assignments, and collaborative features.",
    },
    {
      name: "Desktop Blood Management System",
      tech: "Java Swing, SQLite",
      desc: "System for managing blood donors, inventory, and request tracking.",
    },
  ],

  certifications: [
    {
      title: "JavaScript (Basic) Certification",
      issuer: "HackerRank",
      url: "https://www.hackerrank.com/profile/mahbubcse96",
    },
    {
      title: "React (Basic) Certification",
      issuer: "HackerRank",
      url: "https://www.hackerrank.com/profile/mahbubcse96",
    },
    "Active problem solver on HackerRank focusing on algorithms and data structures.",
  ],

  leadership: [
    "Organized and managed multiple university technical programs and events, supporting student collaboration and engagement.",
    "Coordinated an inter-software company cricket tournament to promote teamwork and community involvement.",
  ],

  references: [
    {
      name: "Sharif Hossain",
      phone: "+88-01621561651",
      title: "Assistant Principal Software Engineer, Brotecs Technologies Ltd.",
      url: "https://www.linkedin.com/in/sharif779/",
    },
    {
      name: "Md Towhidul Islam Robin",
      phone: "+88-01921009582",
      title: "Assistant Professor, Department of CSE, Stamford University Bangladesh",
      url: "https://www.linkedin.com/in/md-towhidul-islam-robin-a8a924283/",
    },
  ],
};
