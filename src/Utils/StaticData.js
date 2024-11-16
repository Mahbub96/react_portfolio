const formName = {
  Skills: [
    {
      type: "name",
      name: "name",
      placeholder: "Skills Name",
    },
    {
      type: "file",
      name: "src",
      placeholder: "",
    },
  ],

  Experiences: [
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
  Education: [
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
  projectsData: [
    {
      type: "name",
      name: "name",
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
      placeholder: "",
    },
    {
      type: "select",
    },
  ],
};

export { formName };
