import parseAttributes from "gray-matter";
import { processMarkdown } from "@ryanflorence/md";
import invariant from "tiny-invariant";

let SITE_URL = process.env.SITE_URL;

if (!SITE_URL) {
  throw new Error("SITE_URL env var not set");
}

interface Attributes {
  title: string;
  order?: number;
  disabled: boolean;
  siblingLinks: boolean;
  published?: string;
  description?: string;
  hidden: boolean;
  toc: boolean;
}

interface ProcessedDoc {
  attributes: Attributes;
  html: string;
  title: string;
  path: string;
  source: string;
  md: string;
  lang: string;
  hasContent: boolean;
}

export interface Entry {
  source: string;
  path: string;
  content: string;
  lang: string;
}

async function processDoc(entry: Entry): Promise<ProcessedDoc> {
  let { data, content } = parseAttributes(entry.content!);
  let hasContent = content.trim() !== "";

  let title = data.title || entry.path;

  // TODO: Get actual version
  let version = "v6";

  let contentToProcess = data.toc === false ? content : "## toc\n" + content;

  let isExample = entry.path.startsWith("/examples");
  let linkOriginPath = `docs/${entry.lang}/${version}` + entry.path;
  let baseUrl = new URL(SITE_URL);

  let html = hasContent
    ? await reactRouterProcessMarkdown(baseUrl, contentToProcess, {
        linkOriginPath,
        resolveHref(sourceHref) {
          if (
            !isExample ||
            !isRelativeUrl(sourceHref) ||
            sourceHref.startsWith("#") ||
            sourceHref.startsWith("?")
          ) {
            return false;
          }

          let currentUrl = getCurrentUrl(baseUrl, linkOriginPath);
          let href = cleanMarkdownPath(sourceHref);

          let from: string;
          let to: string;

          // If we're linking to another docs page, remove the directory from
          // the href path and resolve from the current URL
          if (href.startsWith("../../docs/") || href.startsWith("../docs/")) {
            from = addTrailingSlash(currentUrl.origin + currentUrl.pathname);
            to = href.replace("/docs/", "/");
          }

          // If not, we're linking to a file in the repo and should resolve
          // from the README in the repo's URL.
          else {
            let repoUrlSegment = cleanMarkdownPath(
              removeTrailingSlash(removeLeadingSlash(entry.path))
            );
            from = `https://github.com/remix-run/react-router/blob/main/${repoUrlSegment}/README.md`;
            to = sourceHref;
          }

          let resolved = resolveUrl(from, to);
          return resolved.href;
        },
      })
    : "";

  return {
    attributes: {
      disabled: data.disabled ?? false,
      toc: data.toc,
      hidden: data.hidden ?? false,
      siblingLinks: data.siblingLinks ?? false,
      title: data.title,
      order: data.order,
      description: data.description,
      published: data.published,
    },
    html: html.toString(),
    title,
    path: entry.path,
    source: entry.source,
    md: content,
    hasContent,
    lang: entry.lang,
  };
}

export { processDoc, ProcessedDoc, Attributes };

/**
 *
 * @param {URL} baseUrl the base URL of the site
 * @param {string} content markdown content
 * @param opts
 * opts.linkOriginPath {string} the path to the current page, if any
 * opts.preserveLinks {boolean} preserve links without rewriting them
 * @returns {string} the processed markdown content
 */
