import axios from 'axios';
import { createContext, useContext, useEffect, useState } from "react";

const DataContext = createContext();
export const useDataContex = () => useContext(DataContext);
const formName = [
    [
      {
        type: "name",
        name: "name",
        placeholder: "Skills Name",
      },
      {
        type: "file",
        name: "src",
        placeholder:""
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
        placeholder:""
      },
      {
        type: "select",
      },
    ],
  ];





function DataContextProvider(props) {
  const [skillsData,setSkillsData] = useState([]);
  const [experienceData,setExperienceData] = useState([]);
  const [educationsData,setEducationsData] = useState([]);
  const [projectsData,setProjectsData] = useState([]);
  const [isLogin,setIsLogin] = useState(true);
  const [projectTag,setProjectTag] = useState([]);

  const getSkillsData = async () => {
    const res =  await axios.get("http://localhost:3001/skills");
    setSkillsData(res.data);
  }
  const getExperienceData = async () => {
    const res =  await axios.get("http://localhost:3001/experiences");
    setExperienceData(res.data);
  }
  const getEducationsData = async () => {
    const res =  await axios.get("http://localhost:3001/educations");
    setEducationsData(res.data);
  }
  const getProjectsData = async () => {
    const res =  await axios.get("http://localhost:3001/projects");
    setProjectsData(res.data);
  }

  // const getIslogin = async ()=> setIsLogin(await axios.get("http://localhost:3001/login").data);

  
  useEffect(() => {
    getSkillsData();
    getExperienceData();
    getEducationsData();
    getProjectsData();
  }, []);
  
  const states = [skillsData,setSkillsData,experienceData,setExperienceData,educationsData,setEducationsData,projectsData,setProjectsData];
  
  const values = {
    states
    ,
    getSkillsData,projectTag,setProjectTag,getEducationsData,getProjectsData,getExperienceData,formName,isLogin,setIsLogin
  }
  return (
    <DataContext.Provider value={values}>{props.children}</DataContext.Provider>
  );
}

export default DataContextProvider;