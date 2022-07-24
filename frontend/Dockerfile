# build environment
FROM node:14.20.0-alpine3.15 as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY . .
RUN npm install
RUN npm run build

# production environment
FROM nginx:1.19.4-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
