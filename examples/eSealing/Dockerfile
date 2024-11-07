ARG base_image=node:18-slim

FROM ${base_image} AS build

WORKDIR /app
COPY ./examples/eSealing/package.json ./package.json
COPY ./examples/eSealing/tsconfig.json ./tsconfig.json
COPY ./examples/eSealing/index.html ./
COPY ./examples/eSealing/vite.config.ts ./
COPY ./examples/eSealing/public ./public
COPY ./examples/eSealing/src ./src

RUN yarn && yarn cache clean
RUN yarn build

FROM nginx
LABEL build_image="${build_image}"
COPY --from=build ./app/dist ./usr/share/nginx/html
COPY ./examples/eSealing/nginx.conf /etc/nginx/conf.d/default.conf
