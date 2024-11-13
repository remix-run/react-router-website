import type { LinkDescriptor, MetaDescriptor } from "react-router";
import merge from "lodash.merge";

export function getSeo(defaultConfig: SeoProps) {
  return function seo(config: SeoProps): [MetaDescriptor[], LinkDescriptor[]] {
    config = merge(defaultConfig, config);
    let meta: MetaDescriptor[] = [];
    let links: LinkDescriptor[] = [];

    let title = getSeoTitle(config);
    if (title) {
      meta.push({ title });
    }

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

    if (config.description) {
      meta.push({ name: "description", content: config.description });
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
      if (config.twitter.title || title) {
        meta.push({
          name: "twitter:title",
          content: config.twitter.title || title,
        });
      }

      if (
        config.twitter.description ||
        config.openGraph?.description ||
        config.description
      ) {
        meta.push({
          name: "twitter:description",
          content:
            config.twitter.description ||
            config.openGraph?.description ||
            config.description!,
        });
      }

      if (config.twitter.card) {
        meta.push({ name: "twitter:card", content: config.twitter.card });
      }

      if (config.twitter.site) {
        meta.push({ name: "twitter:site", content: config.twitter.site });
      }

      if (config.twitter.creator) {
        meta.push({ name: "twitter:creator", content: config.twitter.creator });
      }

      if (config.twitter.image && config.twitter.image.url) {
        meta.push({
          name: "twitter:image",
          content: config.host + config.twitter.image.url,
        });
        if (config.twitter.image.alt) {
          meta.push({
            name: "twitter:image:alt",
            content: config.twitter.image.alt,
          });
        }
        if (!meta.some((m) => "name" in m && m.name === "twitter:card")) {
          meta.push({ name: "twitter:card", content: "summary" });
        }
      }
    }

    // OG: Facebook
    if (config.facebook) {
      if (config.facebook.appId) {
        meta.push({ name: "fb:app_id", content: config.facebook.appId });
      }
    }

    // OG: Other stuff
    if (config.openGraph?.title || config.title) {
      meta.push({
        name: "og:title",
        content: config.openGraph?.title || title,
      });
    }

    if (config.openGraph?.description || config.description) {
      meta.push({
        name: "og:description",
        content: config.openGraph?.description || config.description!,
      });
    }

    if (config.openGraph) {
      if (config.openGraph.url || config.canonical) {
        meta.push({
          name: "og:url",
          content: config.openGraph.url || config.canonical!,
        });
      }

      if (config.openGraph.type) {
        const ogType = config.openGraph.type.toLowerCase();

        meta.push({ name: "og:type", content: ogType });

        if (ogType === "profile" && config.openGraph.profile) {
          if (config.openGraph.profile.firstName) {
            meta.push({
              name: "profile:first_name",
              content: config.openGraph.profile.firstName,
            });
          }

          if (config.openGraph.profile.lastName) {
            meta.push({
              name: "profile:last_name",
              content: config.openGraph.profile.lastName,
            });
          }

          if (config.openGraph.profile.username) {
            meta.push({
              name: "profile:username",
              content: config.openGraph.profile.username,
            });
          }

          if (config.openGraph.profile.gender) {
            meta.push({
              name: "profile:gender",
              content: config.openGraph.profile.gender,
            });
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
              //   meta.push({name: "book:author", content: [author] });
              // }
              meta.push({ name: "book:author", content: author });
            }
          }

          if (config.openGraph.book.isbn) {
            meta.push({
              name: "book:isbn",
              content: config.openGraph.book.isbn,
            });
          }

          if (config.openGraph.book.releaseDate) {
            meta.push({
              name: "book:release_date",
              content: config.openGraph.book.releaseDate,
            });
          }

          if (config.openGraph.book.tags && config.openGraph.book.tags.length) {
            for (let tag of config.openGraph.book.tags) {
              // TODO: We cannot support OG array values w/ the current API. Remix
              // needs a solution for this.
              // if (Array.isArray(meta["book:tag"])) {
              //   meta["book:tag"].push(tag);
              // } else {
              //   meta.push({name: "book:tag", content: [tag] });
              // }
              meta.push({ name: "book:tag", content: tag });
            }
          }
        } else if (ogType === "article" && config.openGraph.article) {
          if (config.openGraph.article.publishedTime) {
            meta.push({
              name: "article:published_time",
              content: config.openGraph.article.publishedTime,
            });
          }

          if (config.openGraph.article.modifiedTime) {
            meta.push({
              name: "article:modified_time",
              content: config.openGraph.article.modifiedTime,
            });
          }

          if (config.openGraph.article.expirationTime) {
            meta.push({
              name: "article:expiration_time",
              content: config.openGraph.article.expirationTime,
            });
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
              //   meta.push({name: "article:author", content: [author] });
              // }
              meta.push({ name: "article:author", content: author });
            }
          }

          if (config.openGraph.article.section) {
            meta.push({
              name: "article:section",
              content: config.openGraph.article.section,
            });
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
              //   meta.push({name: "article:tag", content: [tag] });
              // }
              meta.push({ name: "article:tag", content: tag });
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
                meta.push({ name: "video:actor", content: actor.profile });
              }

              if (actor.role) {
                meta.push({ name: "video:actor:role", content: actor.role });
              }
            }
          }

          if (
            config.openGraph.video.directors &&
            config.openGraph.video.directors.length
          ) {
            for (let director of config.openGraph.video.directors) {
              meta.push({ name: "video:director", content: director });
            }
          }

          if (
            config.openGraph.video.writers &&
            config.openGraph.video.writers.length
          ) {
            for (let writer of config.openGraph.video.writers) {
              meta.push({ name: "video:writer", content: writer });
            }
          }

          if (config.openGraph.video.duration) {
            meta.push({
              name: "video:duration",
              content: config.openGraph.video.duration.toString(),
            });
          }

          if (config.openGraph.video.releaseDate) {
            meta.push({
              name: "video:release_date",
              content: config.openGraph.video.releaseDate,
            });
          }

          if (
            config.openGraph.video.tags &&
            config.openGraph.video.tags.length
          ) {
            for (let tag of config.openGraph.video.tags) {
              meta.push({ name: "video:tag", content: tag });
            }
          }

          if (config.openGraph.video.series) {
            meta.push({
              name: "video:series",
              content: config.openGraph.video.series,
            });
          }
        }
      }

      if (config.openGraph.images && config.openGraph.images.length) {
        for (let image of config.openGraph.images) {
          meta.push({ name: "og:image", content: config.host + image.url });
          if (image.alt) {
            meta.push({ name: "og:image:alt", content: image.alt });
          }

          if (image.secureUrl) {
            meta.push({
              name: "og:image:secure_url",
              content: config.host + image.secureUrl.toString(),
            });
          }

          if (image.type) {
            meta.push({
              name: "og:image:type",
              content: image.type.toString(),
            });
          }

          if (image.width) {
            meta.push({
              name: "og:image:width",
              content: image.width.toString(),
            });
          }

          if (image.height) {
            meta.push({
              name: "og:image:height",
              content: image.height.toString(),
            });
          }
        }
      }

      if (config.openGraph.videos && config.openGraph.videos.length) {
        for (let video of config.openGraph.videos) {
          meta.push({ name: "og:video", content: video.url });
          if (video.alt) {
            meta.push({ name: "og:video:alt", content: video.alt });
          }

          if (video.secureUrl) {
            meta.push({
              name: "og:video:secure_url",
              content: video.secureUrl.toString(),
            });
          }

          if (video.type) {
            meta.push({
              name: "og:video:type",
              content: video.type.toString(),
            });
          }

          if (video.width) {
            meta.push({
              name: "og:video:width",
              content: video.width.toString(),
            });
          }

          if (video.height) {
            meta.push({
              name: "og:video:height",
              content: video.height.toString(),
            });
          }
        }
      }

      if (config.openGraph.locale) {
        meta.push({ name: "og:locale", content: config.openGraph.locale });
      }

      if (config.openGraph.siteName) {
        meta.push({ name: "og:site_name", content: config.openGraph.siteName });
      }
    }

    if (config.canonical) {
      links.push({
        rel: "canonical",
        href: config.canonical,
      });
    }

    return [meta, links];
  };
}

