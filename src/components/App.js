import { Route, Routes } from "react-router-dom";
import DataContextProvider from "../contexts/useAllContext";
import "./../App.css";
import Home from "./Home";
import ReqForm from './ReqForm';

function App() {
  return (
    <div className="App">
      <DataContextProvider>
        <Routes>
          {/* <Home/> */}
          <Route path="/" element={<Home />} />
          <Route path="/inp" element={<ReqForm />} />
        </Routes>
      </DataContextProvider>
    </div>
  );
}

export default App;
