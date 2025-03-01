import { ThemeProvider } from "../contexts/ThemeContext";
import DataContextProvider from "../contexts/useAllContext";
import { HelmetProvider } from "react-helmet-async";
import "./../App.css";
import Home from "./Home";
import useVisitorTracker from "../hooks/useVisitorTracker";
import VisitorCounter from "./VisitorCounter";
import VisitorAnalytics from "./VisitorAnalytics";
import SEOMetaTags from "./SEOMetaTags";
import { useEffect } from "react";
import { setupAdminCredentials } from "./utils/setupAdmin";
import ConfigButton from "./config/ConfigButton";

function App() {
  useVisitorTracker();

  useEffect(() => {
    // Set up admin credentials when app initializes
    setupAdminCredentials();
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider>
        <div className="App">
          <SEOMetaTags />
          <DataContextProvider>
            <Home />
            {/* Analytics components will self-manage visibility based on auth state */}
            <VisitorCounter />
            <VisitorAnalytics />
            <ConfigButton />
          </DataContextProvider>
        </div>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
