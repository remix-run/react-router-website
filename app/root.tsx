import type {
  ErrorBoundaryComponent,
  LinksFunction,
  RouteComponent,
} from "remix";
import { Meta, Links, Scripts, useRouteData, LiveReload } from "remix";
import { Outlet, Link } from "react-router-dom";

import stylesUrl from "./styles/global.css";

let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

let handle = {
  crumb: () => <Link to="/">React Router</Link>,
};

function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}

        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

const App: RouteComponent = () => {
  let data = useRouteData();
  return (
    <Document>
      <Outlet />
    </Document>
  );
};

const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  return (
    <Document>
      <h1>App Error</h1>
      <pre>{error.message}</pre>
      <p>
        Replace this UI with what you want users to see when your app throws
        uncaught errors.
      </p>
    </Document>
  );
};

export default App;
export { ErrorBoundary, links, handle };
