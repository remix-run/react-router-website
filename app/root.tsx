import * as React from "react";
import { useLocation, Outlet } from "react-router-dom";
import {
  ErrorBoundaryComponent,
  LinkDescriptor,
  LinksFunction,
  MetaFunction,
  RouteComponent,
  useCatch,
} from "remix";
import { Links, LiveReload, Meta, Scripts, json } from "remix";
import cx from "clsx";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { DocsSiteHeader } from "./components/docs-site-header";
import { DocsSiteFooter } from "./components/docs-site-footer";
import { useScrollRestoration } from "./hooks/scroll-restoration";
import tailwind from "./styles/tailwind.css";
import global from "./styles/global.css";
import { SkipNavLink, SkipNavContent } from "@reach/skip-nav";

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
  forceDarkMode?: boolean;
  className?: string;
}> = ({ children, className, forceDarkMode }) => {
  return (
    <html lang="en" data-force-dark={forceDarkMode ? "" : undefined}>
      <head>
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
      <Document>
        <SkipNavLink />
        <div className="flex flex-col">
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
    <Document forceDarkMode>
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
    <Document forceDarkMode>
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
  let caught = useCatch();
  return (
    <Document forceDarkMode>
      <h1>{caught.status}</h1>
      <pre>{caught.statusText}</pre>
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

const seoConfig: any = {
  // title: // string | { value: string; bypassTemplate: boolean },
  defaultTitle: "React Router",
  titleTemplate: "%s | React Router",
  noindex: false,
  nofollow: false,
  disableGooglebot: false,
  description: "TODO",
  robots: {
    // nosnippet,
    // maxSnippet, // max-snippet:[val]
    // maxImagePreview, // max-image-preview:[val]
    // maxVideoPreview, // // max-video-preview:[val]
    // noarchive,
    // noimageindex,
    // notranslate,
    // unavailableAfter, // unavailable_after:[val],
  },
  // languageAlternates: [
  //     { href: string, hrefLang: string }
  // ],
  // mobileAlternate: { media: string, href: string },
  // canonical: string,
  twitter: {
    // card: string (absolute URL to image)
    // site: string
    // creator: string (@handle)
  },
  facebook: {
    // appId: string
  },
  openGraph: {
    // title: string,
    // description: string,
    // url: string,
    // type: string
    // profile: { firstName: string, lastName: string, username: string, gender: string }
  },
};

function seo(config: any) {
  let title = getSeoTitle(config);
  let meta: { [name: string]: string } = title ? { title } : {};
  let links: LinkDescriptor[] = [];

  let noindex = config.noindex || false;
  let nofollow = config.nofollow || false;
  let disableGooglebot = config.disableGooglebot || false;

  let robotsParams: string[] = [];
  if (config.robots) {
    let {
      nosnippet,
      maxSnippet,
      maxImagePreview,
      maxVideoPreview,
      noarchive,
      noimageindex,
      notranslate,
      unavailableAfter,
    } = config.robots;

    if (nosnippet) {
      robotsParams.push("nosnippet");
    }

    if (maxSnippet) {
      robotsParams.push(`max-snippet:${maxSnippet}`);
    }

    if (maxImagePreview) {
      robotsParams.push(`max-image-preview:${maxImagePreview}`);
    }

    if (noarchive) {
      robotsParams.push("noarchive");
    }

    if (unavailableAfter) {
      robotsParams.push(`unavailable_after:${unavailableAfter}`);
    }

    if (noimageindex) {
      robotsParams.push("noimageindex");
    }

    if (maxVideoPreview) {
      robotsParams.push(`max-video-preview:${maxVideoPreview}`);
    }

    if (notranslate) {
      robotsParams.push(`notranslate`);
    }
  }

  let robotsParamStr = robotsParams.join(",");

  if (noindex || nofollow) {
    meta.robots = `${noindex ? "noindex" : "index"},${
      nofollow ? "nofollow" : "follow"
    },${robotsParamStr}`;

    if (!disableGooglebot) {
      meta.googlebot = `${noindex ? "noindex" : "index"},${
        nofollow ? "nofollow" : "follow"
      },${robotsParamStr}`;
    }
  } else {
    meta.robots = `index,follow,${robotsParamStr}`;
    if (!disableGooglebot) {
      meta.googlebot = `index,follow,${robotsParamStr}`;
    }
  }

  if (config.description) {
    meta.description = config.description;
  }

  if (config.mobileAlternate) {
    links.push({
      rel: "alternate",
      media: config.mobileAlternate.media,
      href: config.mobileAlternate.href,
    });
  }

  if (config.languageAlternates && config.languageAlternates.length > 0) {
    for (let languageAlternate of config.languageAlternates) {
      links.push({
        rel: "alternate",
        hrefLang: languageAlternate.hrefLang,
        href: languageAlternate.href,
      });
    }
  }

  // OG: Twitter
  if (config.twitter) {
    if (config.twitter.card) {
      meta["twitter:card"] = config.twitter.card;
    }

    if (config.twitter.site) {
      meta["twitter:site"] = config.twitter.site;
    }

    if (config.twitter.creator) {
      meta["twitter:creator"] = config.twitter.creator;
    }
  }

  // OG: Facebook
  if (config.facebook) {
    if (config.facebook.appId) {
      meta["fb:app_id"] = config.facebook.appId;
    }
  }

  // OG: Other stuff
  if (config.openGraph?.title || config.title) {
    meta["og:title"] = config.openGraph?.title || title;
  }

  if (config.openGraph?.description || config.description) {
    meta["og:description"] =
      config.openGraph?.description || config.description;
  }

  if (config.openGraph) {
    if (config.openGraph.url || config.canonical) {
      meta["og:url"] = config.openGraph.url || config.canonical;
    }

    if (config.openGraph.type) {
      const ogType = config.openGraph.type.toLowerCase();

      meta["og:type"] = ogType;

      if (ogType === "profile" && config.openGraph.profile) {
        if (config.openGraph.profile.firstName) {
          meta["profile:first_name"] = config.openGraph.profile.firstName;
        }

        if (config.openGraph.profile.lastName) {
          meta["profile:last_name"] = config.openGraph.profile.lastName;
        }

        if (config.openGraph.profile.username) {
          meta["profile:username"] = config.openGraph.profile.username;
        }

        if (config.openGraph.profile.gender) {
          meta["profile:gender"] = config.openGraph.profile.gender;
        }
      } else if (ogType === "book" && config.openGraph.book) {
        if (
          config.openGraph.book.authors &&
          config.openGraph.book.authors.length
        ) {
          for (let author of config.openGraph.book.authors) {
            // TODO: We cannot support OG array values w/ the current API. Remix
            // needs a solution for this.
            // if (Array.isArray(meta["book:author"])) {
            //   meta["book:author"].push(author);
            // } else {
            //   meta["book:author"] = [author];
            // }
            meta["book:author"] = author;
          }
        }

        if (config.openGraph.book.isbn) {
          meta["book:isbn"] = config.openGraph.book.isbn;
        }

        if (config.openGraph.book.releaseDate) {
          meta["book:release_date"] = config.openGraph.book.releaseDate;
        }

        if (config.openGraph.book.tags && config.openGraph.book.tags.length) {
          for (let tag of config.openGraph.book.tags) {
            // TODO: We cannot support OG array values w/ the current API. Remix
            // needs a solution for this.
            // if (Array.isArray(meta["book:tag"])) {
            //   meta["book:tag"].push(tag);
            // } else {
            //   meta["book:tag"] = [tag];
            // }
            meta["book:tag"] = tag;
          }
        }
      } else if (ogType === "article" && config.openGraph.article) {
        if (config.openGraph.article.publishedTime) {
          meta["article:published_time"] =
            config.openGraph.article.publishedTime;
        }

        if (config.openGraph.article.modifiedTime) {
          meta["article:modified_time"] = config.openGraph.article.modifiedTime;
        }

        if (config.openGraph.article.expirationTime) {
          meta["article:expiration_time"] =
            config.openGraph.article.expirationTime;
        }

        if (
          config.openGraph.article.authors &&
          config.openGraph.article.authors.length
        ) {
          for (let author of config.openGraph.article.authors) {
            // TODO: We cannot support OG array values w/ the current API. Remix
            // needs a solution for this.
            // if (Array.isArray(meta["article:author"])) {
            //   meta["article:author"].push(author);
            // } else {
            //   meta["article:author"] = [author];
            // }
            meta["article:author"] = author;
          }
        }

        if (config.openGraph.article.section) {
          meta["article:section"] = config.openGraph.article.section;
        }

        if (
          config.openGraph.article.tags &&
          config.openGraph.article.tags.length
        ) {
          for (let tag of config.openGraph.article.tags) {
            // TODO: We cannot support OG array values w/ the current API. Remix
            // needs a solution for this.
            // if (Array.isArray(meta["article:tag"])) {
            //   meta["article:tag"].push(tag);
            // } else {
            //   meta["article:tag"] = [tag];
            // }
            meta["article:tag"] = tag;
          }
        }
      } else if (
        (ogType === "video.movie" ||
          ogType === "video.episode" ||
          ogType === "video.tv_show" ||
          ogType === "video.other") &&
        config.openGraph.video
      ) {
        if (
          config.openGraph.video.actors &&
          config.openGraph.video.actors.length
        ) {
          for (let actor of config.openGraph.video.actors) {
            if (actor.profile) {
              meta["video:actor"] = actor.profile;
            }

            if (actor.role) {
              meta["video:actor:role"] = actor.role;
            }
          }
        }

        if (
          config.openGraph.video.directors &&
          config.openGraph.video.directors.length
        ) {
          for (let director of config.openGraph.video.directors) {
            meta["video:director"] = director;
          }
        }

        if (
          config.openGraph.video.writers &&
          config.openGraph.video.writers.length
        ) {
          for (let writer of config.openGraph.video.writers) {
            meta["video:writer"] = writer;
          }
        }

        if (config.openGraph.video.duration) {
          meta["video:duration"] = config.openGraph.video.duration.toString();
        }

        if (config.openGraph.video.releaseDate) {
          meta["video:release_date"] = config.openGraph.video.releaseDate;
        }

        if (config.openGraph.video.tags && config.openGraph.video.tags.length) {
          for (let tag of config.openGraph.video.tags) {
            meta["video:tag"] = tag;
          }
        }

        if (config.openGraph.video.series) {
          meta["video:series"] = config.openGraph.video.series;
        }
      }
    }

    if (config.openGraph.images && config.openGraph.images.length) {
      for (let image of config.openGraph.images) {
        meta["og:image"] = image.url;
        if (image.alt) {
          meta["og:image:alt"] = image.alt;
        }

        if (image.secureUrl) {
          meta["og:image:secure_url"] = image.secureUrl.toString();
        }

        if (image.type) {
          meta["og:image:type"] = image.type.toString();
        }

        if (image.width) {
          meta["og:image:width"] = image.width.toString();
        }

        if (image.height) {
          meta["og:image:height"] = image.height.toString();
        }
      }
    }

    if (config.openGraph.videos && config.openGraph.videos.length) {
      for (let video of config.openGraph.videos) {
        meta["og:video"] = video.url;
        if (video.alt) {
          meta["og:video:alt"] = video.alt;
        }

        if (video.secureUrl) {
          meta["og:video:secure_url"] = video.secureUrl.toString();
        }

        if (video.type) {
          meta["og:video:type"] = video.type.toString();
        }

        if (video.width) {
          meta["og:video:width"] = video.width.toString();
        }

        if (video.height) {
          meta["og:video:height"] = video.height.toString();
        }
      }
    }

    if (config.openGraph.locale) {
      meta["og:locale"] = config.openGraph.locale;
    }

    if (config.openGraph.siteName) {
      meta["og:site_name"] = config.openGraph.site_name;
    }
  }

  if (config.canonical) {
    links.push({
      rel: "canonical",
      href: config.canonical,
    });
  }

  return { meta, links };
}

function getSeoTitle(config: any): string {
  let bypassTemplate = config.bypassTemplate || false;
  let templateTitle = config.titleTemplate || "";
  let updatedTitle = "";
  if (config.title) {
    updatedTitle = config.title;
    if (templateTitle && !bypassTemplate) {
      updatedTitle = templateTitle.replace(/%s/g, () => updatedTitle);
    }
  } else if (config.defaultTitle) {
    updatedTitle = config.defaultTitle;
  }
  return updatedTitle;
}
