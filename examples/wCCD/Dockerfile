ARG base_image=node:16-slim

FROM ${base_image} AS build

WORKDIR /app
COPY ./package_docker.json ./package.json
COPY ./tsconfig_docker.json ./tsconfig.json
COPY ./esbuild.config.ts ./
COPY ./types ./types
COPY ./src ./src

RUN yarn && yarn cache clean
RUN yarn build

FROM nginx
COPY --from=build ./app/dist ./usr/share/nginx/html
