import React from "react";

function Educations() {
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
            <div className="col-12 col-md-6"></div>
            <div className="col-12 col-md-6">
              <div className="conts mt-4">
                <p className="times">2019 - Present</p>
                <h5>Stamford University Bangladesh</h5>
                <h4>Bachelor of Science</h4>
                <p>
                  <b>CGPA</b>:3.75 out of 4.00
                </p>
                <p>
                  <b>Department</b>:Computer Science and Engineering
                </p>
                <p>
                  <b>Thesis</b>:Hmm thinking...
                </p>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="conts mt-4 right">
                <p className="times">2014 - 2016</p>
                <h5>BAF SHAHEEN COLLEGE,JESSORE</h5>
                <h4>Higher Secondary Certificate (HSC)</h4>
                <p>
                  <b>CGPA</b>:4.00 out of 5.00
                </p>
                <p>
                  <b>Group</b>:Science
                </p>
              </div>
            </div>
            <div className="col-12 col-md-6"></div>

            <div className="col-12 col-md-6"></div>
            <div className="col-12 col-md-6">
              <div className="conts mt-4">
                <p className="times">2009 - 2014</p>
                <h5>Shyamkur High School</h5>
                <h4>Secondary School Certificate (SSC)</h4>
                <p>
                  <b>CGPA</b>:4.44 out of 5.00
                </p>
                <p>
                  <b>Group</b>:Science
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Educations;
