import { createContext, useContext } from "react";

const DataContext = createContext();
export const useDataContex = () => useContext(DataContext);

function DataContextProvider(props) {
  // const getIslogin = async ()=> setIsLogin(await axios.get("https://backend996.herokuapp.com/login").data);
  const auth = false;

  const values = { auth };
  return (
    <DataContext.Provider value={values}>{props.children}</DataContext.Provider>
  );
}

export default DataContextProvider;
