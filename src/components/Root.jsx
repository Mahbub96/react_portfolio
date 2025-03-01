import { BrowserRouter as Router } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "../contexts/ThemeContext";
import DataContextProvider from "../contexts/useAllContext";
import AppRouter from "../routes/AppRouter";

const Root = () => {
  return (
    <Router>
      <HelmetProvider>
        <ThemeProvider>
          <DataContextProvider>
            <AppRouter />
          </DataContextProvider>
        </ThemeProvider>
      </HelmetProvider>
    </Router>
  );
};

export default Root;
