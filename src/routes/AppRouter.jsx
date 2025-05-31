import { Switch, Route } from "react-router-dom";
import React, { Suspense } from "react";

const App = React.lazy(() => import("../components/App"));
const Projects = React.lazy(() => import("../components/projects/Projects"));
const Skills = React.lazy(() => import("../components/skills/Skills"));
const Contact = React.lazy(() => import("../components/contact/Contact"));

const AppRouter = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/projects" component={Projects} />
        <Route path="/skills" component={Skills} />
        <Route path="/contact" component={Contact} />
      </Switch>
    </Suspense>
  );
};

export default AppRouter;
