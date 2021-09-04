import {
  ErrorBoundaryComponent,
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

let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

interface RouteData {
  menu: MenuDir;
  versions: VersionHead[];
  version: VersionHead;
  forceDarkMode: boolean;
}

let loader: LoaderFunction = async ({ context, params, request }) => {
  try {
    let versions = await getVersions();
    let [latest] = versions;

    let menu = await getMenu(context.docs, latest, params.lang);

    let url = new URL(request.url);

    let data: RouteData = {
      menu,
      version: latest,
      versions,
      forceDarkMode: !url.pathname.startsWith("/docs/"),
    };

    // so fresh!
    return json(data, { headers: { "Cache-Control": "max-age=0" } });
  } catch (error: unknown) {
    console.error(error);
    return json({ notFound: true }, { status: 404 });
  }
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
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
};

const App: RouteComponent = () => {
  let data = useRouteData<RouteData>();

  return (
    <Document forceDarkMode={data.forceDarkMode}>
      <Nav
        forceDarkMode={data.forceDarkMode}
        menu={data.menu}
        version={data.version}
        versions={data.versions}
      />
      <DataOutlet context={data} />
      <Footer forceDarkMode={data.forceDarkMode} />
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
export { ErrorBoundary, links, loader };
