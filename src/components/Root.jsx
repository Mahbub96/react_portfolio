import React, { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "../contexts/ThemeContext";
import DataContextProvider from "../contexts/useAllContext";
import ThreeDots from "./ThreeDots";

// Use React.lazy for AppRouter import for better chunk splitting
const AppRouter = React.lazy(() => import("../routes/AppRouter"));

const Root = () => {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--background-color, #181818)",
            zIndex: 9999,
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
          }}
          aria-label="Loading content"
        >
          <ThreeDots
            height={80}
            width={120}
            backgroundColor="transparent"
          />
        </div>
      }
    >
      <Router>
        <HelmetProvider>
          <ThemeProvider>
            <DataContextProvider>
              <AppRouter />
            </DataContextProvider>
          </ThemeProvider>
        </HelmetProvider>
      </Router>
    </Suspense>
  );
};

export default Root;
