import * as React from "react";
import { useLocation, Outlet } from "react-router-dom";
import type {
  ErrorBoundaryComponent,
  LinksFunction,
  RouteComponent,
} from "remix";
import { Links, LiveReload, Meta, Scripts, json } from "remix";

import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { useScrollRestoration } from "./hooks/scroll-restoration";
import tailwind from "./styles/tailwind.css";
import global from "./styles/global.css";
import { useMatchMedia } from "./hooks/match-media";

export let links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: global },
    { rel: "stylesheet", href: tailwind },
  ];
};

function DocsLiveReload() {
  if (process.env.NODE_ENV !== "development") return null;
  return <script src="http://localhost:35729/livereload.js?snipver=1"></script>;
}

const Document: React.FC<{
  forceDarkMode: boolean;
}> = ({ children, forceDarkMode }) => {
  return (
    <html lang="en" data-force-dark={forceDarkMode ? "" : undefined}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <meta name="theme-color" content="var(--base00)" />
      </head>

      <body className="bg-[color:var(--base00)] text-[color:var(--base07)]">
        <SiteHeader />

        {children}

        <Scripts />
        <LiveReload />
        {/* <DocsLiveReload /> */}
      </body>
    </html>
  );
};

export let App: RouteComponent = () => {
  let location = useLocation();
  let forceDarkMode = React.useMemo(
    () => !location.pathname.startsWith("/docs/"),
    [location]
  );

  useScrollRestoration();

  return (
    <Document forceDarkMode={forceDarkMode}>
      <div className="flex flex-col min-h-screen">
        <div className="flex-auto">
          <Outlet />
        </div>
        <SiteFooter />
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

// export function loader() {
//   return json(null, { headers: { "Cache-Control": "max-age=3600" } });
// }

// export function unstable_shouldReload() {
//   return false;
// }
