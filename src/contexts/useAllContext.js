import { createContext, useContext, useState, useEffect } from "react";

const DataContext = createContext();
export const useDataContex = () => useContext(DataContext);

function DataContextProvider(props) {
  // Initialize auth state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check localStorage on initial load
    const savedAuth = localStorage.getItem("isAuthenticated");
    return savedAuth === "true";
  });

  // Update localStorage whenever auth state changes
  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const values = {
    auth: isAuthenticated,
    login,
    logout,
  };

  return (
    <DataContext.Provider value={values}>{props.children}</DataContext.Provider>
  );
}

export default DataContextProvider;
