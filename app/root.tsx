import * as React from "react";
import { useLocation, Outlet } from "react-router-dom";
import { useCatch, useLoaderData } from "remix";
import type {
  ErrorBoundaryComponent,
  LoaderFunction,
  LinksFunction,
  MetaFunction,
  RouteComponent,
} from "remix";
import { Links, LiveReload, Meta, Scripts } from "remix";
import cx from "clsx";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { DocsSiteHeader } from "./components/docs-site-header";
import { DocsSiteFooter } from "./components/docs-site-footer";
import { useScrollRestoration } from "./hooks/scroll-restoration";
import { seo } from "./utils/seo";
import tailwind from "./styles/tailwind.css";
import global from "./styles/global.css";
import { SkipNavLink, SkipNavContent } from "@reach/skip-nav";
import { useLogoAnimation } from "./hooks/logo-animation";
import {
  removeTrailingSlashes,
  ensureSecure,
  isProductionHost,
} from "~/utils/http";

export let loader: LoaderFunction = async ({ request }) => {
  await ensureSecure(request);
  await removeTrailingSlashes(request);
  return { noIndex: !isProductionHost(request) };
};

export let unstable_shouldReload = () => false;

let [seoMeta, seoLinks] = seo({
  description: "Declarative routing for React apps at any scale",
  openGraph: {},
});

export let meta: MetaFunction = () => seoMeta;

export let links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: global },
    { rel: "stylesheet", href: tailwind },
    ...seoLinks,
  ];
};

function DocsLiveReload() {
  if (process.env.NODE_ENV !== "development") return null;
  return <script src="http://localhost:35729/livereload.js?snipver=1"></script>;
}

const Document: React.FC<{
  forceDarkMode?: boolean;
  className?: string;
  noIndex: boolean;
}> = ({ children, className, forceDarkMode, noIndex }) => {
  return (
    <html lang="en" data-force-dark={forceDarkMode ? "" : undefined}>
      <head>
        {noIndex && <meta name="robots" content="noindex" />}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <meta name="theme-color" content="var(--hue-0000)" />
      </head>

      <body
        className={cx(
          className,
          "bg-[color:var(--hue-0000)] text-[color:var(--hue-1000)]"
        )}
      >
        <div className="min-h-screen flex flex-col">{children}</div>
        <Scripts />
        <LiveReload />
        {/* <DocsLiveReload /> */}
      </body>
    </html>
  );
};

let App: RouteComponent = () => {
  let { noIndex } = useLoaderData();
  let location = useLocation();
  let pathname = location.pathname;
  let isDocsPage = React.useMemo(
    () => pathname.startsWith("/docs/"),
    [pathname]
  );
  let skipNavRef = React.useRef<HTMLDivElement | null>(null);

  useScrollRestoration();
  useRouteChangeFocusAndLiveRegionUpdates({ location, focusRef: skipNavRef });

  if (isDocsPage) {
    return (
      <Document noIndex={noIndex}>
        <SkipNavLink />
        <div className="flex flex-col flex-1">
          <DocsSiteHeader className="w-full flex-shrink-0" />
          <div className="flex flex-col">
            <SkipNavContent ref={skipNavRef} tabIndex={-1} />
            <Outlet />
          </div>
        </div>
        <DocsSiteFooter className="w-full flex-shrink-0" />
      </Document>
    );
  }

  return (
    <Document forceDarkMode noIndex={noIndex}>
      <SkipNavLink />
      <SiteHeader />
      <div className="flex flex-col min-h-screen">
        <div className="flex-auto">
          <SkipNavContent ref={skipNavRef} tabIndex={-1} />
          <Outlet />
        </div>
      </div>
      <SiteFooter />
    </Document>
  );
};

export default App;

export let ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error);
  return (
    <Document forceDarkMode noIndex={true}>
      <h1>App Error</h1>
      <pre>{error.message}</pre>
      <p>
        Replace this UI with what you want users to see when your app throws
        uncaught errors.
      </p>
    </Document>
  );
};

export let CatchBoundary = () => {
  let skipNavRef = React.useRef<HTMLDivElement | null>(null);
  let [colors, changeColors] = useLogoAnimation();
  let caught = useCatch();

  let message: string = caught.statusText;
  if (caught.status === 404) {
    message = "That page was not found!";
    // TODO: moar codes
  } else if (caught.status >= 500 && caught.status <= 599) {
    message = "Oh no! Something went wrong!";
  }

  return (
    <Document forceDarkMode noIndex={true}>
      <div className="min-h-screen w-full flex flex-col">
        <SkipNavLink />
        <SiteHeader />
        <div className="flex flex-col flex-grow">
          <SkipNavContent ref={skipNavRef} tabIndex={-1} />
          <div
            className="flex-grow w-full container flex items-center justify-center"
            onPointerMove={changeColors}
            onFocus={changeColors}
            onBlur={changeColors}
          >
            <div className="text-center pt-2 pb-7">
              <h1 className="remix-caught-status remix-text-glow">
                {String(caught.status)
                  .split("")
                  .map((letter, i) => (
                    <span
                      {...(i === 1 && {
                        "data-color": colors[i],
                        "data-content": letter,
                        className: "remix-text-flicker",
                      })}
                      key={i}
                      style={{
                        // @ts-ignore
                        "--anim-color": colors[i],
                        color: colors[i],
                      }}
                    >
                      {letter}
                    </span>
                  ))}
              </h1>
              <div className="text-base font-mono">{message}</div>
            </div>
          </div>
        </div>
      </div>
    </Document>
  );
};

function useRouteChangeFocusAndLiveRegionUpdates({
  location,
  focusRef,
}: {
  location: ReturnType<typeof useLocation>;
  focusRef: React.RefObject<null | undefined | HTMLElement>;
}) {
  let pathname = location.pathname;
  let liveRegionRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    liveRegionRef.current = document.createElement("div");
    liveRegionRef.current.setAttribute("role", "status");
    liveRegionRef.current.classList.add("sr-only");
    liveRegionRef.current.id = "route-change-region";
    document.body.appendChild(liveRegionRef.current);
  }, []);

  let firstRenderRef = React.useRef(true);
  React.useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    if (focusRef.current) {
      // FIXME: this breaks scroll restoration, we need to figure out how to
      // manage focus and scroll without sacrificing one for the other. For now
      // we're prioritizing scroll restoration since browsers don't really have
      // any good answers for focus on back clicks either.
      // focusRef.current.focus();
    }

    if (liveRegionRef.current) {
      let pageTitle =
        pathname === "/"
          ? "Home page"
          : document.title.replace("React Router | ", "");
      liveRegionRef.current.textContent = pageTitle;
    }
  }, [pathname]);
}
