import React from "react";
import uuid from "react-uuid";
import { useDataContex } from "../../contexts/useAllContext";
import useFirestore from "../../hooks/useFirestore";
import ModalView from "../ModalView";
import ThreeDots from "../ThreeDots";
import Skill from "./Skill.jsx";

function Skills() {
  const { data } = useFirestore();
  const { auth } = useDataContex();

  const { Skills } = data;
  const [modalShow, setModalShow] = React.useState(false);
  return (
    <>
      {Skills ? (
        <div
          className="container mt-5"
          id="skills"
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
          key={uuid()}
        >
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
                      key={uuid()}
                      name={name}
                      imgSrc={src}
                      altTxt={name}
                    ></Skill>
                  );
                })}

              {auth && (
                <div
                  className="col-6 col-lg-2 col-md-4 skill_hover"
                  onClick={() => setModalShow(true)}
                  style={{
                    color: "blue",
                    cursor: "pointer",
                    display: "inline-block",
                  }}
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
              )}
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
