import Skill from "./Skill";
import IMAGES from "./Images/SkillsImages";

function Skills() {
  // load all images src to an array
  let imgs = [];
  for (let val in IMAGES[0]) {
    imgs.push(val);
  }

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
            {imgs.map((srcs, i) => (
              <Skill
                key={i}
                name={srcs.replace("_", " ").replace("_", " ")}
                imgSrc={IMAGES[0][srcs]}
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
