import React from "react";

function Project({ imgSrc, title, desc, altTxt, lang }) {
  return (
    <div
      lang={lang}
      className="pcard col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center"
    >
      <div className="card text-center" style={{ width: "15rem" }}>
        <img
          style={{ height: "7rem" }}
          src={imgSrc}
          className="card-img-top"
          alt={altTxt}
        />
        <div className="card-body">
          <h5
            className="card-title"
            style={{
              fonSize: "14px",
            }}
          >
            {title}
          </h5>
          <p className="card-text" style={{ fontSize: "10px" }}>
            {desc}
          </p>
          <a href="#home" className="btn btn-light bg-light">
            Go somewhere
          </a>
        </div>
      </div>
    </div>
  );
}

export default Project;
