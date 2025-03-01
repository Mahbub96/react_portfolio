import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import uuid from "react-uuid";
import { formName } from "../Utils/StaticData";
import useFirestore from "../hooks/useFirestore";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Modal.css";

export default function ModalView(props) {
  const {
    name,
    title = "Add New Item",
    show,
    onHide,
    initialData = null,
    onSuccess = () => {},
    ...events
  } = props;

  const firestore = useFirestore();
  const skills = firestore.getCollection("Skills") || [];
  const items = formName[name];
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      // Don't set file input values
      const filteredData = Object.fromEntries(
        Object.entries(initialData).filter(([key, value]) => {
          const item = items.find((i) => i.name === key);
          return item?.type !== "file";
        })
      );
      setFormData(filteredData);
    } else {
      setFormData({});
    }
  }, [initialData, show, items]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      // Handle file input
      const file = files[0];
      if (file) {
        // Here you might want to handle file upload
        // For now, just store the file object
        setFormData((prev) => ({
          ...prev,
          [name]: file,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Handle file uploads if needed
      const dataToSubmit = { ...formData };
      for (const [key, value] of Object.entries(dataToSubmit)) {
        if (value instanceof File) {
          // Here you would typically:
          // 1. Upload the file to storage
          // 2. Get the URL
          // 3. Replace the File object with the URL
          // For now, we'll just use a placeholder
          dataToSubmit[key] = URL.createObjectURL(value);
        }
      }

      if (initialData?.id) {
        await firestore.updateDocument(name, initialData.id, dataToSubmit);
      } else {
        await firestore.addDocument(name, dataToSubmit);
      }

      setFormData({});
      onSuccess();
      onHide();
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      backdrop="static"
      className="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {initialData ? "Edit " : "Add "}
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="p-2" onSubmit={(e) => e.preventDefault()}>
          {items?.map((item, index) => (
            <Form.Group className="mb-3" key={`${item.name}-${index}`}>
              <Form.Label className="fw-bold">{item.name}</Form.Label>
              {item.type === "select" ? (
                <Form.Select
                  name={item.name}
                  className="form-select-lg"
                  value={formData[item.name] || ""}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select {item.name}</option>
                  {skills.map((skill) => (
                    <option key={`skill-${skill.id}`} value={skill.name}>
                      {skill.name}
                    </option>
                  ))}
                </Form.Select>
              ) : item.type === "file" ? (
                <Form.Control
                  type="file"
                  name={item.name}
                  onChange={handleInputChange}
                  className="form-control-lg"
                  accept="image/*"
                  required={!initialData} // Only required for new items
                />
              ) : (
                <Form.Control
                  type={item.type}
                  name={item.name}
                  placeholder={item.placeholder}
                  className="form-control-lg"
                  value={formData[item.name] || ""}
                  onChange={handleInputChange}
                  required
                />
              )}
            </Form.Group>
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          size="lg"
          onClick={onHide}
          disabled={isSubmitting}
        >
          Close
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : initialData ? "Update" : "Submit"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
