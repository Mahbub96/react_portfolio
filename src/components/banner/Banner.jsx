import React from "react";
import { TypeAnimation } from "react-type-animation";
import styles from "./banner.module.css";

function Banner() {
  const txt = [
    "Full Stack Web Application Developer",
    1000,
    "Mobile Application Developer",
    1000,
    "Machine Learning",
    1000,
    "Data Science",
    1000,
    "Cloud & DevSecOps",
    1000,
  ];
  return (
    <div>
      <div className="container" style={{ marginTop: "110px" }}>
        <div className="rounded cont pb-4">
          <div className="row">
            <div className="col-4"></div>
            <div className="col-4 d-flex justify-content-center">
              <div className={styles.my_card}>
                <img
                  className={`rounded-circle ${styles.profile}`}
                  src="./assets/img/profile.png"
                  alt="profile pic"
                />
                <h2>Mahbub Alam</h2>
              </div>
            </div>
            <div className="col-4"></div>
          </div>
          <div className="desc mx-5">
            <h4 className="my-2">
              <TypeAnimation
                sequence={txt}
                speed={20}
                repeat={Infinity}
                deletionSpeed={90}
              />
            </h4>
            <h5 className="my-2">Dhaka,Bangladesh</h5>
            <p className="my-3">
              As a Junior Software Engineer at Brotecs Technologies Ltd., I
              specialize in the backend development of web applications and
              cloud-based VoIP calling solutions. I have hands-on experience
              with PHP frameworks like CodeIgniter and Laravel, and have also
              worked with modern JavaScript frameworks such as Node.js and
              React. Additionally, I am familiar with ASTPP and various UI
              frameworks including Tailwind, MaterialUI, and Bootstrap.
              <br></br> My background extends into Python, particularly for deep
              learning applications, and I am continually exploring new
              technologies in cloud and DevSecOps to expand my skill set. I am
              committed to ongoing learning, believing it is key to personal and
              professional growth.
            </p>
            <button className="btn btn-primary btn-sm rounded-pill">
              Get in Touch
            </button>
          </div>
          <div className="d-flex justify-content-center py-3">
            <a
              href="mailto:mahbubcse96@gmail.com"
              target="_blank"
              title="Directly emial to developer"
              rel="noopener noreferrer"
            >
              <span>
                <i
                  className={`fa fa-google mx-3 mx-md-5 ${styles.social_icon}`}
                ></i>
              </span>
            </a>
            <a
              href="https://github.com/mahbub96"
              target="_blank"
              title="Github Profile"
              rel="noopener noreferrer"
            >
              <span>
                <i
                  className={`fa fa-github mx-3 mx-md-5 ${styles.social_icon}`}
                ></i>
              </span>
            </a>
            <a
              href="https://fb.me/MahbubCSE96"
              target="_blank"
              title="Facebook Profile"
              rel="noopener noreferrer"
            >
              <span>
                <i
                  className={`fa fa-facebook mx-3 mx-md-5 ${styles.social_icon}`}
                ></i>
              </span>
            </a>
            <a
              href="https://www.linkedin.com/in/md-mahbub-alam-6b751821b"
              title="linkedin Profile"
              rel="noopener noreferrer"
            >
              <span>
                <i
                  className={`fa fa-linkedin mx-3 mx-md-5 ${styles.social_icon}`}
                ></i>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;
