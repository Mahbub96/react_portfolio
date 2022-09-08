import { createContext, useContext, useState } from "react";

  const skills = [
    {name:"PHP",src:"/assets/img/php.png"},
    {name:"React JS",src:"/assets/img/javaScript.png"},
    {name:"Vue JS",src:"/assets/img/vue`.png"},
    {name:"jQuery", src:"/assets/img/jquery.png"},
    {name:"Node Js", src:"/assets/img/nodejs.png"},
    {name:"MY SQL",src:"/assets/img/mysql.png"},
    {name:"git",src:"/assets/img/git.png"},
    {name:"github",src:"/assets/img/github.png"},
    {name:"CSS",src:"/assets/img/css.png"},
    {name:"bootstarp",src:"/assets/img/bootstarp.png"},
    {name:"tailwind",src:"/assets/img/tailwind.png"},
    {name:"python",src:"/assets/img/python.png"},
    {name:"C Plus Plus",src:"/assets/img/c++.png"},
    {name:"C",src:"/assets/img/c.png"},
    {name:"Assembly Language",src:"/assets/img/asm.png"},
  ];
  
  const projects = [
    {name:"React Project",src:"./../../assets/img/projects.png"},
    {name:"React Project 1",src:"./../../assets/img/projects.png"},
    {name:"React Project 2",src:"./../../assets/img/projects.png"},
    {name:"React Project 3",src:"./../../assets/img/projects.png"},
    {name:"React Project 4",src:"./../../assets/img/projects.png"},
    {name:"React Project 5",src:"./../../assets/img/projects.png"},
    {name:"React Project 6",src:"./../../assets/img/projects.png"},
  ];
  const projectsTitle = [
    "All",
    "React Js",
     "Node Js",
     "JavaScript",
     "PHP",
     "Laravel",
     "Bootstrap",
    "Django"
  ];

  

const DataContext = createContext();
export const useDataContex = () => useContext(DataContext);


function DataContextProvider(props) {
  const [skillsData,setSkillsData] = useState([...skills]);
  const [experienceData,setExperienceData] = useState([]);
  const [projectsData,setProjectsData] = useState([...projects]);
  const [projectTitle,setProjectTitle] = useState([...projectsTitle])
  const [isLogin,setIsLogin] = useState(true);

  
  const values = {
    isLogin,setIsLogin,skillsData,setSkillsData,experienceData,setExperienceData,projectsData,setProjectsData,projectTitle,setProjectTitle
  };
  return (
    <DataContext.Provider value={values}>{props.children}</DataContext.Provider>
  );
}

export default DataContextProvider;