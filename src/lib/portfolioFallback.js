import legacyDb from "../../db.json";

function wrap(data) {
  return { data, lastUpdate: new Date() };
}

export function getPortfolioFallback() {
  return {
    profile: wrap({
      name: "Mahbub Alam",
      title: "Software Engineer | Full-Stack, Backend & Applied AI",
      bio: "Software Engineer building full-stack, backend, cloud-enabled, and applied AI solutions across enterprise, healthcare, education, and automation-focused systems.",
      image: "/assets/img/profile.png",
      email: "mahbubcse96@gmail.com",
      phone: "+880-1784-310996",
      location: "Dhaka, Bangladesh",
      github: "https://github.com/mahbub96",
      linkedin: "https://www.linkedin.com/in/mahbubcse96",
      company: "Brotecs Technologies Ltd.",
      website: "https://mahbub.dev",
    }),
    Banner: wrap({
      name: "Mahbub Alam",
      jobTitle: "Software Engineer | Full-Stack, Backend & Applied AI",
      location: "Dhaka, Bangladesh",
      bio: "Software Engineer building full-stack, backend, cloud-enabled, and applied AI solutions across enterprise, healthcare, education, and automation-focused systems.",
      headline:
        "I build maintainable web applications, backend APIs, and practical AI-enabled systems for real business workflows.",
      socialLinks: {
        email: "mahbubcse96@gmail.com",
        github: "https://github.com/mahbub96",
        facebook: "https://fb.me/MahbubCSE96",
        linkedin: "https://www.linkedin.com/in/mahbubcse96",
      },
    }),
    Skills: wrap(legacyDb.skills || []),
    Experiences: wrap(legacyDb.experiences || []),
    Educations: wrap(legacyDb.educations || []),
    Projects: wrap(legacyDb.projects || []),
    Contact: wrap({
      contactInfo: {
        email: "mahbubcse96@gmail.com",
        phone: "+880-1784-310996",
        location: "Dhaka, Bangladesh",
        website: "https://mahbub.dev",
      },
    }),
  };
}
