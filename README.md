# This is the website for React Router.

## Installation

```sh
# NOTE: Check the env file and fill in any missing info!
cp .env.example .env

npm ci
# this will create a db file based on DATABASE_URL and seed it
npm run db:reset
```

## Development

```sh
npm run dev
```

If you're actually writing docs, let's start up a file watcher, the react-router docs folder location is defined by the `LOCAL_DOCS_PATH` and `LOCAL_EXAMPLES_PATH` environment variable, so if it's next to this project, the value should be `"../react-router/docs"`

```sh
/wherever/your/code/is/reactrouter.com
/wherever/your/code/is/react-router
```

```sh
npm run dev:docs
```

Now any changes you make to the docs will update your development database.

## Deploying

```
build: "remix build"
watch: "remix watch"
dev: "remix dev"
```
