import React from "react";
import { useDataContex } from "../../contexts/useAllContext";
import useFirestore from "../../hooks/useFirestore";
import ModalView from "../ModalView";
import ThreeDots from "../ThreeDots";
import Skill from "./Skill.jsx";

function Skills() {
  const { data, setDocuments } = useFirestore();
  const { auth } = useDataContex();

  setDocuments("Skills", {
    data: [
      {
        id: 100,
        name: "PHP",
        src: "/assets/img/php.png",
      },
      {
        id: 118,
        name: "JavaScript",
        src: "/assets/img/javaScript.png",
      },
      {
        id: 101,
        name: "React JS",
        src: "/assets/img/javaScript.png",
      },
      {
        id: 116,
        name: "React Native",
        src: "/assets/img/react-native.png",
      },
      {
        id: 102,
        name: "Vue JS",
        src: "/assets/img/vue`.png",
      },
      {
        id: 103,
        name: "jQuery",
        src: "/assets/img/jquery.png",
      },
      {
        id: 104,
        name: "Node Js",
        src: "/assets/img/nodejs.png",
      },
      {
        id: 105,
        name: "MY SQL",
        src: "/assets/img/mysql.png",
      },
      {
        id: 106,
        name: "git",
        src: "/assets/img/git.png",
      },
      {
        id: 107,
        name: "github",
        src: "/assets/img/github.png",
      },
      {
        id: 108,
        name: "CSS",
        src: "/assets/img/css.png",
      },
      {
        id: 109,
        name: "Bootstarp",
        src: "/assets/img/bootstarp.png",
      },
      {
        id: 110,
        name: "tailwind",
        src: "/assets/img/tailwind.png",
      },
      {
        id: 111,
        name: "python",
        src: "/assets/img/python.png",
      },
      {
        id: 112,
        name: "C Plus Plus",
        src: "/assets/img/c++.png",
      },
      {
        id: 113,
        name: "C",
        src: "/assets/img/c.png",
      },
      {
        id: 114,
        name: "Assembly Language",
        src: "/assets/img/asm.png",
      },

      {
        id: 115,
        name: "SQlite3",
        src: "/assets/img/sqlite3.png",
      },

      {
        id: 117,
        name: "Java",
        src: "/assets/img/java.png",
      },
      {
        id: 118,
        name: "Swings",
        src: "/assets/img/swings.png",
      },
    ],
  });

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
