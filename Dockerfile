# Les dépendances, installées UNE fois et partagées par les deux constructions.
#
# Sans cette étape commune, l'ajout du Storybook doublait le `npm install` : deux fois deux
# minutes, pour le même arbre de modules.
FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm install

# L'application. C'est elle, et elle seule, qui remplit la racine du site servi.
FROM deps AS build-app
WORKDIR /app
COPY . .
RUN npm run build

# Le Storybook, dans une étape SÉPARÉE et c'est le point important.
#
# Construit dans la même étape que l'application, ses 7 Mo d'artefacts et ses fichiers
# intermédiaires se seraient retrouvés mêlés à `dist/`, donc servis depuis la racine du domaine.
# Ici, les deux sorties ne se croisent jamais : l'image finale copie `dist/` à la racine et
# `storybook-static/` dans un sous-répertoire, et rien d'autre ne suit. `.dockerignore` exclut
# déjà `dist` et `storybook-static` du contexte, de sorte qu'un build local traînant ne peut pas
# être embarqué par accident.
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
