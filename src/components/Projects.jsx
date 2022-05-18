import React from "react";
import IMAGES from "./Images/SkillsImages";
import Project from "./Project";

function Projects() {
  // load all images src to an array
  let imgs = [];
  for (let val in IMAGES[1]) {
    imgs.push(val);
  }
  return (
    <>
      <div className="container mt-5" id="project">
        <div className="project">
          <div className="header">
            <h2>
              <b>projects</b>
            </h2>
          </div>
          <div className="menus">
            <div className="row d-flex justify-content-center g-2 my-1">
              <a
                className="col-4 bg-light col-lg-1 col-md-2 col-sm-3 col-md-2"
                href="#home"
              >
                All
              </a>
              <a
                className="col-4 bg-light col-lg-1 col-md-2 col-sm-3"
                href="#home"
              >
                React Js
              </a>
              <a
                className="col-4 bg-light col-lg-1 col-md-2 col-sm-3"
                href="#home"
              >
                Node Js
              </a>
              <a
                className="col-4 bg-light col-lg-1 col-md-2 col-sm-3"
                href="#home"
              >
                JavaScript
              </a>
              <a
                className="col-4 bg-light col-lg-1 col-md-2 col-sm-3"
                href="#home"
              >
                PHP
              </a>
              <a
                className="col-4 bg-light col-lg-1 col-md-2 col-sm-3"
                href="#home"
              >
                Laravel
              </a>
              <a
                className="col-4 bg-light col-lg-1 col-md-2 col-sm-3"
                href="#home"
              >
                Bootstrap
              </a>
            </div>
          </div>
          <div className="cards row d-flex justify-content-center my-1 g-3">
            {imgs.map((srcs, i) => (
              <Project
                key={i}
                title={srcs.replace("_", " ").replace("_", " ")}
                imgSrc={IMAGES[1][srcs]}
                altTxt={srcs.replace("_", " ")}
                desc="Some quick example text to build on the card title and make
                up the bulk of the card's content."
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Projects;
