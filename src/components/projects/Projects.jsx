import { useEffect, useState } from "react";
import DATABASE from "../database/data";
import Project from "./Project";

function Projects() {
  
   // load all DATABASE src to an array
   const [data,setData] = useState([]);
   const [menuItems,setMenuItems] = useState([]);


   useEffect(()=>{
     const getDATABASE = async() => {
       for (let img in DATABASE[1]) {
         setData(prev => [...prev, img]);
       }
     }    

     const getMenu = async ()=>{
      for (let item in DATABASE[2]) {
        setMenuItems(prev => [...prev, item]);
      }
    }
    getMenu();
    getDATABASE();
   // eslint-disable-next-line react-hooks/exhaustive-deps
   },[]);


  return (
    <>
      <div className="container mt-5" id="project">
        <div className="project">
          <div className="header">
            <h2>
              <b>projects</b>
            </h2>
          </div>
          <div className="menus">
            <div className="row d-flex justify-content-center g-2 my-1">
              {
                menuItems.map((item,i)=>  <a key={i*12+100}
                className="col-4 bg-light col-lg-1 col-md-2 col-sm-3 col-md-2"
                href="#home"
              >
                {item && DATABASE[2][item]}
              </a>)
              }
            </div>
          </div>
          <div className="cards row d-flex justify-content-center my-1 g-3">
            {data.map((srcs, i) => (
              <Project
                key={i*2}
                title={srcs.replace("_", " ").replace("_", " ")}
                imgSrc={DATABASE[1][srcs]}
                altTxt={srcs.replace("_", " ")}
                desc="Some quick example text to build on the card title and make
                up the bulk of the card's content."
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Projects;