async function reactRouterProcessMarkdown(
  baseUrl: URL,
  content: string,
  opts: {
    linkOriginPath: string;
    preserveLinks?: boolean;
    resolveHref?(sourceHref: string): string | false;
  }
): Promise<string> {
  let preserveLinks = opts.preserveLinks ?? false;

  return processMarkdown(content, {
    /*
     * If you're new here, I bet you wanna know what's going on. Well pull up a
     * chair, grab a tasty snack and let's talk about it.
     *
     * So we like to keep our docs in the `react-router` repo as markdown files.
     * This makes it super easy for users who are browsing around the code to
     * see the docs right there in the source. That's pretty handy!
     *
     * If you're browsing around the docs in GitHub, you might see a link from
     * one doc to another. In markdown that would look something like this:
     *
     * > Check out our [API docs](../api.md)
     *
     * GitHub is going to resolve that link based on the file structure of the
     * repo, and so long as that file exists relative to the file in which the
     * Markdown is rendered, everything works. Splendid.
     *
     * When we build our database from the RR repo, we process the markdown
     * content and turn it into HTML using a bunch of fancy tools tucked away in
     * Ryan's `@ryanflorence/md` project. That tool is external and doesn't
     * really know how we're using it -- it simply converts the markdown into
     * HTML and spits it back to us. But we need to make some changes, because
     * the way the links are resolved on GitHub doesn't necessarily work on our
     * site once they are converted to HTML.
     *
     * First of all, none of the internal links on the site will have a `.md`
     * extension. Second, `index.md` files will appear without the `index` path
     * segment, meaning relative links to (and from) index files will look a bit
     * different.
     *
     * To make these tweaks, Ryan's `md` tool provides a `resolveHref` hook that
     * gives us direct access to the `href` value of all relative links it
     * encounters while parsing. We can manipulate it based on our site's route
     * structure. This means that markdown links always work in GitHub when
     * browsing the markdown files directly as well as our docs site.
     */
    resolveHref(sourceHref) {
      if (opts.resolveHref) {
        let resolved = opts.resolveHref(sourceHref);
        if (resolved !== false) {
          return resolved;
        }
      }

      if (
        preserveLinks ||
        !isRelativeUrl(sourceHref) ||
        sourceHref.startsWith("#") ||
        sourceHref.startsWith("?")
      ) {
        return sourceHref;
      }

      // To resolve the correct href, we need to know the URL of the page the
      // link appears on. We also need to know if it's coming from an index
      // route.
      let currentUrl = getCurrentUrl(baseUrl, opts.linkOriginPath);
      let currentUrlIsIndex = isIndexPath(opts.linkOriginPath);

      let href = cleanMarkdownPath(sourceHref);

      try {
        let from = addTrailingSlash(currentUrl.origin + currentUrl.pathname);
        let to =
          href.startsWith("/") || currentUrlIsIndex ? href : `../${href}`;
        let resolved = resolveUrl(from, to);
        return resolved.pathname + resolved.search + resolved.hash;
      } catch (error: unknown) {
        // who knows 🤷‍♂️, do nothing and we'll just return what they gave us
      }

      return href;
    },
  });
}

function getCurrentUrl(baseUrl: URL, pathFromServer?: string | undefined): URL {
  invariant(
    pathFromServer,
    "Resolving the current URL depends on a source path when called from the server."
  );

  let withNoTrailingSlash = removeTrailingSlash(pathFromServer);
  let withLeadingSlash = removeLeadingSlash(withNoTrailingSlash);
  let toPath = cleanMarkdownPath(withLeadingSlash);

  return resolveUrl(baseUrl.origin, toPath);
}

function isRelativeUrl(test: string): boolean {
  let regexp = new RegExp("^((?:[a-z]+:)?//|mailto:|tel:)", "i");
  return !regexp.test(test);
}

function resolveUrl(from: string, to: string): URL {
  try {
    let resolvedUrl = new URL(to, new URL(from, "resolve://"));
    if (resolvedUrl.protocol === "resolve:") {
      let { pathname, search, hash } = resolvedUrl;
      return new URL(pathname + search + hash);
    }
    return resolvedUrl;
  } catch (error: unknown) {
    if (
      error instanceof TypeError &&
      error.toString() === "TypeError: Failed to construct 'URL': Invalid URL"
    ) {
      throw TypeError(
        "Failed to resolve URL. The `from` argument is an invalid URL."
      );
    }
    throw error;
  }
}

function cleanMarkdownPath(str: string): string {
  // Strips `index.md` or just the `.md` extension
  let regex = /((\/index)?\.md$|(\/index)?\.md(#))/;
  if (regex.test(str)) {
    return str.replace(regex, "$4");
  }

  return str;
}

function isIndexPath(str: string | undefined): boolean {
  if (!str) return false;
  let regex = /(\/index(\.md)?$|\/index(\.md)?(#))/;
  return regex.test(removeLeadingSlash(removeTrailingSlash(str)));
}

function removeLeadingSlash(str: string): string {
  return str.replace(/^\/+/, "");
}

function removeTrailingSlash(str: string): string {
  return str.replace(/\/+$/, "");
}

function addTrailingSlash(str: string): string {
  return removeTrailingSlash(str) + "/";
}
