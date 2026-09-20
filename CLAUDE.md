# schub-front-servers — règles du dépôt

## La règle qui prime sur toutes les autres

**Tout ce qui s'affiche passe par `src/design-system/`. `@mui/material` et `@mui/icons-material`
ne s'importent nulle part ailleurs.**

Un écran qui a besoin d'un composant absent du design system l'**ajoute au design system**, avec
sa story — il ne contourne pas. La règle est tenue par ESLint
(`@typescript-eslint/no-restricted-imports` dans `eslint.config.js`) : `npm run lint` échoue sur
un import direct.

`eslint.config.js` contient un bloc nommé **« dette à résorber »** qui liste les écrans écrits
avant le design system. Cette liste doit **rétrécir** au fil des migrations (lot B.5) et ne
jamais s'allonger. Un fichier neuf n'y entre pas. Au 20-09 il n'y reste que `Login.tsx`, que la
PR de la connexion Discord retire de son côté : **le bloc, et la constante avec lui, disparaissent
à la fusion.**

## Les deux autres habitudes à ne pas perdre

- **Aucune chaîne en dur dans l'interface.** Tout texte affiché vient de `t("…")` et vit dans
  `src/locales/{fr,en}/<domaine>.json` — un fichier par langue **et par domaine**. Les clés sont
  typées : une clé inexistante est une erreur de compilation, pas une chaîne affichée telle
  quelle. Les dates et les nombres passent par `useLocaleFormat()` (`Intl`), jamais par une mise
  en forme manuelle.
- **Aucune couleur, aucun rayon, aucune ombre en dur.** Tout vient de
  `src/design-system/tokens.ts`. Une nuance qui manque s'ajoute là-bas.

## Langues

- Le site est bilingue : `/` en français, `/en/…` en anglais. Un nouvel écran est ajouté aux
  routes **une seule fois** (chemins relatifs dans `App.tsx`) et les deux langues le servent.
- Le code, les commentaires, les messages de commit et les PR sont **en français**.

## Commandes

| Commande | Ce qu'elle fait |
|---|---|
| `npm run dev` | serveur de développement Vite |
| `npm run build` | `tsc --noEmit` puis build de production — les deux doivent passer |
| `npm run lint` | ESLint, dont le verrou design system |
| `npm run storybook` | Storybook sur http://localhost:6006 |
| `npm run build-storybook` | Storybook statique dans `storybook-static/` |

## Les droits, dans l'interface

- **`useAuthStore().can("PERMISSION")`, jamais une comparaison de nom de rôle.** Un rôle est
  éditable en base : son nom ne dit plus rien de ce qu'il permet. `isAdmin` n'existe plus.
- **Une entrée de menu n'apparaît que si sa permission est présente**, et la route porte la même
  condition — une URL se tape à la main. La liste vit dans `src/components/AppLayout.tsx`, à un
  seul endroit.
- **L'IHM ne propose pas ce que le serveur refusera** : les rôles attribuables sont filtrés par la
  règle du sous-ensemble, on ne modifie pas son propre rôle et on ne rétrograde pas le dernier
  `OWNER`. C'est le cœur qui tranche ; l'écran évite d'avoir à découvrir le refus.
- **L'absence n'est pas une panne** : sans `SERVER_INFRA_VIEW`, le cœur sert la projection
  membre — ni ports, ni déploiement, ni admins. On le dit à l'écran, et on **omet** ces champs du
  corps envoyé plutôt que de les poster vides.

## La coquille

`AppShell` (design system) porte l'en-tête, le menu *Configuration*, le pied de page et le fond de
marque. Un écran ne repose ni `ThemeModeToggle`, ni `LanguageSwitcher`, ni `PageBackdrop` :
il rend un titre et du contenu. `AppShell` ne teste aucune permission — c'est `AppLayout` qui
décide de ce qu'elle reçoit.

## Les routes, et ce que chacune coûte à charger

| Route | Contenu | Accès |
|---|---|---|
| `/` | le portfolio | public, **chargé d'emblée** |
| `/servers` | l'état public des serveurs | public, à la demande |
| `/contact` | le formulaire | public, à la demande |
| `/storybook` | le design system | public, **hors du routeur React** (nginx) |
| `/config/*` | l'administration | connecté + permission, à la demande |

**Seule la racine est dans le fichier JavaScript initial.** Tout le reste passe par
`React.lazy` dans `App.tsx`. Un écran neuf s'ajoute de la même façon : une visite sur `/` ne doit
embarquer ni formulaire d'administration, ni sa validation.

## Le contenu du portfolio

Il vit dans **`src/content/portfolio.ts`, en données**, pas en JSX — c'est ce qui garde le
pré-rendu de la racine possible plus tard sans réécrire la page. Les deux langues y sont côte à
côte. `PortfolioPage.tsx` ne contient aucune phrase.

Ce qui manque y est **visible**, pas masqué : le paragraphe sur le poste actuel s'affiche en
alerte avec un texte entre crochets, et la page ne se publie pas tant qu'elle est là.
L'adresse e-mail n'est **pas** publiée : le formulaire de contact existe pour la remplacer.

## La route publique de contact

`POST /contact` est la seule route publique qui déclenche une écriture. Trois couches, dont deux
côté front : le champ leurre (`HoneypotField`) et Turnstile **si** `VITE_TURNSTILE_SITE_KEY` est
défini — sans clé, le widget ne rend rien et le formulaire fonctionne. La troisième, la
limitation de débit par IP, est au BFF, où elle ne se contourne pas. **Aucune de ces couches ne
se retire sans en ajouter une autre.**

## Ce qui n'existe pas encore, et qu'il ne faut pas improviser

- **Le cookie `httpOnly`** : lot A.3. Le jeton reste en `Authorization: Bearer` et en
  `localStorage`. Le BFF le réémet dans `X-Auth-Token`, que `httpClient` lit ; un 401 ferme
  la session.
- **La connexion par Discord** : le BFF n'expose pas encore `/auth/discord`, l'écran de connexion
  reste le formulaire local.
- **Storybook est destiné à être public.** Aucune donnée réelle dans une story : pas de pseudo
  Discord, pas d'IP, pas de numéro de port réel.
