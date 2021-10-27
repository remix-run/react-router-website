# base node image
FROM node:16-bullseye-slim as base

ARG REMIX_TOKEN
ENV REMIX_TOKEN=$REMIX_TOKEN

# install open ssl for prisma
RUN apt-get update && apt-get install -y openssl

# install all node_modules, including dev
FROM base as deps

WORKDIR /remixapp/

ADD package.json package-lock.json .npmrc ./
RUN npm install --production=false

# setup production node_modules
FROM base as production-deps

ARG REMIX_TOKEN
ENV REMIX_TOKEN=$REMIX_TOKEN

WORKDIR /remixapp/

COPY --from=deps /remixapp/node_modules /remixapp/node_modules
ADD package.json package-lock.json .npmrc /remixapp/
RUN npm prune --production

# build remixapp
FROM base as build

ARG REMIX_TOKEN
ENV REMIX_TOKEN=$REMIX_TOKEN
ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA

WORKDIR /remixapp/

COPY --from=deps /remixapp/node_modules /remixapp/node_modules

# schema doesn't change much so these will stay cached
ADD prisma .
RUN npx prisma generate

# app code changes all the time
ADD . .
RUN npm run build

# build smaller image for running
FROM base

ENV NODE_ENV=production

WORKDIR /remixapp/

COPY --from=production-deps /remixapp/node_modules /remixapp/node_modules
COPY --from=build /remixapp/node_modules/.prisma /remixapp/node_modules/.prisma
COPY --from=build /remixapp/public /remixapp/public
COPY --from=build /remixapp/server /remixapp/server
ADD . .

CMD ["npm", "run", "start"]
