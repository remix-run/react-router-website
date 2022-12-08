# React Router Website!

## Setup

Copy the `.env` file and add your information to it.

```sh
cp .env.example .env
```

Install dependencies

```sh
npm install
```

That's it!

## Development

```sh
npm run dev
```

There are a couple LRUCache's for talking to GitHub and processing markdown that expire after 5 minutes, if you want them to expire immediately for local development, set the `NO_CACHE` environment variable.

```sh
NO_CACHE=1 npm run dev
```

To work on local docs clone the react router repo and put it in the same folder as this website repo:

```
~/ur-stuff/reactrouter-website
~/ur-stuff/react-router
```

Then point `.env` at it like this:

```
LOCAL_REPO_RELATIVE_PATH="../react-router"
```

You'll notice a "local" option in the version dropdown menu when the app is running. That will pull the docs from your machine instead of GitHub.

## Roadmap

- Handle translations
- Allow links to link to ".md" so code completion works when editing docs (sorry, this is a stupid @ryanflorence/md thing, need open that up so we can do more w/ markdown across all our sites)
- parse out descriptions in @remix-run/md and add to seo
- create resource route so the og:image is the first code block of the doc (with syntax highlighting!)
