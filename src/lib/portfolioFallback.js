import legacyDb from "../../db.json";

function wrap(data) {
  return { data, lastUpdate: new Date() };
}

export function getPortfolioFallback() {
  return {
    profile: wrap({
      name: "Mahbub Alam",
      title: "Full Stack Developer",
      bio: "Full Stack Developer specializing in React, Node.js, PHP, and modern web technologies. Based in Dhaka, Bangladesh.",
      image: "/assets/img/profile.png",
      email: "admin@mahbub.dev",
      phone: "+880-1784-310996",
      location: "Dhaka, Bangladesh",
      github: "https://github.com/mahbub96",
      linkedin: "https://www.linkedin.com/in/md-mahbub-alam-6b751821b",
      company: "Brotecs Technologies Ltd",
      website: "https://mahbub.dev",
    }),
    Banner: wrap({
      name: "Mahbub Alam",
      jobTitle: "Full Stack Developer",
      location: "Dhaka, Bangladesh",
      bio: "I'm a Software Engineer specializing in scalable web applications and enterprise-level VoIP solutions.",
      socialLinks: {
        email: "support@mahbub.dev",
        github: "https://github.com/mahbub96",
        facebook: "https://fb.me/MahbubCSE96",
        linkedin: "https://www.linkedin.com/in/md-mahbub-alam-6b751821b",
      },
    }),
    Skills: wrap(legacyDb.skills || []),
    Experiences: wrap(legacyDb.experiences || []),
    Educations: wrap(legacyDb.educations || []),
    Projects: wrap(legacyDb.projects || []),
    Contact: wrap({
      contactInfo: {
        email: "support@mahbub.dev",
        phone: "+880-1784-310996",
        location: "Dhaka, Bangladesh",
        website: "https://mahbub.dev",
      },
    }),
  };
}
