/* eslint-disable react-hooks/exhaustive-deps */

import axios from "axios";
import React, { useEffect, useState } from "react";

import { NavLink } from "react-router-dom";
import Skill from "./Skill.jsx";

function Skills() {
  let ins = 0;
  // load all DATABASE src to an array
  const [skillsData, setSkillsData] = useState({
    id: "",
    name: "",
    type: "",
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    const res = await axios.get("http://localhost:3001/skills");
    setSkillsData(res.data);
  };

  return (
    <>
      <div className="container mt-5" id="skills">
        <div className="skills">
          <div className="header">
            <h2>
              <b>Skills </b>
            </h2>
          </div>

          <div className="mt-2 cards row justify-content-center g-4">
            {Object.entries(skillsData).map(([key, { id, name, src }]) => {
              return (
                <Skill
                  classes="col-6 col-lg-2 col-md-4 skill_hover"
                  key={id}
                  name={name}
                  imgSrc={src}
                  altTxt={name}
                ></Skill>
              );
            })}
            <NavLink
              to={`inp/${ins}`}
              className="col-6 col-lg-2 col-md-4 skill_hover"
              data-toggle="modal"
              data-target="#exampleModalCenter"
            >
              {
                <Skill
                  key={new Date(0)}
                  name="Add New"
                  imgSrc="../assets/img/add.png"
                  altTxt="Add New"
                ></Skill>
              }
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
}

export default Skills;
