# base node image
FROM node:16-bullseye-slim as base

################################################################

# install dependencies
FROM base as deps
ARG REMIX_TOKEN

# set docker working directory, we'll need to this in every stage
WORKDIR /remixapp/

ADD package.json package-lock.json .npmrc ./
RUN npm ci

################################################################

# prune devDependencies
FROM base as production-deps

WORKDIR /remixapp/

# copy all node_modules from deps stage
COPY --from=deps /remixapp/node_modules /remixapp/node_modules
ADD package.json package-lock.json .npmrc /remixapp/
RUN npm prune --production

################################################################

# build app
FROM base as build
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ARG REPO
ENV REPO=$REPO
ARG REPO_DOCS_PATH
ENV REPO_DOCS_PATH=$REPO_DOCS_PATH
ARG REPO_LATEST_BRANCH
ENV REPO_LATEST_BRANCH=$REPO_LATEST_BRANCH

# supplying SKIP_RESET=1 will skip the DB reset and seeding - WILL USE YOUR LOCAL DB
ARG SKIP_RESET="0"

WORKDIR /remixapp/

# copy all node_modules from deps stage
COPY --from=deps /remixapp/node_modules /remixapp/node_modules
ADD package.json .

# schema doesn't change much so these will stay cached
ADD prisma .

# app code changes all the time
ADD . .
# Reset and seed the database only if SKIP_RESET is not set
RUN if [ "$SKIP_RESET" = "1" ]; then echo "SKIPPING DATABASE RESET AND SEED"; else npm run db:reset; fi
RUN npm run build

################################################################

# pruned app build used for running
FROM base
ENV NODE_ENV=production

WORKDIR /remixapp/

# copy files from previous stages
COPY --from=production-deps /remixapp/node_modules /remixapp/node_modules
COPY --from=build /remixapp/node_modules/.prisma /remixapp/node_modules/.prisma
COPY --from=build /remixapp/server /remixapp/server
COPY --from=build /remixapp/public /remixapp/public
ADD . .
USER 1001

CMD ["npm", "run", "start"]
