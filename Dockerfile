# base node image
FROM node:16-bullseye-slim as base

RUN apt-get update && apt-get install -y openssl

# install all node_modules, including dev
FROM base as deps

WORKDIR /remixapp/

ADD package.json package-lock.json .npmrc ./
RUN npm install --production=false

# setup production node_modules
FROM base as production-deps

WORKDIR /remixapp/

COPY --from=deps /remixapp/node_modules /remixapp/node_modules
ADD package.json package-lock.json .npmrc /remixapp/
RUN npm prune --production

# build remixapp
FROM base as build

ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

WORKDIR /remixapp/

COPY --from=deps /remixapp/node_modules /remixapp/node_modules

# schema doesn't change much so these will stay cached
ADD prisma .
RUN npx prisma migrate reset --force --skip-seed
RUN npx prisma generate

# remixapp code changes all the time
ADD . .
RUN npm run build

# build smaller image for running
FROM base

ENV NODE_ENV=production

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

WORKDIR /remixapp/

COPY --from=production-deps /remixapp/node_modules /remixapp/node_modules
COPY --from=build /remixapp/node_modules/.prisma /remixapp/node_modules/.prisma
COPY --from=build /remixapp/public /remixapp/public
COPY --from=build /remixapp/server /remixapp/server
COPY --from=build /remixapp/prisma /remixapp/prisma
ADD . .

CMD ["npm", "run", "start"]
