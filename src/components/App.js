import DataContextProvider from "../contexts/useAllContext";
import "./../App.css";
import Home from "./Home";

function App() {
  return (
    <div className="App">
      <DataContextProvider>
        <Home />

        {/* <Route exact path="/inp/:id" component={ReqForm} /> */}
      </DataContextProvider>
    </div>
  );
}

export default App;
