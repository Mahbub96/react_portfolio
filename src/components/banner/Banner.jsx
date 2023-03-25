import React from "react";
import styles from "./banner.module.css";
import { TypeAnimation } from "react-type-animation";

function Banner() {
  const txt = [
    "Web Application Developer",
    1000,
    "Mobile Application Developer",
    1000,
    "Machine Learning",
    1000,
    "Data Science",
    1000,
    "Student",
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
              Dynamic, detail-oriented Software Engineer with over 4 years of
              experience in Self Learning. Skilled in a variety of programming
              languages, including JavaScript,React Js, and Node.js,React Native
              and Expo CLI. Proficient in agile development methodologies and
              experienced in the full software development lifecycle. Hold a
              Bachelor's degree in Computer Science from Stamford University
              Bangladesh. Maintain several open source projects.
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
            <a href="#home" title="Twitter Profile" rel="noopener noreferrer">
              <span>
                <i
                  className={`fa fa-twitter mx-3 mx-md-5 ${styles.social_icon}`}
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
