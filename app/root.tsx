import * as React from "react";
import { useLocation } from "react-router-dom";
import {
  ErrorBoundaryComponent,
  HeadersFunction,
  json,
  LinksFunction,
  LoaderFunction,
  RouteComponent,
  useRouteData,
} from "remix";
import { Links, LiveReload, Meta, Scripts } from "remix";
import { DataOutlet } from "./components/data-outlet";

import { Footer } from "./components/footer";
import { Nav } from "./components/nav";
import stylesUrl from "./styles/global.css";
import { getMenu, getVersions, MenuDir, VersionHead } from "./utils.server";
import { time } from "./utils/time";
import { addTrailingSlash } from "./utils/with-trailing-slash";

let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

interface RouteData {
  menu: MenuDir;
  versions: VersionHead[];
  version: VersionHead;
}

let loader: LoaderFunction = ({ context, params, request }) => {
  return addTrailingSlash(request)(async () => {
    try {
      let [versionsMS, versions] = await time(() => getVersions());
      let [latest] = versions;

      let [menuMS, menu] = await time(() => getMenu(context.docs, latest));

      let data: RouteData = {
        menu,
        version: latest,
        versions,
      };

      return json(data, {
        headers: {
          "Server-Timing": `versions;dur=${versionsMS}, menu;dur=${menuMS}`,
        },
      });
    } catch (error: unknown) {
      console.error(error);
      return json({ notFound: true }, { status: 404 });
    }
  });
};

const headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    // so fresh!
    "Cache-Control": "max-age=0",
    "Server-Timing": loaderHeaders.get("Server-Timing") ?? "",
  };
};

const DocsLiveReload: React.VFC = () => {
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <script src="http://192.168.0.33:35729/livereload.js?snipver=1"></script>
  );
};

const Document: React.FC<{ forceDarkMode: boolean }> = ({
  children,
  forceDarkMode,
}) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
        {children}

        <Scripts />
        <LiveReload />
        <DocsLiveReload />
      </body>
    </html>
  );
};

const App: RouteComponent = () => {
  let data = useRouteData<RouteData>();
  let location = useLocation();

  let forceDarkMode = React.useMemo(
    () => !location.pathname.startsWith("/docs/"),
    [location]
  );

  return (
    <Document forceDarkMode={forceDarkMode}>
      <div className="flex flex-col min-h-screen">
        <Nav
          forceDarkMode={forceDarkMode}
          menu={data.menu}
          version={data.version}
          versions={data.versions}
        />
        <div className="flex-auto">
          <DataOutlet context={data} />
        </div>
        <Footer forceDarkMode={forceDarkMode} />
      </div>
    </Document>
  );
};

const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
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

export default App;
export { ErrorBoundary, headers, links, loader };
