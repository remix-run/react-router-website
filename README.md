# This is the website for React Router.

## Installation

```sh
npm ci
npx prisma generate
cp .env.example .env
```

## Development

```sh
npm run dev
```

This will pull docs from the file system in dev, it expects the react router source directory to be sibling to this website's source directory. However, I've been developing by just downloading the GitHub tarball and using it via the database. To switch over just update the "where" variable in `utils.server.ts`.

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
