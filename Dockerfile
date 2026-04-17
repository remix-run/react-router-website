FROM node:24-alpine AS development-dependencies-env
RUN corepack enable
COPY ./package.json pnpm-lock.yaml .npmrc /app/
WORKDIR /app
RUN pnpm install --frozen-lockfile

FROM node:24-alpine AS production-dependencies-env
RUN corepack enable
COPY ./package.json pnpm-lock.yaml .npmrc /app/
WORKDIR /app
RUN pnpm install --frozen-lockfile --prod

FROM node:24-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN corepack enable && pnpm run build

FROM node:24-alpine
RUN corepack enable
COPY ./package.json pnpm-lock.yaml server.js /app/

ENV PORT="8080"
ENV NODE_ENV="production"

COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY --from=build-env /app/start.sh /app/start.sh

WORKDIR /app
CMD ["pnpm", "run", "start"]