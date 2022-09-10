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
 
  const getDatas = async () => {

    setEducationsData(await axios.get("http://localhost:3001/educations").data);
    setSkillsData(await axios.get("http://localhost:3001/skills").data);
    setExperienceData(await axios.get("http://localhost:3001/experiences").data);
    setProjectsData(await axios.get("http://localhost:3001/projects").data);
    // isLogin(await axios.get("http://localhost:3001/login").data);
    setProjectTag([...skillsData.name]);
    
  };

  const getSkillsData = async ()=> setSkillsData(await axios.get("http://localhost:3001/skills").data);
  const getExperienceData = async ()=> setExperienceData(await axios.get("http://localhost:3001/experiences").data);
  const getEducationsData = async ()=> setEducationsData(await axios.get("http://localhost:3001/educations").data);
  const getProjectsData = async ()=> setProjectsData(await axios.get("http://localhost:3001/projects").data);
  // const getIslogin = async ()=> setIsLogin(await axios.get("http://localhost:3001/login").data);

  
  useEffect(() => {
    getDatas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const values = {
    projectTag,setProjectTag,getEducationsData,setEducationsData,educationsData,getProjectsData,getExperienceData,getSkillsData,formName,isLogin,setIsLogin,skillsData,setSkillsData,experienceData,setExperienceData,projectsData,setProjectsData
  };
  return (
    <DataContext.Provider value={values}>{props.children}</DataContext.Provider>
  );
}

export default DataContextProvider;