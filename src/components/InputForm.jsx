import { useDataContex } from "../contexts/useAllContext";

function InputForm({ id, data, setData }) {
  const { formName } = useDataContex();

  const onInputChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  console.log(data, setData);

  return (
    <>
      {Object.entries(formName[id]).map(
        ([key, { type, placeholder, name }]) => {
          return (
            <form className="row">
              {type === "select" ? (
                <select
                  key={key}
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
                  key={key}
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
