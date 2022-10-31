FROM node:16-slim AS build
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM httpd:2-alpine
# Override config with patched version that enables 'mod_rewrite'.
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
COPY --from=build /build/build /usr/local/apache2/htdocs
