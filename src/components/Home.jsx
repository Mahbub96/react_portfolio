import Banner from "./banner/Banner";
import About from "./about/About";
import Contact from "./contact/Contact";
import Educations from "./educations/Educations";
import Experience from "./experiences/Experience";
import Footer from "./Footer";
import Navbar from "./navbar/Navbar";
import Projects from "./projects/Projects";
import Skills from "./skills/Skills";

function Home() {
  return (
    <div>
      <Navbar />
      <main className="home">
        {/* <Banner /> */}
        <About />
        <Skills />
        <Experience />
        <Educations />
        <Projects />
        <Contact />

        <Footer />
      </main>
    </div>
  );
}

export default Home;
