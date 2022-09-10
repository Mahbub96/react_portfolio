import axios from "axios";
import { useEffect, useState } from "react";

import React from "react";
import { NavLink } from "react-router-dom";
import Project from "./Project";

function Projects() {
  let ins = 3;

  const [projectsTitle, setProjectsTitle] = useState([]);
  // load all DATABASE src to an array
  const [projectsData, setProjectsData] = useState({});

  const [newData, setNewData] = useState({
    id: "",
    name: "",
    src: "",
    lang: [],
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const res = await axios.get("http://localhost:3001/projects");
    setProjectsData(res.data);

    // adding tab value of projects
    const t = [];
    for (let i = 0; i < res.data.length; i++) {
      const element = await res.data[i].lang;
      for (let j = 0; j < element.length; j++) {
        t.push(element[j]);
      }
    }
    console.loog(t);
    setProjectsTitle([...new Set(t)]);
    // axios.post("http://localhost:3001/TagName", projectsTitle);
  };

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
              {projectsTitle.map((value, i) => (
                <a
                  key={i * 12 + 100}
                  className="col-4 bg-light col-lg-1 col-md-2 col-sm-3 col-md-2"
                  href="#home"
                >
                  {value}
                </a>
              ))}
            </div>
          </div>
          <div className="cards row d-flex justify-content-center my-1 g-3">
            {Object.entries(projectsData).map(
              ([key, { id, name, src, desc, lang }]) => {
                return (
                  <Project
                    key={id}
                    title={name}
                    imgSrc={src}
                    altTxt={name}
                    desc={desc}
                  />
                );
              }
            )}

            {1 && (
              <NavLink
                to={`inp/${ins}/${newData}`}
                // className="col-6 col-lg-2 col-md-4 skill_hover"
                data-toggle="modal"
                data-target="#exampleModalCenter"
              >
                <Project
                  key={new Date() * 2}
                  title="Add New Projects"
                  imgSrc="../assets/img/add.png"
                  altTxt="Add New Projects"
                  desc="Some quick example text to build on the card title and make
              up the bulk of the card's content."
                />
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Projects;
