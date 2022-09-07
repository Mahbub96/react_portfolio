import { NavLink } from "react-router-dom";
import { useDataContex } from "./../../contexts/useAllContext.js";
import Skill from "./Skill.jsx";

function Skills() {
  // load all DATABASE src to an array

  const { skillsData, isLogin } = useDataContex();
  console.log(skillsData);

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
            {skillsData.map(({ name, src }, i) => (
              <Skill
                classes="col-6 col-lg-2 col-md-4 skill_hover"
                key={i * 10 + 1}
                name={name}
                imgSrc={src}
                altTxt={name}
              ></Skill>
            ))}
            <NavLink
              to="/inp"
              className="col-6 col-lg-2 col-md-4 skill_hover"
              data-toggle="modal"
              data-target="#exampleModalCenter"
            >
              {isLogin && (
                <Skill
                  key={new Date(0)}
                  name="Add New"
                  imgSrc="../assets/img/add.png"
                  altTxt="Add New"
                ></Skill>
              )}
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
}

export default Skills;
