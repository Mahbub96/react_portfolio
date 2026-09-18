require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env.production' });
const mongoose = require('mongoose');
const legacyDb = require('../db.json');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not configured.');
  process.exit(1);
}

const PortfolioDataSchema = new mongoose.Schema(
  {
    collectionName: {
      type: String,
      required: true,
      unique: true,
      enum: [
        'profile',
        'Skills',
        'Experiences',
        'Projects',
        'Educations',
        'Banner',
        'About',
        'Contact',
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
  mongoose.model('PortfolioData', PortfolioDataSchema);

const updates = {
  profile: {
    name: 'Mahbub Alam',
    title: 'Software Engineer | Full-Stack, Backend & Applied AI',
    bio: 'Software Engineer building full-stack, backend, cloud-enabled, and applied AI solutions across enterprise, healthcare, education, and automation-focused systems.',
    image: '/assets/img/profile.png',
    email: 'mahbubcse96@gmail.com',
    phone: '+880-1784-310996',
    location: 'Dhaka, Bangladesh',
    github: 'https://github.com/mahbub96',
    linkedin: 'https://www.linkedin.com/in/mahbubcse96',
    twitter: 'https://twitter.com/mahbubcse96',
    company: 'Brotecs Technologies Ltd.',
    companyUrl: 'https://brotecs.com',
    website: 'https://mahbub.dev',
  },
  Banner: {
    name: 'Mahbub Alam',
    jobTitle: 'Software Engineer | Full-Stack, Backend & Applied AI',
    location: 'Dhaka, Bangladesh',
    bio: 'Software Engineer building full-stack, backend, cloud-enabled, and applied AI solutions across enterprise, healthcare, education, and automation-focused systems.',
    headline: 'I build maintainable web applications, backend APIs, and practical AI-enabled systems for real business workflows.',
    socialLinks: {
      email: 'mahbubcse96@gmail.com',
      github: 'https://github.com/mahbub96',
      facebook: 'https://fb.me/MahbubCSE96',
      linkedin: 'https://www.linkedin.com/in/mahbubcse96',
    },
  },
  Skills: legacyDb.skills,
  Experiences: legacyDb.experiences,
  Educations: legacyDb.educations,
  Projects: legacyDb.projects,
  About: {
    title: 'About Me',
    description:
      'Software Engineer with professional experience in full-stack and backend application development, production workflows, cloud-enabled systems, and applied AI interests.',
    skills: ['React', 'Next.js', 'Node.js', 'Python', 'FastAPI', 'Laravel', 'MySQL', 'Docker'],
  },
  Contact: {
    title: 'Get In Touch',
    description:
      'For professional communication, technical collaboration, or project discussions, feel free to contact me.',
    email: 'mahbubcse96@gmail.com',
    phone: '+880-1784-310996',
    location: 'Dhaka, Bangladesh',
    contactInfo: {
      email: 'mahbubcse96@gmail.com',
      phone: '+880-1784-310996',
      location: 'Dhaka, Bangladesh',
      website: 'https://mahbub.dev',
    },
  },
};

async function main() {
  await mongoose.connect(MONGODB_URI);
  for (const [collectionName, data] of Object.entries(updates)) {
    await PortfolioData.updateOne(
      { collectionName },
      { $set: { data, lastUpdate: new Date() } },
      { upsert: true }
    );
    console.log(`updated ${collectionName}`);
  }
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
