import React from "react";
import styles from "./footer.module.css";

function Footer({ data }) {
  const currentYear = new Date().getFullYear();

  // Extract data from database
  const profile = data?.profile?.data || {};
  const bannerData = data?.Banner?.data || {};
  const name = profile.name || bannerData.name || "Mahbub Alam";
  const socialLinks = bannerData.socialLinks || {
    email: "mahbubcse96@gmail.com",
    github: "https://github.com/mahbub96",
    facebook: "https://fb.me/MahbubCSE96",
    linkedin: "https://www.linkedin.com/in/md-mahbub-alam-6b751821b",
  };

  const footerSocialLinks = [
    {
      name: "GitHub",
      icon: "fa fa-github",
      url: socialLinks.github,
      title: "GitHub Profile",
    },
    {
      name: "Email",
      icon: "fa fa-google",
      url: `mailto:${socialLinks.email}`,
      title: "Email me",
    },
    {
      name: "Facebook",
      icon: "fa fa-facebook",
      url: socialLinks.facebook,
      title: "Facebook Profile",
    },
    {
      name: "LinkedIn",
      icon: "fa fa-linkedin",
      url: socialLinks.linkedin,
      title: "LinkedIn Profile",
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.socialLinks}>
          {footerSocialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={link.title}
              className={styles.socialLink}
            >
              <i className={link.icon}></i>
            </a>
          ))}
        </div>

        <div className={styles.footerInfo}>
          <div className={styles.builtWith}>
            <span>Built with</span>
            <i className="fa fa-heart"></i>
            <span>using React</span>
          </div>
          <div className={styles.copyright}>
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              <span className={styles.bracket}>{"<"}</span>
              {name}
              <span className={styles.bracket}>{"/>"}</span>
            </a>
            <span className={styles.copyrightText}>
              © {currentYear}. All Rights Reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
