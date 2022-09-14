import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useDataContex } from "../../contexts/useAllContext";
import styles from "./education.module.css";

function Educations() {
  // console.log("projects");
  let ins = 2;

  const { getEducationsData, educationsData } = useDataContex();

  useEffect(() => {
    getEducationsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <div className="container mt-5" id="education">
        <div className="education">
          <div className="header">
            <h2>
              <b>EDUCATIONS</b>
            </h2>
          </div>
          <div className="content bg-light py-5 mt-4 row g-0">
            {educationsData &&
              Object.entries(educationsData).map(
                ([
                  key,
                  { id, name, time, degName, Department, cgpa, group, Thesis },
                ]) => {
                  if (key % 2 === 0)
                    return (
                      <>
                        <div className="col-12 col-md-6"></div>
                        <div className="col-12 col-md-6">
                          <div className="conts mt-4">
                            <p className="times">{time}</p>
                            <h5 className={styles.title}>{name}</h5>
                            <h4 className={styles.degree}>{degName}</h4>
                            <p className={styles.ext}>
                              <b>CGPA</b>: {cgpa}
                            </p>
                            <p className={styles.ext}>
                              <b>Department</b>:{Department}
                            </p>
                            <p className={styles.ext}>
                              <b>Group</b>:{group}
                            </p>
                            <p className={styles.ext}>
                              <b>Thesis</b>:{Thesis}
                            </p>
                          </div>
                        </div>
                      </>
                    );
                  else {
                    return (
                      <>
                        <div className="col-12 col-md-6">
                          <div className="conts mt-4 right">
                            <p className="times">{time}</p>
                            <h5 className={styles.title}>{name}</h5>
                            <h4 className={styles.degree}>{degName}</h4>
                            <p className={styles.ext}>
                              <b>CGPA</b>:{cgpa}
                            </p>
                            <p className={styles.ext}>
                              <b>Department</b>:{Department}
                            </p>
                            <p className={styles.ext}>
                              <b>Group</b>:{group}
                            </p>

                            <p className={styles.ext}>
                              <b>Thesis</b>:{Thesis}
                            </p>
                          </div>
                        </div>
                        <div className="col-12 col-md-6"></div>
                      </>
                    );
                  }
                }
              )}
            {educationsData && (
              <NavLink
                key="3"
                to={`inp/${ins}`}
                // className="col-6 col-lg-2 col-md-4 skill_hover"
                data-toggle="modal"
                data-target="#exampleModalCenter"
              >
                <div className="col-12 col-md-6" key="1"></div>
                <div className="col-12 col-md-6" key="2">
                  <div className="conts mt-4">
                    <h4>
                      Add New Education Information <br />
                    </h4>
                  </div>
                </div>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Educations;
