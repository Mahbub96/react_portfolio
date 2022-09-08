import { useDataContex } from "./../../contexts/useAllContext.js";

import Project from "./Project";

function Projects() {
  const {
    projectsData,
    setProjectsData,
    projectTitle,
    setProjectTitle,
    isLogin,
    setIsLogin,
  } = useDataContex();

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
              {projectTitle.map((value, i) => (
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
            {projectsData.map(({ name, src }, i) => (
              <Project
                to="/"
                key={i * 2}
                title={name}
                imgSrc={src}
                altTxt={name}
                desc="Some quick example text to build on the card title and make
                up the bulk of the card's content."
              />
            ))}
            {isLogin && (
              <Project
                to="inp"
                key={new Date() * 2}
                title="Add New Projects"
                imgSrc="../assets/img/add.png"
                altTxt="Add New Projects"
                desc="Some quick example text to build on the card title and make
              up the bulk of the card's content."
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Projects;
