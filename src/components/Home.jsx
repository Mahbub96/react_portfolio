import React from "react";
import Banner from "./Banner";
import Educations from "./Educations";
import Experience from "./Experience";
import Footer from "./Footer";
import Header from "./Header";
import Projects from "./Projects";
import Skills from "./Skills";

function Home() {
  return (
    <div>
      <Header />
      <Banner />
      <Skills />
      <Experience />
      <Educations />
      <Projects />
      <Footer />
    </div>
  );
}

export default Home;
