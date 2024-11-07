ARG base_image=node:18-slim

FROM ${base_image} AS build

WORKDIR /app
COPY ./examples/wCCD/package.json ./package.json
COPY ./examples/wCCD/tsconfig.json ./tsconfig.json
COPY ./examples/wCCD/index.html ./
COPY ./examples/wCCD/vite.config.ts ./
COPY ./examples/wCCD/public ./public
COPY ./examples/wCCD/src ./src

RUN yarn && yarn cache clean

ARG NETWORK

RUN if [ "$NETWORK" = "testnet" ]; then yarn build; fi
RUN if [ "$NETWORK" = "mainnet" ]; then yarn build-prod; fi

FROM nginx
LABEL build_image="${build_image}"
COPY --from=build ./app/dist ./usr/share/nginx/html
COPY ./examples/wCCD/nginx.conf /etc/nginx/conf.d/default.conf
