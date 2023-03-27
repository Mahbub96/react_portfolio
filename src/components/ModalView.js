import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import useFirestore from "../hooks/useFirestore";
import { formName } from "../Utils/StaticData";
export default function ModalView(props) {
  const { name, ...events } = props;
  const { data } = useFirestore();

  const { Skills } = data;

  const items = formName[name];

  const [dynamicState, setDynamicState] = useState({});
  const [language, setLanguage] = useState([]);

  const handleSubmit = () => {
    //props.onHide();
  };
  return (
    <Modal
      {...events}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Modal heading
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {items?.map(({ type, name, placeholder }) => (
          <p key={new Date().getSeconds()}>
            {type === "select" ? (
              <select
                key={new Date().getSeconds()}
                className="col-12 mt-3 form-control"
                name="lang"
                onChange={(e) =>
                  setLanguage((prev) => ({
                    ...prev,
                    [name]: e.target.selectedOptions,
                  }))
                }
              >
                {Skills &&
                  Skills.data.map(({ name }) => (
                    <option
                      value={name}
                      name={name}
                      key={new Date().getSeconds()}
                    >
                      {name}
                    </option>
                  ))}
              </select>
            ) : (
              <input
                type={type}
                key={new Date().getSeconds()}
                name={name}
                placeholder={placeholder}
                onChange={(e) =>
                  setDynamicState((prev) => ({
                    ...prev,
                    [name]: e.target.value,
                  }))
                }
              />
            )}
          </p>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
}
