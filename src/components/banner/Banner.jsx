import React from "react";
import profile from "../../assets/img/profile.png";
import styles from "./banner.module.css";

function Banner() {
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
                  src={profile}
                  alt="profile pic"
                />
                <h2>Mahbub Alam</h2>
              </div>
            </div>
            <div className="col-4"></div>
          </div>
          <div className="desc mx-5">
            <h4 className="my-2">Student</h4>
            <h5 className="my-2">Dhaka,Bangladesh</h5>
            <p className="my-3">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Maxime
              error corrupti necessitatibus eos assumenda rerum sint, voluptatem
              officia! Animi cumque ut minima non in libero quaerat voluptatem.
              Voluptates corporis perspiciatis natus quo nobis architecto harum
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
              href="https://fb.me/mahabub.sobuz"
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
                <i className={`fa fa-twitter mx-3 mx-md-5 ${styles.social_icon}`}></i>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Banner;
