import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import useFirestore from "../../hooks/useFirestore";
import ModalView from "../ModalView";
import styles from "./education.module.css";

function Educations() {
  let ins = 2;
  const { data, setDocuments } = useFirestore();
  const { Education } = data;
  const [modalShow, setModalShow] = useState(false);
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
            {Education &&
              Object.entries(Education.data).map(
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
            {Education && (
              <div
                // className="col-6 col-lg-2 col-md-4 skill_hover"
                onClick={() => setModalShow(true)}
              >
                <div className="col-12 col-md-6" key="1"></div>
                <div className="col-12 col-md-6" key="2">
                  <div className="conts mt-4">
                    <h4>
                      Add New Education Information <br />
                    </h4>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ModalView
        name={"Education"}
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    </>
  );
}

export default Educations;
