import React, { useEffect, useState } from "react";
import { useDataContex } from "../../contexts/useAllContext";
import useFirestore from "../../hooks/useFirestore";
import ModalView from "../ModalView";
import Project from "./Project";

function Projects() {
  const [modalShow, setModalShow] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const { auth } = useDataContex();
  const { data } = useFirestore();

  const { projectsData, Skills } = data;

  const finalData = projectsData && [...projectsData.data];

  useEffect(() => {
    setFilteredItems(projectsData?.data);
  }, [projectsData]);

  const filterProjectsData = (name) => {
    if (name === "All") setFilteredItems(finalData);
    else setFilteredItems(finalData.filter((item) => item.lang.includes(name)));
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
              <div
                key="999"
                onClick={() => filterProjectsData("All")}
                className="col-4 bg-light col-lg-1 col-md-2 col-sm-3 col-md-2"
                to="#"
                style={{
                  curser: "pointer",
                  boxShadow: "2px 2px 2px #aaa,-2px -2px 2px #aaa",
                }}
              >
                All
              </div>
              {Skills &&
                Object.entries(Skills.data).map(([, { id, name }]) => (
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      width: "fitContent",
                      maxWidth: "110px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: "pointer",
                      boxShadow: "2px 2px 2px #aaa,-2px -2px 2px #aaa",
                    }}
                    onClick={() => filterProjectsData(name)}
                    to="#"
                    key={id}
                    className="col-4 bg-light col-lg-1 col-md-2 col-sm-3 col-md-2"
                  >
                    <span>{name}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="cards row d-flex justify-content-center my-1 g-3">
            {filteredItems &&
              Object.entries(filteredItems).map(
                ([key, { id, name, src, desc, lang }]) => {
                  return (
                    <Project
                      key={id}
                      title={name}
                      imgSrc={src}
                      altTxt={name}
                      desc={desc}
                      lang={lang}
                    />
                  );
                }
              )}

            {projectsData && auth && (
              <div
                onClick={() => setModalShow(true)}
                style={{
                  color: "blue",
                  cursor: "pointer",
                  display: "inline-block",
                }}
              >
                <Project
                  key={new Date()}
                  title="Add New Projects"
                  imgSrc="../assets/img/add.png"
                  altTxt="Add New Projects"
                  desc="Some quick example text to build on the card title and make
              up the bulk of the card's content."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <ModalView
        name={"projectsData"}
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    </>
  );
}

export default Projects;
