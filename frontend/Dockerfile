# build environment
FROM node:18.12.0-alpine3.16 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production environment
FROM httpd:2.4.59-alpine3.20
COPY --from=builder /app/build /usr/local/apache2/htdocs
EXPOSE 80
CMD ["httpd-foreground"]
