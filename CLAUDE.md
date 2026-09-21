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
| `/lol`, `/lol/teams/:id` | les équipes LoL | connecté, à la demande |
| `/profile` | Mon profil : Discord, nom, compte Riot | connecté, à la demande |
| `/lol/stats` | Mes stats — l'accès et l'attente, pas les graphiques | connecté, à la demande |

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

- **Le retrait du compte local** : lot A.6. `POST /auth/login` et le formulaire mot de passe
  existent encore, volontairement — c'est la porte de service, et elle ne se démonte qu'une
  fois la connexion Discord vérifiée EN PROD.
- **Storybook est destiné à être public.** Aucune donnée réelle dans une story : pas de pseudo
  Discord, pas d'IP, pas de numéro de port réel.

## Les équipes (chantier D)

`/lol` liste mes équipes, `/lol/teams/:id` ouvre la page à quatre panneaux. Deux choses à ne pas
défaire :

- **Ce qu'un écran propose vient des `viewerCanEdit`, `viewerCanEditCompositions` et
  `viewerMemberId`** servis par le cœur. On ne recalcule rien à partir d'identifiants : c'est
  exactement la comparaison qui répondait faux au §A.5 bis. La seule autorisée est
  `member.memberId === team.viewerMemberId`, pour se surligner — un fait sur le lecteur.
- **`TEAM_VIEW`, `TEAM_EDIT` et `COMPOSITION_EDIT` sont à portée d'équipe** : elles viennent de
  l'appartenance à une équipe, pas du rôle, donc le jeton ne les porte pas. Ni la route ni le
  menu ne peuvent les exiger — la route demande d'être connecté, le menu se contente de
  `TEAM_CREATE` ou `TEAM_VIEW`. Le BFF fait de même et le cœur tranche.

Les panneaux **joueurs** et **pool de champions** sont volontairement vides, en attendant
l'ingestion Riot. **Aucune donnée simulée n'y entre**, même « pour voir » : un chiffre inventé
est lu comme vrai, et il survit à celui qui l'a posé.

## Mon profil et le compte Riot

- **`/users/me` n'est pas `/auth/me`.** Le second lit le *jeton* et dit ce que le BFF
  appliquera ; le premier lit le cœur et dit ce qui est vrai — avatar, nom choisi, état Riot. Le
  jeton ne peut porter aucun des trois. Le profil vit dans `profileStore`, chargé une fois et
  partagé : le menu, l'écran de profil et l'écran de stats en dépendent tous les trois.
- **Aucune permission sur ces routes** : la ressource est le lecteur. Exiger `USER_VIEW` sur son
  propre profil fermerait le site à tout compte neuf, qui est `VISITEUR`.
- **Pas de bouton « délier ».** Le cœur porte un `DELETE`, le BFF ne le proxifie pas et l'écran
  ne l'offre pas : délier laisserait sans personne les places d'équipe qui référencent le compte.
  Le geste est le **changement**, et il affiche ce qu'il coûte.
- **Les conséquences d'un changement viennent du cœur, en faits et non en phrases** : un serveur
  ne peut pas servir une phrase sur un site bilingue. Un champ absent ne produit aucune ligne —
  on n'invente pas un nombre de parties perdues.
- **L'API Riot ne sait pas chercher par pseudo partiel.** Les suggestions viennent de nos propres
  participations. **Une liste vide est l'état normal au démarrage**, pas une panne, et la saisie
  exacte `Pseudo#TAG` reste ouverte en permanence — c'est elle le chemin, la recherche est une
  aide.
- **Trois états Riot, pas un booléen** : `ABSENT`, `EN_ATTENTE_DE_RESOLUTION`, `RESOLU`.
  L'intermédiaire s'explique et se relance (rejouer le même Riot ID suffit, la route est
  idempotente). Et `riot.ingest` à `null` veut dire « on ne sait pas », jamais « rien en
  attente » : les confondre ferait disparaître l'indicateur au moment où l'on ne sait plus rien.
- **`Mes stats` est grisée, pas masquée ni désactivée.** Masquée, elle ferait croire que la
  fonctionnalité n'existe pas ; désactivée, elle ne dirait pas pourquoi. Elle reste un lien, le
  motif est lisible au survol **et** annoncé aux lecteurs d'écran, et la route redit la raison —
  une URL se tape à la main.

## La session

**Le front ne voit pas le jeton, ne le stocke pas et ne l'envoie pas.** Il vit dans un cookie
`httpOnly` posé par le BFF (décision n°4 du 18-09). Ce qui en découle, et qu'il ne faut pas
défaire :

- `httpClient` passe `credentials: "include"` et ne pose **aucun** en-tête `Authorization`.
  Ajouter un `Bearer` quelque part « pour que ça marche » marcherait — le BFF l'accepte encore le
  temps de la transition — et rouvrirait exactement ce que la décision ferme.
- L'état connecté vient **uniquement** de `GET /auth/me`. Il n'y a pas de second endroit à
  consulter, et aucun `accessToken` dans `authStore`.
- La **déconnexion est une requête** : `POST /auth/logout`. Un cookie `httpOnly` est ineffaçable
  depuis le front ; vider l'état local ne déconnecte personne.
- La **réémission glissante** (décision n°3) est invisible ici : le serveur repose le cookie de
  lui-même. Il n'y a rien à lire, ni `X-Auth-Token`, ni autre chose.
- Un **401 ferme la session** — mais seulement si une session était ouverte : le premier
  `/auth/me` d'un visiteur anonyme répond 401, et c'est la réponse normale.

La connexion Discord (`GET /auth/discord`) est une **navigation de navigateur**, jamais un
`fetch` : la route répond une 302 vers discord.com. Le formulaire mot de passe reste en place
jusqu'au lot A.6.

## Les droits liés à un serveur

`viewerIsAdmin` est servi par le cœur sur les deux projections connectées et dit au lecteur s'il
est administrateur de **ce** serveur-là. Démarrer et arrêter se proposent donc serveur par
serveur : rôle portant `SERVER_START` *et* `SERVER_STOP`, **ou** `viewerIsAdmin` (décision n°11).
Un booléen global serait faux dans les deux sens.
