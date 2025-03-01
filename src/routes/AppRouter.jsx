import { Switch, Route } from "react-router-dom";
import App from "../components/App";
import Projects from "../components/projects/Projects";
import Skills from "../components/skills/Skills";
import Contact from "../components/contact/Contact";

const AppRouter = () => {
  return (
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/projects" component={Projects} />
      <Route path="/skills" component={Skills} />
      <Route path="/contact" component={Contact} />
    </Switch>
  );
};

export default AppRouter;
