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
      type: "text",
      name: "name",
      placeholder: "Institution Name",
    },
    {
      type: "text",
      name: "time",
      placeholder: "2019 - Present",
    },
    {
      type: "text",
      name: "degName",
      placeholder: "Bachelor of Science",
    },
    {
      type: "text",
      name: "Department",
      placeholder: "Computer Science and Engineering",
    },
    {
      type: "text",
      name: "cgpa",
      placeholder: "3.75",
    },
    {
      type: "text",
      name: "Thesis",
      placeholder: "Thesis Title (Optional)",
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
