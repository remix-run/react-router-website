import type {
  HeadersArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { CACHE_CONTROL, middlewares } from "./http";

import { parseColorScheme } from "./modules/color-scheme/server";
import {
  ColorSchemeScript,
  useColorScheme,
} from "./modules/color-scheme/components";
import { isHost } from "./modules/http-utils/is-host";
import iconsHref from "~/icons.svg";
import stylesheet from "~/styles/tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await middlewares(request);

  let colorScheme = await parseColorScheme(request);
  let isProductionHost = isHost("reactrouter.com", request);

  return { colorScheme, isProductionHost };
}

export function headers(_: HeadersArgs) {
  return {
    // default all caching to deployments
    "Cache-Control": CACHE_CONTROL.deploy,
    Vary: "Cookie",
  };
}

export default function App() {
  let colorScheme = useColorScheme();

  return (
    <html
      lang="en"
      className={colorScheme === "dark" ? "dark" : ""}
      suppressHydrationWarning
    >
      <head>
        <ColorSchemeScript />
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
      <body className="bg-white text-black antialiased selection:bg-blue-200 selection:text-black dark:bg-gray-900 dark:text-white dark:selection:bg-blue-800 dark:selection:text-white">
        <img
          src={iconsHref}
          alt=""
          hidden
          // this img tag simply forces the icons to be loaded at a higher
          // priority than the scripts (chrome only for now)
          // @ts-expect-error
          fetchpriority="high"
        />
        <Outlet />
        <ScrollRestoration />
        {/* @ts-expect-error */}
        <Scripts defer />
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
          <div className="font-bold">Oops</div>
          <div>Something went wrong</div>
          <Link to="/" className="mt-8 underline">
            Go Home
          </Link>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
