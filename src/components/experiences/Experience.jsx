import { useState } from "react";
import uuid from "react-uuid";
import { useDataContex } from "../../contexts/useAllContext";
import useFirestore from "../../hooks/useFirestore";
import ModalView from "../ModalView";
import ThreeDots from "../ThreeDots";
import classes from "./experience.module.css";

function Experience() {
  const [modalShow, setModalShow] = useState(false);
  const { auth } = useDataContex();

  const { Experiences } = useFirestore().data;

  return (
    <>
      <div className="container mt-5" id="experience">
        <div className="experience">
          <div className="header">
            <h2>
              <b>EXPERIENCES</b>
            </h2>
            <p>3 years 6th months</p>
          </div>
          <div className="content bg-light py-5 row g-0">
            {Experiences?.data ? (
              Object.entries(Experiences?.data).map(
                ([key, { name, time, how }]) => {
                  if (key % 2 === 0)
                    return (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                        key={uuid()}
                      >
                        <div className="col-12 col-md-6"></div>
                        <div className="col-12 col-md-6">
                          <div className="conts mt-4">
                            <p className={classes.times}>{time}</p>
                            <h4>
                              {name} <br />
                              {how}
                            </h4>
                          </div>
                        </div>
                      </div>
                    );
                  else {
                    return (
                      <div key={uuid()}>
                        <div className="col-12 col-md-6">
                          <div className="conts mt-4 right">
                            <p className="times">{time}</p>
                            <h4>
                              {name} <br />
                              {how}
                            </h4>
                          </div>
                        </div>
                        <div className="col-12 col-md-6"></div>
                      </div>
                    );
                  }
                }
              )
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

            {Experiences && auth && (
              <div>
                <div className="col-12 col-md-6"></div>
                <div className="col-12 col-md-6">
                  <div className="conts mt-4">
                    <h4
                      onClick={() => setModalShow(true)}
                      style={{
                        color: "blue",
                        cursor: "pointer",
                        display: "inline-block",
                      }}
                    >
                      Add New Experience <br />
                    </h4>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ModalView
        key={uuid()}
        name={"Experiences"}
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    </>
  );
}

export default Experience;
