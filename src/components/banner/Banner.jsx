import React from "react";
import { TypeAnimation } from "react-type-animation";
import styles from "./banner.module.css";

function Banner() {
  const roles = [
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
  ];

  return (
    <section className={styles.banner_section}>
      <div className={styles.tech_background}></div>
      <div className="container" style={{ marginTop: "110px" }}>
        <div className={`${styles.banner_container} rounded cont pb-4`}>
          <div className="row">
            <div className="col-lg-4"></div>
            <div className="col-lg-4 d-flex justify-content-center">
              <div className={styles.profile_card}>
                <div
                  className={`${styles.profile_image} rounded-circle`}
                  style={{
                    backgroundImage: "url('./assets/img/profile.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  aria-label="Profile photo of Mahbub Alam"
                />
                <h1 className={styles.name}>
                  Mahbub Alam
                  <span className={styles.cursor}>_</span>
                </h1>
              </div>
            </div>
            <div className="col-lg-4"></div>
          </div>

          <div className={`${styles.content_section} mx-5`}>
            <div className={styles.type_animation}>
              <TypeAnimation
                sequence={roles}
                speed={40}
                repeat={Infinity}
                deletionSpeed={60}
                className={styles.animated_text}
              />
            </div>

            <h5 className={`${styles.location} my-3`}>
              <i className="fa fa-map-marker"></i> Dhaka, Bangladesh
            </h5>

            <p className={`${styles.bio} my-4`}>
              As a Junior Software Engineer at Brotecs Technologies Ltd., I
              specialize in the backend development of web applications and
              cloud-based VoIP calling solutions. I have hands-on experience
              with PHP frameworks like CodeIgniter and Laravel, and have also
              worked with modern JavaScript frameworks such as Node.js and
              React. Additionally, I am familiar with ASTPP and various UI
              frameworks including Tailwind, MaterialUI, and Bootstrap.
              <br />
              <br />
              My background extends into Python, particularly for deep learning
              applications, and I am continually exploring new technologies in
              cloud and DevSecOps to expand my skill set. I am committed to
              ongoing learning, believing it is key to personal and professional
              growth.
            </p>

            <button className={`${styles.cta_button} btn rounded-pill`}>
              <span className={styles.button_content}>
                <i className="fa fa-code"></i> Get in Touch
              </span>
            </button>
          </div>

          <div
            className={`${styles.social_links} d-flex justify-content-center py-4`}
          >
            <a
              href="mailto:mahbubcse96@gmail.com"
              target="_blank"
              title="Email me"
              rel="noopener noreferrer"
              className={styles.social_link}
            >
              <i className="fa fa-google"></i>
            </a>
            <a
              href="https://github.com/mahbub96"
              target="_blank"
              title="GitHub Profile"
              rel="noopener noreferrer"
              className={styles.social_link}
            >
              <i className="fa fa-github"></i>
            </a>
            <a
              href="https://fb.me/MahbubCSE96"
              target="_blank"
              title="Facebook Profile"
              rel="noopener noreferrer"
              className={styles.social_link}
            >
              <i className="fa fa-facebook"></i>
            </a>
            <a
              href="https://www.linkedin.com/in/md-mahbub-alam-6b751821b"
              target="_blank"
              title="LinkedIn Profile"
              rel="noopener noreferrer"
              className={styles.social_link}
            >
              <i className="fa fa-linkedin"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;
