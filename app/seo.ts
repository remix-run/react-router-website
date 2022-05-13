import { getSeo } from "./remix-seo";

export const seo = getSeo({
  host: "https://reactrouter.com",
  robots: { noindex: true },
  titleTemplate: "%s | React Router",
  defaultTitle: "React Router",
  twitter: {
    site: "@remix_run",
    creator: "@remix_run",
    title: "React Router",
    card: "summary",
    image: {
      url: "/twitterimage.jpg",
      alt: "React Router logo",
    },
  },
  openGraph: {
    images: [
      {
        url: "/ogimage.png",
        alt: "React Router logo",
        height: 627,
        width: 1200,
      },
    ],
    defaultImageHeight: 250,
    defaultImageWidth: 500,
  },
});
