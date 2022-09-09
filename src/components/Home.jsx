import Banner from "./banner/Banner";
import Educations from "./educations/Educations";
import Experience from "./experiences/Experience";
import Footer from "./Footer";
import Navbar from "./navbar/Navbar";
import Skills from "./skills/Skills";
function Home() {
  return (
    <div>
      <Navbar />
      <Banner />
      <Skills />
      <Experience />
      <Educations />
      {/* <Projects /> */}
      {/* <Contact /> */}
      <Footer />
    </div>
  );
}

export default Home;
