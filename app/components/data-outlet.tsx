import { createContext, useContext } from "react";
import { Outlet } from "react-router-dom";

let OutletContext = createContext<any>(null);

const DataOutlet: React.VFC<{ context: any }> = ({ context }) => {
  return (
    <OutletContext.Provider value={context}>
      <Outlet />
    </OutletContext.Provider>
  );
};

function useOutletContext<T>(): T {
  return useContext(OutletContext);
}

export { useOutletContext, DataOutlet };
