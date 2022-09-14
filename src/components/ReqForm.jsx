import axios from "axios";
import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import InputForm from "./InputForm";

function ReqForm() {
  const tableName = ["skills", "experiences", "educations", "projects"];

  const { id } = useParams();

  const [data, setData] = useState({});

  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post(`http://localhost:3001/${tableName[id]}`, data);
    history.push("/");
  };

  return (
    <>
      <div
        className="modal fade"
        id="exampleModalCenter"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLongTitle">
                Please Enter Your Data
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true" data-dismiss="modal">
                  &times;
                </span>
              </button>
            </div>
            <div className="modal-body">
              <InputForm id={id} data={data} setData={setData} />
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
                className="btn btn-primary"
                data-dismiss="modal"
                onClick={handleSubmit}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ReqForm;
