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
jamais s'allonger. Un fichier neuf n'y entre pas.

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

## Ce qui n'existe pas encore, et qu'il ne faut pas improviser

- **Pas d'`AppShell`, pas de header ni de footer définitifs** : ils dépendent de
  l'authentification Discord (chantier A). En attendant, `ThemeModeToggle` et `LanguageSwitcher`
  sont posés à la main sur les écrans qui en ont besoin.
- **Storybook est destiné à être public.** Aucune donnée réelle dans une story : pas de pseudo
  Discord, pas d'IP, pas de numéro de port réel.
