import { useState } from "react";
import { useDataContex } from "../../contexts/useAllContext";
import useFirestore from "../../hooks/useFirestore";
import ModalView from "../ModalView";
import classes from "./experience.module.css";

function Experience() {
  const [modalShow, setModalShow] = useState(false);
  const { data } = useFirestore();
  const { auth } = useDataContex();

  const { Experiences } = data;

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
            {Experiences &&
              Object.entries(Experiences.data).map(
                ([key, { id, name, time, how }]) => {
                  if (key % 2 === 0)
                    return (
                      <>
                        <div
                          className="col-12 col-md-6"
                          key={id + key + new Date()}
                        ></div>
                        <div className="col-12 col-md-6" key={id + key * 10}>
                          <div className="conts mt-4">
                            <p className={classes.times}>{time}</p>
                            <h4>
                              {name} <br />
                              {how}
                            </h4>
                          </div>
                        </div>
                      </>
                    );
                  else {
                    return (
                      <div key={new Date().getSeconds()}>
                        <div
                          className="col-12 col-md-6"
                          key={id + key + new Date()}
                        >
                          <div className="conts mt-4 right">
                            <p className="times">{time}</p>
                            <h4>
                              {name} <br />
                              {how}
                            </h4>
                          </div>
                        </div>
                        <div
                          className="col-12 col-md-6"
                          key={id + key * 10}
                        ></div>
                      </div>
                    );
                  }
                }
              )}
            {Experiences && auth && (
              <div>
                <div className="col-12 col-md-6" key="1"></div>
                <div className="col-12 col-md-6" key="2">
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
        name={"Experiences"}
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
    </>
  );
}

export default Experience;
