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
# Le BFF et le relais visés sont réglables : le dev qui rejoue une release doit viser dev-schub-bff et
# dev-schub-together-games, jamais ceux de prod que publie l'overlay partagé. Le filtre borne la substitution à BFF_ et
# RELAY_ : les $host et $uri de nginx restent intacts.
ENV BFF_UPSTREAM=schub-bff:8080
ENV RELAY_UPSTREAM=schub-together-games:8080
ENV NGINX_ENVSUBST_FILTER=^(BFF|RELAY)_
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY nginx-shared.conf /etc/nginx/templates/shared.inc.template

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
