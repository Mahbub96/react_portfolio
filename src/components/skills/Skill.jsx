import React from "react";

function Skill({ name, imgSrc, altTxt, classes }) {
  return (
    <>
      <div className={classes}>
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
