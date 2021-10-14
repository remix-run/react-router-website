# We have 3 stages to our dockerfile
# one for installing dependencies, one for building (and seeding the db), and one for running

# Install dependencies only when needed
FROM node:15-alpine AS deps
ARG REMIX_TOKEN
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
# We're gonna need sqlite to use sqlite :)
RUN apk add --no-cache sqlite
WORKDIR /remixapp
COPY .npmrc package.json package-lock.json ./
RUN npm ci

################################################################

# Rebuild the source code only when needed
FROM node:15-alpine AS builder
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
WORKDIR /remixapp
COPY . .
COPY --from=deps /remixapp/node_modules ./node_modules
# Seed the database - comment this out if you don't want to seed the database
RUN npm run db:reset -- --force
RUN npm run build

################################################################

# Production image, copy all the files and run our server
FROM node:15-alpine AS runner
WORKDIR /remixapp
ENV NODE_ENV production

COPY --from=builder /remixapp/public ./public
COPY --from=builder /remixapp/server ./server
COPY --from=builder /remixapp/node_modules ./node_modules
COPY --from=builder /remixapp/package.json ./package.json
COPY --from=builder /remixapp/prisma ./prisma
COPY --from=builder /remixapp/md ./md

RUN addgroup -g 1001 -S nodejs
RUN adduser -S remix -u 1001
RUN chown -R remix:nodejs /remixapp/server
RUN chown -R remix:nodejs /remixapp/prisma
USER remix

EXPOSE 3000

CMD ["npm", "start"]
