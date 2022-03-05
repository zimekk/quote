FROM node:12-alpine

ENV WORKDIR=/app
WORKDIR $WORKDIR

COPY package.json tsconfig.json yarn.lock ./
COPY packages/api/package.json packages/api/
COPY packages/app/package.json packages/app/
COPY packages/cli/package.json packages/cli/
COPY packages/web/package.json packages/web/
RUN yarn --frozen-lockfile

COPY packages/ packages/
RUN yarn build

ENV PORT 8080
EXPOSE $PORT
CMD ["yarn", "serve"]
