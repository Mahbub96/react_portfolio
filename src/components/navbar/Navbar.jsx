import React from "react";
import { useDataContex } from "../../contexts/useAllContext";
import classes from "./navbar.module.css";

function Header() {
  const { auth } = useDataContex();
  return (
    <div id="home">
      <header className="sticky-top">
        <div
          className={`navbar ${classes.nav} navbar-expand-lg navbar-light px-3 shadow-sm p-2 mb-5 bg-white rounded`}
        >
          <div className="container-fluid bg-light">
            <a className={`navbar-brand`} href="/">
              Mahbub Alam
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className="collapse navbar-collapse bg-light"
              id="navbarSupportedContent"
            >
              <div className="me-auto"></div>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item px-2">
                  <a
                    className={`nav-link active`}
                    aria-current="page"
                    href="#home"
                  >
                    ABOUT
                  </a>
                </li>

                <li className="nav-item px-2">
                  <a className={`nav-link`} aria-current="page" href="#skills">
                    SKILLS
                  </a>
                </li>

                <li className="nav-item px-2">
                  <a
                    className={`nav-link`}
                    aria-current="page"
                    href="#experience"
                  >
                    EXPERIENCES
                  </a>
                </li>

                <li className="nav-item px-2">
                  <a
                    className={`nav-link`}
                    aria-current="page"
                    href="#education"
                  >
                    EDUCATIONS
                  </a>
                </li>

                <li className="nav-item px-2">
                  <a className={`nav-link`} aria-current="page" href="#project">
                    PROJECTS
                  </a>
                </li>

                <li className="nav-item px-2">
                  <a
                    className={`nav-link`}
                    aria-current="page"
                    href="#contract"
                  >
                    CONTRACT
                  </a>
                </li>
              </ul>

              {auth ? (
                <button className="btn btn-light d-flexd-flex" type="submit">
                  Log Out
                </button>
              ) : (
                <button className="btn btn-light d-flexd-flex" type="submit">
                  Login
                </button>
              )}

              <button className="btn btn-light d-flexd-flex" type="submit">
                <i className="fa fa-sun-o"></i>
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header;
