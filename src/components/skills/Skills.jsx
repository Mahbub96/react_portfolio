/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useDataContex } from "../../contexts/useAllContext";
import Skill from "./Skill.jsx";

function Skills() {
  const { states, getSkillsData } = useDataContex();

  let ins = 0;
  console.log(states[ins]);
  const skillsData = states[ins];
  // const setSkillsData = states[ins + 1];
  // const getSkillsData = states[ins + 1];

  useEffect(() => {
    getSkillsData();
  }, []);

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
            {skillsData &&
              Object.entries(skillsData).map(([key, { id, name, src }]) => {
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
