import DataContextProvider from "../contexts/useAllContext";
import "./../App.css";
import Home from "./Home";
import useVisitorTracker from "../hooks/useVisitorTracker";
import VisitorCounter from "./VisitorCounter";

function App() {
  useVisitorTracker();

  return (
    <div className="App">
      <VisitorCounter />
      <DataContextProvider>
        <Home />

        {/* <Route exact path="/inp/:id" component={ReqForm} /> */}
      </DataContextProvider>
    </div>
  );
}

export default App;
