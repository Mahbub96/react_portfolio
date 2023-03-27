import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { formName } from "../Utils/StaticData";
export default function ModalView(props) {
  const { name, ...events } = props;
  console.log(name);
  const data = formName[name];
  console.log(data);
  const [dynamicState, setDynamicState] = useState({});

  const handleSubmit = () => {
    console.log(dynamicState);
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
        {data?.map(({ type, name, placeholder }) => (
          <p>
            <input
              type={type}
              name={name}
              placeholder={placeholder}
              onChange={(e) =>
                setDynamicState((prev) => ({ ...prev, [name]: e.target.value }))
              }
            />
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
