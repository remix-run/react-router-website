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
  Scripts,
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
        {/* @ts-expect-error */}
        <Scripts defer />
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
