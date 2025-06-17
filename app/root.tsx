import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { CACHE_CONTROL } from "./http";

import { parseColorScheme } from "./actions/color-scheme/server";
import {
  ColorSchemeScript,
  useColorScheme,
} from "./actions/color-scheme/components";
import { isHost } from "./modules/http-utils/is-host";
import iconsHref from "~/icons.svg";
import { DocSearch } from "./modules/docsearch";

import "~/styles/tailwind.css";
import "@docsearch/css/dist/style.css";
import "~/styles/docsearch.css";
import type { Route } from "./+types/root";

import { ensureSecure } from "~/modules/http-utils/ensure-secure";
import { handleRedirects } from "~/modules/redirects/.server";
import { removeTrailingSlashes } from "~/modules/http-utils/remove-slashes";

export const unstable_middleware: Route.unstable_MiddlewareFunction[] = [
  ensureSecure,
  removeTrailingSlashes,
  handleRedirects,
];

export async function loader({ request }: Route.LoaderArgs) {
  let colorScheme = await parseColorScheme(request);
  let isProductionHost = isHost("reactrouter.com", request);

  return { colorScheme, isProductionHost };
}

export function headers() {
  return {
    // default all caching to deployments
    "Cache-Control": CACHE_CONTROL.doc,
    Vary: "Cookie",
  };
}

export function meta({ error }: Route.MetaArgs) {
  return [{ title: error ? "Oops | React Router" : "React Router" }];
}

export function Layout({ children }: { children: React.ReactNode }) {
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
          fetchPriority="high"
        />
        <DocSearch>{children}</DocSearch>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  console.error(error);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="font-bold">Oops</div>
      <div>Something went wrong</div>
      <Link to="/" className="mt-8 underline">
        Go Home
      </Link>
    </div>
  );
}
