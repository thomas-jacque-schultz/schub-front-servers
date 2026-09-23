FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm install

FROM deps AS build-app
WORKDIR /app
COPY . .
RUN npm run build

# Étape séparée : les artefacts du Storybook ne doivent jamais se mêler à dist/, servi à la racine.
FROM deps AS build-storybook
WORKDIR /app
COPY . .
RUN npm run build-storybook

FROM nginx:1.27-alpine
COPY --from=build-app /app/dist /usr/share/nginx/html
COPY --from=build-storybook /app/storybook-static /usr/share/nginx/html/storybook
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
