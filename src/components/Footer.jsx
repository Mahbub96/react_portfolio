import React from "react";

function Footer() {
  return (
    <>
      <footer className="container my-5">
        <div className="d-flex justify-content-center my-3">
          <a
            href="https://www.facebook.com/MahbubCSE96/"
            aria-current="page"
            title="Facebook Profile"
          >
            <span className="mx-3">
              <i className="fa fa-facebook"></i>
            </span>
          </a>
          <a
            href="mailto:mahbubcse96@gmail.com"
            title="Directly emial to developer"
          >
            <span className="mx-3">
              <i className="fa fa-google"></i>
            </span>
          </a>
          <a
            href="https://github.com/mahbub96"
            aria-current="page"
            title="Github Profile"
          >
            <span className="mx-3">
              <i className="fa fa-github"></i>
            </span>
          </a>
          <a
            href="https://www.linkedin.com/in/md-mahbub-alam-6b751821b"
            title="Twitter Profile"
          >
            <span className="mx-3">
              <i className="fa fa-linkedin"></i>
            </span>
          </a>
        </div>
        <div className="copyright d-flex justify-content-center">
          &copy; 2022 Mahbub Alam
        </div>
      </footer>
    </>
  );
}

export default Footer;
