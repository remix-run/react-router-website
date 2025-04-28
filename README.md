# React Router Website!

## Contributing

If you want to make a contribution

- [Fork and clone](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) this repo
- Create a branch
- Push any changes you make to your branch
- Open up a PR in this Repo

## Setup

First setup your `.env` file, use `.env.example` to know what to set.

```sh
cp .env.example .env
```

Install dependencies

```sh
npm i
```

## Local Development

Now you should be good to go:

```sh
npm run dev
```

To preview local changes to the `docs` folder in the React Router repo, select "local" from the version dropdown menu on the site. Make sure you have the [react-router repo](https://github.com/remix-run/react-router) cloned locally and `LOCAL_REPO_RELATIVE_PATH` is pointed to the correct filepath.

We leverage a number of LRUCache's to server-side cache various resources, such as processed markdown from GitHub, that expire at various times (usually after 5 minutes). If you want them to expire immediately for local development, set the `NO_CACHE` environment variable.

```sh
NO_CACHE=1 npm run dev
```

Note that by default this assumes the relative path to your local copy of the React Router docs is `../react-router`. This can be configured via `LOCAL_REPO_RELATIVE_PATH` in your `.env` file.

## Preview

To preview the production build locally:

```sh
npm run build
npm run preview
```

## Deployment

The production server is always in sync with `main`

```sh
git push origin main
open https://reactrouter.com
```

Pushing the "stage" tag will deploy to [staging](https://reactrouterdotcomstaging.fly.dev/).

```sh
git checkout my/branch

# moves the `stage` tag and pushes it, triggering a deploy
npm run push:stage
```

When you're happy with it, merge your branch into `main` and push.

## CSS Notes

You'll want the [tailwind VSCode plugin](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) for sure, the hints are amazing.

The color scheme has various shades but we also have a special "brand" rule for each of our brand colors so we don't have to know the specific number of that color like this: `<div className="text-pink-brand" />`.

We want to use Tailwind's default classes as much as possible to avoid a large CSS file. A few things you can do to keep the styles shared:

- Avoid changing anything but the theme in `tailwind.config.js`, no special classes, etc.
- Avoid "inline rules" like `color-[#ccc]` as much as possible.
- Silly HTML (like a wrapper div to add padding on a container) is better than one-off css rules.

## Algolia Search

We use [DocSearch](https://docsearch.algolia.com/) by Algolia for our documentation's search. The site is automatically scraped and indexed weekly by the [Algolia Crawler](https://crawler.algolia.com/).

If the doc search results ever seem outdated or incorrect be sure to check that the crawler isn't blocked. If it is, it might just need to be canceled and restarted to kick things off again. There is also an editor in the Crawler admin that lets you adjust the crawler's script if needed.
