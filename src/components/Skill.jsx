import React from "react";

function Skill({ name, imgSrc, altTxt }) {
  return (
    <>
      <div className="col-6 col-lg-2 col-md-4">
        <div className="card">
          <div className="card-img-top">
            <img src={imgSrc} alt={altTxt} />
          </div>
          <div className="card-body">
            <h5 className="card-text">{name}</h5>
          </div>
        </div>
      </div>
    </>
  );
}

export default Skill;
