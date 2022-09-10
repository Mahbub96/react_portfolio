import { useState } from "react";
import { useDataContex } from "../contexts/useAllContext";

function InputForm({ id }) {
  const { formName } = useDataContex();
  const [data, setData] = useState([]);

  const onInputChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  return (
    <>
      {Object.entries(formName[id]).map(
        ([key, { type, placeholder, name }]) => {
          return (
            <form className="row">
              {type === "select" ? (
                <select
                  className="col-12 mt-3 form-control"
                  id="cars"
                  name="cars"
                >
                  <option value="volvo">Volvo XC90</option>
                  <option value="saab">Saab 95</option>
                  <option value="mercedes">Mercedes SLK</option>
                  <option value="audi">Audi TT</option>
                </select>
              ) : (
                <input
                  className="col-12 mt-3 form-control"
                  type={type}
                  placeholder={placeholder}
                  onChange={onInputChange}
                  name={name}
                />
              )}
            </form>
          );
        }
      )}
    </>
  );
}

export default InputForm;
