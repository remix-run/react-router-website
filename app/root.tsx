import { useLocation, Outlet } from "react-router-dom";
import type {
  ErrorBoundaryComponent,
  LinksFunction,
  RouteComponent,
} from "remix";
import { Links, LiveReload, Meta, Scripts } from "remix";

import { Footer } from "./components/footer";
import { Nav } from "./components/nav";
import { useScrollRestoration } from "./hooks/scroll-restoration";
import stylesUrl from "./styles/global.css";

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

function DocsLiveReload() {
  if (process.env.NODE_ENV !== "development") return null;
  return <script src="http://localhost:35729/livereload.js?snipver=1"></script>;
}

const Document: React.FC<{ forceDarkMode: boolean }> = ({
  children,
  forceDarkMode,
}) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {forceDarkMode ? (
          <meta name="theme-color" content="#121212" />
        ) : (
          <>
            <meta
              name="theme-color"
              media="(prefers-color-scheme: light)"
              content="#fff"
            />
            <meta
              name="theme-color"
              media="(prefers-color-scheme: dark)"
              content="#121212"
            />
          </>
        )}
        <Meta />
        <Links />
      </head>

      <body
        className={
          forceDarkMode
            ? "bg-[#121212] text-white"
            : "text-[rgba(18, 18, 18, 0.8)] bg-white dark:bg-[#121212] dark:text-white/80"
        }
      >
        <Nav forceDarkMode={forceDarkMode} />

        {children}

        <Scripts />
        <LiveReload />
        <DocsLiveReload />
      </body>
    </html>
  );
};

export let App: RouteComponent = () => {
  let location = useLocation();

  // let forceDarkMode = React.useMemo(
  //   () => !location.pathname.startsWith("/docs/"),
  //   [location]
  // );
  let forceDarkMode = false;
  useScrollRestoration();

  return (
    <Document forceDarkMode={forceDarkMode}>
      <div className="flex flex-col min-h-screen">
        <div className="flex-auto">
          <Outlet />
        </div>
        <Footer forceDarkMode={forceDarkMode} />
      </div>
    </Document>
  );
};

export default App;

export let ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  return (
    <Document forceDarkMode={false}>
      <h1>App Error</h1>
      <pre>{error.message}</pre>
      <p>
        Replace this UI with what you want users to see when your app throws
        uncaught errors.
      </p>
    </Document>
  );
};
