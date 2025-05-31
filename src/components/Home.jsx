import React, { Suspense } from "react";

const About = React.lazy(() => import("./about/About"));
const Contact = React.lazy(() => import("./contact/Contact"));
const Educations = React.lazy(() => import("./educations/Educations"));
const Experience = React.lazy(() => import("./experiences/Experience"));
const Footer = React.lazy(() => import("./Footer"));
const Navbar = React.lazy(() => import("./navbar/Navbar"));
const Projects = React.lazy(() => import("./projects/Projects"));
const Skills = React.lazy(() => import("./skills/Skills"));

function Home() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar />
      </Suspense>
      <main className="home">
        <Suspense fallback={<div>Loading...</div>}>
          <About />
          <Skills />
          <Experience />
          <Educations />
          <Projects />
          <Contact />
          <Footer />
        </Suspense>
      </main>
    </div>
  );
}

export default Home;
