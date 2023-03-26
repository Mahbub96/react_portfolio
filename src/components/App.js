import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import DataContextProvider from "../contexts/useAllContext";
import "./../App.css";
import Home from "./Home";
import ReqForm from "./ReqForm";

function App() {
  return (
    <Router>
      <div className="App">
        <DataContextProvider>
          <Switch>
            <Route exact path="/" component={Home} />

            <Route exact path="/inp/:id" component={ReqForm} />
          </Switch>
        </DataContextProvider>
      </div>
    </Router>
  );
}

export default App;
