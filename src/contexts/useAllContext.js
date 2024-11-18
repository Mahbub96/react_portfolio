import { createContext, useContext } from "react";

const DataContext = createContext();
export const useDataContex = () => useContext(DataContext);

function DataContextProvider(props) {
  const auth = localStorage.getItem("auth") || false;

  const values = { auth };
  return (
    <DataContext.Provider value={values}>{props.children}</DataContext.Provider>
  );
}

export default DataContextProvider;
