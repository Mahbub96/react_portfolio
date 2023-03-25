/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useDataContex } from "../../contexts/useAllContext";
import useFirestore from "../../hooks/useFirestore";
import ThreeDots from "../ThreeDots";
import Skill from "./Skill.jsx";

function Skills() {
  const { data, setDocuments } = useFirestore();

  const { Skills } = data;

  useEffect(() => {
    //	getSkillsData();
  }, []);
  console.log(Skills);
  return (
    <>
      {Skills ? (
        <div className="container mt-5" id="skills">
          <div className="skills">
            <div className="header">
              <h2>
                <b>Skills </b>
              </h2>
            </div>

            <div className="mt-2 cards row justify-content-center g-4">
              {Skills?.data &&
                Object.entries(Skills?.data).map(([, { id, name, src }]) => {
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
                to={`inp/0`}
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
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {" "}
          <ThreeDots />
        </div>
      )}
    </>
  );
}

export default Skills;
