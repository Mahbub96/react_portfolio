import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useDataContex } from "../../contexts/useAllContext";
import useFirestore from "../../hooks/useFirestore";
import classes from "./experience.module.css";
function Experience() {
  // console.log("projects");
  let ins = 1;

  const { data } = useFirestore();

  const { Experiences } = data;

  useEffect(() => {
    // getExperienceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                      <>
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
                      </>
                    );
                  }
                }
              )}
            {Experiences && (
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
                      Add New Experience <br />
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

export default Experience;
