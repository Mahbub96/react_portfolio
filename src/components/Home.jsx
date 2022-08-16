import React from "react";
import Banner from "./banner/Banner";
import Contact from "./contact/Contact";
import Educations from "./educations/Educations";
import Experience from "./experiences/Experience";
import Footer from "./Footer";
import Navbar from './navbar/Navbar';
import Projects from "./projects/Projects";
import Skills from "./skills/Skills";

function Home() {
  return (
    <div>
      <Navbar />
      <Banner />
      <Skills />
      <Experience />
      <Educations />
      <Projects />
      <Contact />
      <Footer />
      
    </div>
  );
}

export default Home;
