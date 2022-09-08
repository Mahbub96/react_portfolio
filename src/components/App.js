import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import DataContextProvider from "../contexts/useAllContext";
import "./../App.css";
import Home from "./Home";


function App() {
  return (
    <Router>
    <div className="App">
      <DataContextProvider>
        <Switch>
          {/* <Home/> */}
          <Route exact path="/" component={<Home />} />
          {/* <Route exact path="/inp" component={<ReqForm />} /> */}
        </Switch>
      </DataContextProvider>
    </div>
    </Router>
  );
}

export default App;
