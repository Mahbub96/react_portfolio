import useFirestore from "../../hooks/useFirestore";
import ThreeDots from "../ThreeDots";
import Skill from "./Skill.jsx";
import React from "react";
import ModalView from "../ModalView";

function Skills() {
  const { data } = useFirestore();

  const { Skills } = data;
  const [modalShow, setModalShow] = React.useState(false);
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
              <div
                className="col-6 col-lg-2 col-md-4 skill_hover"
                onClick={() => setModalShow(true)}
              >
                {
                  <Skill
                    key={new Date(0)}
                    name="Add New"
                    imgSrc="../assets/img/add.png"
                    altTxt="Add New"
                  ></Skill>
                }
              </div>
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
          <ThreeDots />
        </div>
      )}
      <ModalView
        name={"Skills"}
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    </>
  );
}

export default Skills;
