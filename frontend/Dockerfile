# build environment
FROM node:24.16.0-alpine3.24 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production environment
FROM httpd:2.4.68-alpine3.24
COPY --from=builder /app/build /usr/local/apache2/htdocs
EXPOSE 80
CMD ["httpd-foreground"]
