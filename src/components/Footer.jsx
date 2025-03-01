import React from "react";
import styles from "./footer.module.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "GitHub",
      icon: "fa fa-github",
      url: "https://github.com/mahbub96",
      title: "GitHub Profile",
    },
    {
      name: "Email",
      icon: "fa fa-google",
      url: "mailto:mahbubcse96@gmail.com",
      title: "Email me",
    },
    {
      name: "Facebook",
      icon: "fa fa-facebook",
      url: "https://fb.me/MahbubCSE96",
      title: "Facebook Profile",
    },
    {
      name: "LinkedIn",
      icon: "fa fa-linkedin",
      url: "https://www.linkedin.com/in/md-mahbub-alam-6b751821b",
      title: "LinkedIn Profile",
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.socialLinks}>
          {socialLinks.map((link) => (
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
              href="https://github.com/mahbub96"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              <span className={styles.bracket}>{"<"}</span>
              Mahbub Alam
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
