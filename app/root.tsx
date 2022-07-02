import * as React from "react";
import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { CACHE_CONTROL, whyDoWeNotHaveGoodMiddleWareYetRyan } from "./http";

import tailwindStylesheetUrl from "./styles.processed.css";
import { parseColorScheme } from "./modules/color-scheme/server";
import {
  ColorSchemeScript,
  useColorScheme,
} from "./modules/color-scheme/components";
import { isHost } from "./modules/http-utils/is-host";
import { useEntryContext } from "./entry";
import { matchClientRoutes } from "@remix-run/react/routeMatching";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  title: "React Router",
});

type LoaderData = {
  colorScheme: "light" | "dark" | "system";
  isProductionHost: boolean;
};

export let loader: LoaderFunction = async ({ request }) => {
  await whyDoWeNotHaveGoodMiddleWareYetRyan(request);

  let colorScheme = await parseColorScheme(request);
  let isProductionHost = isHost("reactrouter.com", request);

  return json<LoaderData>(
    { colorScheme, isProductionHost },
    {
      headers: {
        "Cache-Control": CACHE_CONTROL.doc,
        Vary: "Cookie",
      },
    }
  );
};

export default function App() {
  let colorScheme = useColorScheme();
  let { isProductionHost } = useLoaderData();

  return (
    // TODO: change lang when we do translations
    <html lang="en" className={colorScheme} suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
        {isProductionHost ? (
          <>
            <meta content="index,follow" name="robots" />
            <meta content="index,follow" name="googlebot" />
          </>
        ) : (
          <>
            <meta content="noindex,nofollow" name="robots" />
            <meta content="noindex,nofollow" name="googlebot" />
          </>
        )}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link
          rel="icon"
          href="/favicon-light.png"
          type="image/png"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/favicon-dark.png"
          type="image/png"
          media="(prefers-color-scheme: dark)"
        />
        <Meta />
        <Links />
      </head>
      <body className="bg-white text-black dark:bg-gray-900 dark:text-white">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Oops | React Router</title>
        <Links />
      </head>
      <body className="flex bg-white text-black dark:bg-gray-900 dark:text-white">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex gap-4">
            <div className="border-r pr-4 font-bold">Oops</div>
            <div>This is embarassing, our site is broken.</div>
          </div>
          <Link to="/" className="mt-8 underline">
            Go Home
          </Link>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

let isHydrated = false;

export function Scripts(props: any) {
  let {
    manifest,
    matches,
    pendingLocation,
    clientRoutes,
    serverHandoffString,
  } = useEntryContext();

  React.useEffect(() => {
    isHydrated = true;
  }, []);

  let initialScripts = React.useMemo(() => {
    let contextScript = serverHandoffString
      ? `window.__remixContext = ${serverHandoffString};`
      : "";

    let routeModulesScript = `${matches
      .map(
        (match: any, index: number) =>
          `import * as route${index} from ${JSON.stringify(
            manifest.routes[match.route.id].module
          )};`
      )
      .join("\n")}
window.__remixRouteModules = {${matches
      .map(
        (match: any, index: number) =>
          `${JSON.stringify(match.route.id)}:route${index}`
      )
      .join(",")}};`;

    return (
      <>
        <script
          {...props}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: contextScript }}
        />
        <script defer {...props} src={manifest.url} />
        <script
          {...props}
          dangerouslySetInnerHTML={{ __html: routeModulesScript }}
          type="module"
        />
        <link rel="modulepreload" href={manifest.entry.module} />
        <script
          type="module"
          dangerouslySetInnerHTML={{
            __html: `
              // just gaming the bogus "total blocking time" metrics
              // you freakin' dorks.
              import("${manifest.entry.module}");
            `,
          }}
        />
      </>
    );
    // eslint-disable-next-line
  }, []);

  // avoid waterfall when importing the next route module
  let nextMatches = React.useMemo(() => {
    if (pendingLocation) {
      let matches = matchClientRoutes(clientRoutes, pendingLocation);
      return matches;
    }

    return [];
  }, [pendingLocation, clientRoutes]);

  let routePreloads = matches
    .concat(nextMatches)
    .map((match: any) => {
      let route = manifest.routes[match.route.id];
      return (route.imports || []).concat([route.module]);
    })
    .flat(1);

  let preloads = manifest.entry.imports.concat(routePreloads);

  return (
    <>
      {dedupe(preloads).map((path) => (
        <link
          key={path}
          rel="modulepreload"
          href={path}
          crossOrigin={props.crossOrigin}
        />
      ))}
      {isHydrated ? null : initialScripts}
    </>
  );
}

function dedupe(array: any[]) {
  return [...new Set(array)];
}