function getSeoTitle(config: SeoProps): string {
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

export interface OpenGraphMedia {
  url: string;
  width?: number;
  height?: number;
  alt: string;
  type?: string;
  secureUrl?: string;
}

export interface Address {
  streetAddress: string;
  addressLocality: string;
  addressRegion?: string;
  postalCode: string;
  addressCountry: string;
}

export interface Video {
  name: string;
  description: string;
  thumbnailUrls: string[];
  uploadDate: string;
  contentUrl?: string;
  duration?: string;
  embedUrl?: string;
  expires?: string;
  hasPart?: Clip | Clip[];
  watchCount?: number;
  publication?: BroadcastEvent | BroadcastEvent[];
  regionsAllowed?: string | string[];
}

export interface Clip {
  name: string;
  startOffset: number;
  url: string;
}

export interface BroadcastEvent {
  name?: string;
  isLiveBroadcast: boolean;
  startDate: string;
  endDate: string;
}

export interface Offers {
  price: string;
  priceCurrency: string;
  priceValidUntil?: string;
  itemCondition?: string;
  availability?: string;
  url?: string;
  seller: {
    name: string;
  };
}

export interface AggregateOffer {
  priceCurrency: string;
  lowPrice: string;
  highPrice?: string;
  offerCount?: string;
  offers?: Offers | Offers[];
}

export interface OpenGraphVideoActors {
  profile: string;
  role?: string;
}

export interface OpenGraphMeta {
  url?: string;
  type?: string;
  title?: string;
  description?: string;
  images?: ReadonlyArray<OpenGraphMedia>;
  videos?: ReadonlyArray<OpenGraphMedia>;
  defaultImageHeight?: number;
  defaultImageWidth?: number;
  locale?: string;
  siteName?: string;
  profile?: OpenGraphProfile;
  book?: OpenGraphBook;
  article?: OpenGraphArticle;
  video?: OpenGraphVideo;
}

export interface OpenGraphProfile {
  firstName?: string;
  lastName?: string;
  username?: string;
  gender?: string;
}

export interface OpenGraphBook {
  authors?: ReadonlyArray<string>;
  isbn?: string;
  releaseDate?: string;
  tags?: ReadonlyArray<string>;
}

export interface OpenGraphArticle {
  publishedTime?: string;
  modifiedTime?: string;
  expirationTime?: string;

  authors?: ReadonlyArray<string>;
  section?: string;
  tags?: ReadonlyArray<string>;
}

export interface OpenGraphVideo {
  actors?: ReadonlyArray<OpenGraphVideoActors>;
  directors?: ReadonlyArray<string>;
  writers?: ReadonlyArray<string>;
  duration?: number;
  releaseDate?: string;
  tags?: ReadonlyArray<string>;
  series?: string;
}

export interface TwitterMeta {
  title?: string;
  creator?: string;
  site?: string;
  card?: string;
  description?: string;
  image?: {
    url: string;
    alt: string;
  };
}

export interface FacebookMeta {
  appId: string;
}

export interface MobileAlternate {
  media: string;
  href: string;
}

export interface LanguageAlternate {
  hrefLang: string;
  href: string;
}

export interface LinkTag {
  rel: string;
  href: string;
  sizes?: string;
  type?: string;
  color?: string;
  id?: string;
}

export interface BaseMetaTag {
  content: string;
  id?: string;
}

export interface HTML5MetaTag extends BaseMetaTag {
  name: string;
  property?: undefined;
  httpEquiv?: undefined;
}

export interface RDFaMetaTag extends BaseMetaTag {
  property: string;
  name?: undefined;
  httpEquiv?: undefined;
}

export interface HTTPEquivMetaTag extends BaseMetaTag {
  httpEquiv:
    | "content-security-policy"
    | "content-type"
    | "default-style"
    | "x-ua-compatible"
    | "refresh";
  name?: undefined;
  property?: undefined;
}

export type MetaTag = HTML5MetaTag | RDFaMetaTag | HTTPEquivMetaTag;

export type ImagePrevSize = "none" | "standard" | "large";

export type AggregateRating = {
  ratingValue: string;
  reviewCount?: string;
  ratingCount?: string;
  bestRating?: string;
};

export type GamePlayMode = "CoOp" | "MultiPlayer" | "SinglePlayer";

export type Review = {
  author: Author;
  datePublished?: string;
  reviewBody?: string;
  name?: string;
  publisher?: Publisher;
  reviewRating: ReviewRating;
};

export type ReviewRating = {
  bestRating?: string;
  ratingValue: string;
  worstRating?: string;
};

export type Author = {
  type: string;
  name: string;
};

export type Publisher = {
  type: string;
  name: string;
};

export type ApplicationCategory =
  | "Game"
  | "SocialNetworking"
  | "Travel"
  | "Shopping"
  | "Sports"
  | "Lifestyle"
  | "Business"
  | "Design"
  | "Developer"
  | "Driver"
  | "Educational"
  | "Health"
  | "Finance"
  | "Security"
  | "Browser"
  | "Communication"
  | "DesktopEnhancement"
  | "Entertainment"
  | "Multimedia"
  | "Home"
  | "Utilities"
  | "Reference";

export interface RobotsProps {
  noindex?: boolean;
  nofollow?: boolean;
  nosnippet?: boolean;
  maxSnippet?: number;
  maxImagePreview?: ImagePrevSize;
  maxVideoPreview?: number;
  noarchive?: boolean;
  unavailableAfter?: string;
  noimageindex?: boolean;
  notranslate?: boolean;
}

export interface SeoProps {
  // FIXME: this should be required
  host?: string;
  title?: string;
  titleTemplate?: string;
  bypassTemplate?: boolean;
  defaultTitle?: string;
  robots?: RobotsProps;
  description?: string;
  canonical?: string;
  mobileAlternate?: MobileAlternate;
  languageAlternates?: ReadonlyArray<LanguageAlternate>;
  openGraph?: OpenGraphMeta;
  facebook?: FacebookMeta;
  twitter?: TwitterMeta;
  disableGoogleBot?: boolean;
}

export interface ArticleJsonLdProps {
  id?: string;
  url: string;
  title: string;
  images: ReadonlyArray<string>;
  datePublished: string;
  dateModified?: string;
  authorName: string | string[];
  description: string;
  publisherName: string;
  publisherLogo: string;
}

export interface BlogJsonLdProps {
  id?: string;
  url: string;
  title: string;
  images: ReadonlyArray<string>;
  datePublished: string;
  dateModified: string;
  authorName: string | string[];
  description: string;
}

export interface BreadcrumbItemListElements {
  item: string;
  name: string;
  position: number;
}

export interface BreadCrumbJsonLdProps {
  id?: string;
  itemListElements: BreadcrumbItemListElements[];
}
