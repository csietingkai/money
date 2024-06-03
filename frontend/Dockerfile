# build environment
FROM node:14.20.0-alpine3.15 as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY . .
RUN npm install
RUN npm run build

# production environment
FROM httpd:2.4.59-alpine3.20
COPY --from=build /app/build /usr/local/apache2/htdocs
EXPOSE 80
CMD ["httpd-foreground"]
