import React from "react";
import SkillsServer from "./SkillsServer";

/**
 * Skills component adapter that delegates to SkillsServer for consistent rendering.
 */
function Skills({ data, coreStrengths, headingLevel = "h2" }) {
  return (
    <SkillsServer
      data={data}
      coreStrengths={coreStrengths}
      headingLevel={headingLevel}
    />
  );
}

export default Skills;