import * as React from "react";

let Context = React.createContext<any>(null);

export function useEntryContext() {
  return React.useContext(Context);
}

export function Entry({ context, children }: any) {
  return <Context.Provider value={context} children={children} />;
}
