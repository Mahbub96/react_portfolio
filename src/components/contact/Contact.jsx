import axios from "axios";
import { useState } from "react";
export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [data, setData] = useState([
    {
      name,
      email,
      subject,
      message,
    },
  ]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    setData({ name, email, subject, message });
    await axios.post("http://localhost:3001/feetback", data);
  };

  return (
    <>
      <div className="container mt-5 contract" id="contract">
        <div className="content bg-light row py-5 mx-1">
          <div className="col-md-6 d-flex justify-content-center">
            <div className="row mt-2 mt-md-1">
              <div className="col px-5">
                <h2 className="bg-light">get in touch</h2>
                <p>fill in the form to start a conversation</p>
                <p>Dhaka,Bangladesh</p>
                <p>mahbubcse96@gmail.com</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <form>
              <div className="form-group">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  className="form-control my-2"
                  id="exampleInputName"
                  aria-describedby="emailHelp"
                  placeholder="Your Name"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="form-control my-2"
                  id="exampleInputEmail1"
                  aria-describedby="emailHelp"
                  placeholder="Your email"
                />
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  type="text"
                  className="form-control"
                  id="exampleInputsubject"
                  aria-describedby="emailHelp"
                  placeholder="Subject"
                />
                <small id="emailHelp" className="form-text text-muted">
                  We'll never share your email with anyone else.
                </small>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="form-control my-3"
                id="exampleFormControlTextarea1"
                rows="3"
                placeholder="Message"
              ></textarea>
              <button
                type="submit"
                onClick={handleSubmit}
                className="btn btn-primary"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
