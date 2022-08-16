import { useEffect, useState } from 'react';
import DATABASE from "../database/data";
import Skill from "./Skill";

function Skills() {
 // load all DATABASE src to an array
  const [data,setData] = useState([]);

  useEffect(()=>{
    const getDATABASE = async () => {
      for (let img in DATABASE[0]) {
        setData(prev => [...prev, img]);
      }
    }    
    getDATABASE();

  },[]);

  
  return (
    <>
      <div className="container mt-5" id="skills">
        <div className="skills">
          <div className="header">
            <h2>
              <b>Skills</b>
            </h2>
          </div>
          <div className="mt-2 cards row justify-content-center g-4">
            {data.map((srcs, i) => (
              <Skill
                key={i * new Date()}
                name={srcs.replace("_", " ").replace("_", " ")}
                imgSrc={DATABASE[0][srcs]}
                altTxt={srcs.replace("_", " ")}
              />
            ))}
          </div>
        </div>
      </div>
     
    </>
  );
}

export default Skills;
