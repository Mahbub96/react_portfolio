import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useDataContex } from "../../contexts/useAllContext";
function Projects() {
  // console.log("projects");
  let ins = 3;
  const { data } = useFirestore();

  const {
    skillsData,
    projectsData,
    setProjectsData,
    getProjectsData,
    getProjectTag,
  } = useDataContex();

  useEffect(() => {
    // getProjectTag();
    // getProjectsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterProjectsData = (name) => {
    const filteredItems = Object.values(projectsData).filter(
      (values) => values.lang && values.lang.indexOf(name) !== -1
    );

    setProjectsData(filteredItems);
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
              <NavLink
                key="999"
                className="col-4 bg-light col-lg-1 col-md-2 col-sm-3 col-md-2"
                to="#"
                onClick={() => getProjectsData()}
                style={{
                  curser: "pointer",
                  boxShadow: "2px 2px 2px #aaa,-2px -2px 2px #aaa",
                }}
              >
                All
              </NavLink>
              {NavLink &&
                Object.entries(skillsData).map(([key, { id, name }]) => (
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      width: "fitContent",
                      maxWidth: "110px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      curser: "pointer",
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
            {projectsData &&
              Object.entries(projectsData).map(
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

            {projectsData && (
              <NavLink
                to={`inp/${ins}`}
                // className="col-6 col-lg-2 col-md-4 skill_hover"
                data-toggle="modal"
                data-target="#exampleModalCenter"
              >
                <Project
                  key={new Date()}
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
