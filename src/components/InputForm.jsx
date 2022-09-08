function inputForm({ data, setData, ins }) {
  const formName = [
    [
      {
        type: "name",
        name: "sklName",
        placeholder: "Skills Name",
      },
      {
        type: "file",
        name: "src",
      },
    ],
    [
      {
        type: "name",
        name: "name",
        placeholder: "Experience Name",
      },
      {
        type: "text",
        name: "time",
        placeholder: "Time. Ex : March 2017 - 2019",
      },
      {
        type: "text",
        name: "how",
        placeholder: "How you Learned? Ex : Self Learning",
      },
    ],
    [
      {
        type: "name",
        name: "insName",
        placeholder: "Institute Name",
      },
      {
        type: "name",
        name: "insName",
        placeholder: "while - to, Ex: 2019 - Present",
      },
      {
        type: "name",
        name: "degName",
        placeholder: "Bachelor Of Science",
      },
      {
        type: "number",
        name: "cgpa",
        placeholder: "3.75 out of 4.00",
      },
      {
        type: "name",
        name: "dept",
        placeholder: "Department Ex : Computer Science and Engineering",
      },
      {
        type: "name",
        name: "thesis",
        placeholder: "Thesis / Project / No",
      },
    ],
    [
      {
        type: "name",
        name: "projectName",
        placeholder: "Projects Name",
      },
      {
        type: "text",
        name: "desc",
        placeholder: "Short Description",
      },
      {
        type: "file",
        name: "src",
      },
    ],
  ];

  const { name } = data;

  const onInputChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <>
      <form className="row g-4">
        {/* {FormData[ins].map((val) => console.log(ins, " : line 115 ", val))} */}

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
            // value={imgSrc}
            onChange={(e) => onInputChange(e.target.value)}
          />
        </div>
      </form>
    </>
  );
}

export default inputForm;
