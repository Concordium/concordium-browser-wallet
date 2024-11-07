ARG base_image=node:18-slim

FROM ${base_image} AS build

WORKDIR /app
COPY ./examples/voting/package.json ./package.json
COPY ./examples/voting/tsconfig.json ./tsconfig.json
COPY ./examples/voting/index.html ./
COPY ./examples/voting/vite.config.ts ./
COPY ./examples/voting/public ./public
COPY ./examples/voting/src ./src

RUN yarn && yarn cache clean
RUN yarn build

FROM nginx
LABEL build_image="${build_image}"
COPY --from=build ./app/dist ./usr/share/nginx/html
COPY ./examples/voting/nginx.conf /etc/nginx/conf.d/default.conf
