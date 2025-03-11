# Stage 1: Build the Angular app
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
ARG API_URL
ENV API_URL=${API_URL}
COPY . .
RUN sed -i "s|\\\${API_URL}|${API_URL}|g" src/environments/environment.prod.ts && \
  cat src/environments/environment.prod.ts
RUN npm run build -- --configuration=production --base-href=/ --deploy-url=/

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine
# Copy the Angular build to the persistent volume directory Azure uses
COPY --from=build /app/dist/sai-avenue/browser  /usr/share/nginx/html
# Copy your custom nginx config to override the default config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
