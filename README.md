# This is the website for React Router.

## Installation

```sh
npm ci
npx prisma generate

# NOTE: Check the env file and fill in any missing info!
cp .env.example .env
```

> **NOTE:** Installation will fail if `REMIX_TOKEN` is not defined in your shell environment.

## Development

```sh
npm run dev
```

This will pull docs from the file system in dev, it expects the react router source directory to be sibling to this website's source directory. If you want to use the database file, you can start the dev server using `REMOTE_DOCS=true npm run dev`.

````
/wherever/your/code/is/reactrouter.com
/wherever/your/code/is/react-router

If you're actually writing docs, it's start up a live reload server from the Remix source repo:

```sh
cd ../remix/docs
livereload -e md
````

Now any changes you make to the docs will cause a reload.

## Deploying

```
npm run deploy
```
