ARG base_image=node:16-slim

FROM ${base_image} AS build

WORKDIR /app
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./esbuild.config.ts ./
COPY ./types ./types
COPY ./src ./src

RUN yarn && yarn cache clean

ARG NETWORK

RUN if [ "$NETWORK" = "testnet" ]; then yarn build; fi
RUN if [ "$NETWORK" = "mainnet" ]; then yarn build:prod; fi

FROM nginx
COPY --from=build ./app/dist ./usr/share/nginx/html
