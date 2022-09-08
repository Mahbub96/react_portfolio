import axios from "axios";
import { useState } from "react";
import { useHistory } from "react-router-dom";

function inputForm({from}) {
  let history = useHistory();

  const tableName = ["skills","projects",]

  const formName = [
    [
      {
        type:"name",
        name:"sklName",
        placeholder:"Skills Name"
    },{
      type:"file",
      name:"src",
    }
    ],
    [
      {
      type:"name",
      name:"name",
      placeholder:"Experience Name",
      
    },
    {
      type:"text",
      name:"time",
      placeholder:"Time. Ex : March 2017 - 2019"
      }
    ],
    [
    {
      type:"name",
      name:"insName",
      placeholder:"Institute Name",
    },{
      type:"name",
      name:"insName",
      placeholder:"while - to, Ex: 2019 - Present",
    },
    {
      type:"name",
      name:"degName",
      placeholder:"Bachelor Of Science"
    },
    {
      type:"number",
      name:"cgpa",
      placeholder:"3.75 out of 4.00"
    },
    {
      type:"name",
      name:"dept",
      placeholder:"Department Ex : Computer Science and Engineering",
      
    },
    {
      type:"name",
      name:"thesis",
      placeholder:"Thesis / Project / No"
    }
    ],[
      {
        type:"name",
        name:"projectName",
        placeholder:"Projects Name"
    },
    {
      type:"text",
      name:"desc",
      placeholder:"Short Description"
  },
    {
      type:"file",
      name:"src",
    }
    ]
  ];

  const [data, setData] = useState({
    id: "",
    name: "",
  });

  const { id, name, src } = data;

  const onInputChange = (e) => {
    setFeetback({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:3001/feetback", data);
    history.push("/");
  };

  return (
    <>
      <form className="row g-4">
        if(props.indexOf('file') == -1){
          props.map((data)=>(

          ))
        }
        <div className="col-12">
          <input
            type="text"
            className="form-control"
            placeholder="Experience Name"
            value={name}
            name="name"
            onChange={(e) => onInputChange(e.target.value)}
          />
        </div>

        <div className="col-12">
          <input
            name="src"
            type="file"
            className="form-control"
            value={imgSrc}
            onChange={(e) => onInputChange(e.target.value)}
          />
        </div>
      </form>
    </>
  );
}

export default inputForm;
