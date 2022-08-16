import React from "react";

export default function contact() {
  return (
    <>
      <div class="container mt-5 contract" id="contract">
        <div class="content bg-light row py-5 mx-1">
          <div class="col-md-6 d-flex justify-content-center">
            <div class="row mt-2 mt-md-1">
              <div class="col px-5">
                <h2 class="bg-light">get in touch</h2>
                <p>fill in the form to start a conversation</p>
                <p>Dhaka,Bangladesh</p>
                <p>mahbubcse96@gmail.com</p>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <form>
              <div class="form-group">
                <input
                  type="text"
                  class="form-control my-2"
                  id="exampleInputName"
                  aria-describedby="emailHelp"
                  placeholder="Your Name"
                />
                <input
                  type="email"
                  class="form-control my-2"
                  id="exampleInputEmail1"
                  aria-describedby="emailHelp"
                  placeholder="Your email"
                />
                <input
                  type="text"
                  class="form-control"
                  id="exampleInputsubject"
                  aria-describedby="emailHelp"
                  placeholder="Subject"
                />
                <small id="emailHelp" class="form-text text-muted">
                  We'll never share your email with anyone else.
                </small>
              </div>
              <textarea
                class="form-control my-3"
                id="exampleFormControlTextarea1"
                rows="3"
                placeholder="Message"
              ></textarea>
              <button type="submit" class="btn btn-primary">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
