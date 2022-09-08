import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useDataContex } from "../contexts/useAllContext";

function ReqForm() {
  const [needRedirect, setNeedRedirect] = useState(false);

  const { skillsData, setSkillsData } = useDataContex();
  const [name, setName] = useState("");
  const [imgSrc, setImgSrc] = useState("");

  const handleClick = () => {
    setNeedRedirect(true);
    setSkillsData([...skillsData, { name, imgSrc }]);
  };

  return (
    <div>
      {/* <!-- Button trigger modal --> */}

      <div
        className="modal fade"
        id="exampleModalCenter"
        // tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLongTitle">
                Modal title
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Clo se"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form className="row g-4">
                <div className="col-12">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Experience Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <input
                    type="file"
                    className="form-control"
                    value={imgSrc}
                    onChange={(e) => setImgSrc(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
              >
                Close
              </button>

              <button
                type="button"
                data-dismiss="modal"
                className="btn btn-primary"
                onClick={handleClick}
              >
                Save changes
              </button>
              {needRedirect && <Navigate replace to="/" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReqForm;
