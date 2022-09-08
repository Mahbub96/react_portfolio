import axios from "axios";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import InputForm from "./InputForm";

function ReqForm() {
  const ins = 1;
  const tableName = ["skills", "experiences", "educations", "projects"];

  const history = useHistory();

  const [data, setData] = useState({
    id: "",
    name: "",
    type: "",
    placeholder: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`http://localhost:3001/${tableName[ins]}`, data);
    history.push("/");
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
              <InputForm data={data} setData={setData} ins={ins} />
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
                onClick={handleSubmit}
              >
                Save changes
              </button>
              {/* {needRedirect && <Navigate replace to="/" />} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReqForm;
