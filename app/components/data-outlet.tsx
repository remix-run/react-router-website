import { createContext, useContext } from "react";
import { Outlet } from "react-router-dom";

let OutletContext = createContext<any>(null);

export function DataOutlet({ context }: { context: any }) {
  return (
    <OutletContext.Provider value={context}>
      <Outlet />
    </OutletContext.Provider>
  );
}

export function useOutletContext<T>(): T {
  return useContext(OutletContext);
}
