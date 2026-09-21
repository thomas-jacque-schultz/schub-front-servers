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
  membre — ni ports, ni déploiement. On le dit à l'écran, et on **omet** ces champs du
  corps envoyé plutôt que de les poster vides.

## La coquille

`AppShell` (design system) porte l'en-tête, le menu *Configuration*, le pied de page et le fond de
marque. Un écran ne repose ni `ThemeModeToggle`, ni `LanguageSwitcher`, ni `PageBackdrop` :
il rend un titre et du contenu. `AppShell` ne teste aucune permission — c'est `AppLayout` qui

**La largeur du bandeau est décidée par `AppLayout`, pas par les écrans.** `/lol/*` reçoit `xl` —
cinq colonnes de statistiques et un tableau de parties deviennent illisibles resserrés dans `lg` ;
les pages de texte, `/contact` en tête, restent en `lg` parce qu'une ligne de prose trop longue se
relit mal. Élargir partout aurait échangé un défaut contre un autre.

**Cinq colonnes se déclarent, elles ne s'espèrent pas.** `Columns` en `auto-fit` replie dès que
`count × minWidth` dépasse le conteneur, et la cinquième part seule à la ligne. Les grilles qui
doivent tenir une ligne passent `count={5}` ; le repli reste en dessous du point de rupture.

**Un tableau dont les colonnes dansent se corrige dans `DataTable`, pas dans l'écran.**
`layout="fixed"` avec des largeurs déclarées : en largeur automatique, une cellule plus longue
dans une ligne élargit la colonne pour toutes, et un rechargement redistribue tout.
décide de ce qu'elle reçoit.

## Les routes, et ce que chacune coûte à charger

| Route | Contenu | Accès |
|---|---|---|
| `/` | la page produit de Schub, plus la liste d'onboarding | public, **chargé d'emblée** |
| `/servers` | l'état des serveurs, et démarrer/arrêter | public, à la demande |
| `/contact` | le contenu personnel, puis le formulaire en bas | public, à la demande |
| `/storybook` | le design system | public, **hors du routeur React** (nginx) |
| `/config/*` | l'administration | connecté + permission, à la demande |
| `/lol`, `/lol/teams/:id` | les équipes LoL | connecté, à la demande |
| `/profile` | Mon profil : Discord, nom, compte Riot | connecté, à la demande |
| `/lol/stats` | Mes stats — ses parties, ses champions, ses postes | connecté, à la demande |

**Seule la racine est dans le fichier JavaScript initial.** Tout le reste passe par
`React.lazy` dans `App.tsx`. Un écran neuf s'ajoute de la même façon : une visite sur `/` ne doit
embarquer ni formulaire d'administration, ni sa validation.

## L'accueil, et le contenu personnel

**`/` est la page produit de Schub**, pas un CV : ce que fait l'outil, puis **la liste de ce qui
reste à faire pour s'en servir**. Les actions sont **déduites de `GET /me`** — compte Riot non
lié, résolution en attente, collecte en cours, nom d'affichage non choisi — et chacune mène à
`/profile`. Elles ne se devinent pas : `displayNameChosen` est un fait servi par le cœur, parce
que comparer le nom affiché au pseudo Discord proposerait « choisis ton nom » à qui l'a choisi.
Un **visiteur non connecté** ne voit pas une liste vide mais la seule action qui le concerne : se
connecter.

**Le contenu personnel vit sur `/contact`** — accroche, projets, parcours, formation, langues —
et le formulaire est en bas de cette page, sous le titre *Feedback*. Il vit dans
**`src/content/portfolio.ts`, en données**, pas en JSX : c'est ce qui garde un pré-rendu possible
plus tard sans réécrire la page. Les deux langues y sont côte à côte, et `PortfolioSections.tsx`
ne contient aucune phrase.

Ce qui manque y est **visible**, pas masqué : le paragraphe sur le poste actuel s'affiche en
alerte avec un texte entre crochets, et **l'alerte a suivi le contenu** — elle dit que cette
page-là n'est pas publiable, ce qui reste vrai. L'adresse e-mail n'est **pas** publiée : le
formulaire existe pour la remplacer.

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

Cinq onglets : effectif, joueurs, équipe, pool de champions, préparateur de draft — tous servis.
**Aucune donnée simulée n'entre nulle part**, ni dans un panneau, ni dans une story : un chiffre
inventé est lu comme vrai, et il survit à celui qui l'a posé.

**Le pool répond « ce qu'on peut aligner à ce poste », pas « ce que chacun maîtrise ».** Le choix
des champions par poste **appartient à l'équipe** et vit dans le cœur : ce n'est pas un filtre
d'affichage, et le refaire côté écran le ferait disparaître au rechargement. Le catalogue complet
arrive **avec** le panneau et non par une route à part — deux appels, ce sont deux patches
possibles, donc des icônes et des champions retenus qui ne parlent pas de la même version.

**Le plancher de maîtrise appartient lui aussi à l'équipe.** On peut en essayer un autre pour
voir : cette lecture n'écrit rien, et l'écran dit lequel des deux il montre. S'il vivait dans
l'écran de chacun, deux membres liraient deux listes en croyant parler de la même chose.

**Un membre tient plusieurs postes.** Il apparaît donc dans plusieurs colonnes du pool et il est
candidat à plusieurs lignes d'une composition — que le cœur ne lui en accorde qu'une. Le premier
poste déclaré est le poste habituel, et c'est lui qui range l'effectif.

**Un membre dont on ne sait pas les maîtrises est dit au niveau de sa colonne**, une fois, avec la
raison — jamais répété sous chaque champion, jamais retiré. Et une liste vide sous un champion se
lit autrement selon sa cause : personne au-dessus du plancher, ou personne ne l'a jamais joué.

**Désigner un compte Riot passe par `RiotAccountPicker`**, partagé par le profil et l'ajout d'un
membre. Deux champs libres laissaient écrire un Riot ID qui n'existe pas, et le refus n'arrivait
qu'à l'enregistrement.

## Les statistiques

- **`/me/stats` n'a pas d'équivalent ciblé, et n'en aura pas.** Il n'existe aucune route portant
  un identifiant de joueur : il suffirait d'un identifiant croisé dans une réponse d'équipe pour
  sonder l'historique de n'importe qui. Les deux panneaux d'équipe passent par `TEAM_VIEW` sur
  l'équipe visée, et le cœur ne rend aucun `puuid`.
- **Aucune moyenne mondiale.** Elle n'est pas accessible — ni quota, ni droit de collecte — et on
  ne l'invente pas. Un groupe se compare au **reste des parties du même joueur** et à ses
  **coéquipiers** : « 55 % sur Jayce » ne dit rien, « 55 % sur Jayce contre 41 % sur le reste »
  dit beaucoup.
- **Un chiffre dit toujours sur quoi il porte** : nombre de parties et période. Sans ça, trois
  parties et trois cents se lisent pareil. L'historique Riot est borné à environ mille parties
  par joueur, et l'écran le dit.
- **Un vide n'est pas un zéro.** Chaque colonne porte un `state` qui dit *pourquoi* elle est
  vide — compte non lié, collecte en cours, aucune partie, effectif incomplet, connecteur muet —
  et tout ratio sans dénominateur s'affiche en tiret.
- **Une partie d'équipe = au moins quatre des membres, toutes files confondues.** Le mode de jeu
  est affiché et compté à part, il ne filtre rien. Une partie où les membres étaient dans les
  deux camps compte comme partie et pas comme résultat.
- **Une file se dit par son mode, jamais par son numéro.** Le connecteur nomme les `queueId` à
  partir de la liste officielle de Riot et sert un nom de mode ; le front le traduit sous
  `queue.<MODE>`. Plusieurs identifiants donnent le même mode — l'arène en a deux — donc le
  regroupement se fait sur le mode. Un mode inconnu de cette version rend « autre mode », pas une
  clé brute.
- **Les graphiques sont à série unique**, une seule teinte (`chartColors` dans les tokens). Le
  vert et le teal du thème sont indistinguables pour une vision deutéranope — vérifié — donc
  aucune palette catégorielle ici, et un écart se lit à son signe avant sa couleur.

## Mon profil et le compte Riot

- **`/me` n'est pas `/auth/me`.** Le second lit le *jeton* et dit ce que le BFF appliquera ; le
  premier lit le cœur et dit ce qui est vrai — avatar, nom choisi, état Riot. Le jeton ne peut
  porter aucun des trois. Le compte Riot, lui, vit sous `/users/me/riot-account` : c'est le
  découpage du cœur, et le front ne le réécrit pas. Le profil est chargé une fois dans
  `profileStore` et partagé — le menu, l'écran de profil et l'écran de stats en dépendent tous
  les trois.
- **Aucune permission sur ces routes** : la ressource est le lecteur. Exiger `USER_VIEW` sur son
  propre profil fermerait le site à tout compte neuf, qui est `VISITEUR`. Côté BFF, les routes
  Riot cohabitent avec l'administration des comptes dans `UserProxyController` : un test
  distingue les deux, parce que rien dans le fichier ne le fait.
- **Pas de déliaison.** Ni le cœur, ni le BFF, ni l'écran : délier laisserait sans personne les
  places d'équipe qui référencent le compte. Le geste est le **changement**, et il affiche ce
  qu'il coûte.
- **Le changement se confirme sur un 409.** Il n'existe aucune route de prévisualisation : un
  `PUT` sans `confirmChange` répond 409 **en portant** l'objet `change`. Le refus est donc
  l'information, et il devient impossible de confirmer un changement dont on n'a pas reçu les
  conséquences — la garantie est structurelle, pas une discipline à tenir. Attention : **deux 409
  différents**, et ils demandent des gestes opposés — « déjà pris par quelqu'un d'autre » ne porte
  pas de `change`.
- **Les conséquences sont des faits, jamais des phrases** : un serveur ne peut pas servir une
  phrase sur un site bilingue. Un champ absent ou faux ne produit aucune ligne — on n'invente pas
  un nombre de parties ni une durée.
- **L'API Riot ne sait pas chercher par pseudo partiel.** Les suggestions viennent de nos propres
  participations. **Une liste vide est l'état normal au démarrage**, pas une panne, et la saisie
  exacte `Pseudo#TAG` reste ouverte en permanence — c'est elle le chemin, la recherche est une
  aide. Chaque proposition porte `mine` et `alreadyLinked`, des faits servis par le cœur : on
  ne compare aucun identifiant pour se reconnaître.
- **Trois états Riot, pas un booléen** : `ABSENT`, `EN_ATTENTE_DE_RESOLUTION`, `RESOLU`.
  L'intermédiaire s'explique et se relance — rejouer le même Riot ID suffit, la route est
  idempotente. Et `riot.ingest` à `null` veut dire « on ne sait pas », jamais « rien en
  attente » : les confondre ferait disparaître l'indicateur au moment où l'on ne sait plus rien.
- **Après toute liaison réussie, `POST /teams/claim`.** C'est lui qui rattache les places
  d'effectif laissées à ce Riot ID, et qui les resynchronise après un changement. Son échec ne
  remet pas la liaison en cause.
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

Il n'y a **pas d'administrateur par serveur** : un modérateur pilote tous les serveurs de jeu, par
son rôle. Démarrer et arrêter s'affichent donc dès que le rôle porte `SERVER_START` *et*
`SERVER_STOP` — les deux, parce que les deux boutons vont ensemble dans une carte.

**Ils vivent sur `/servers`, pas sous *Configuration*.** Ce menu exige `SERVER_CREATE`,
`SERVER_EDIT` ou `SERVER_INFRA_VIEW`, qu'un modérateur n'a pas : les y laisser seuls lui donnait
des permissions sans aucun écran pour s'en servir. `/servers` lit `GET /game-servers` quand on est
connecté — seule réponse portant le slug — et la vue publique sinon.

## La revue par joueur

Une note s'attache à **une partie d'équipe** et à **une place** de l'effectif ; elle s'ouvre
depuis le tableau des parties du panneau *Équipe*.

- **Qui écrit sur qui vient de deux faits sur le lecteur** — `viewerCanReviewAnyone` et
  `viewerMemberId` — plus `viewerCanEdit` sur chaque note. Aucune comparaison d'identifiants, et
  aucune liste d'ayants droit : c'est la règle du §A.5 bis, appliquée ici comme ailleurs.
- **Les sujets proposés sont les joueurs présents dans cette partie.** Le cœur en accepterait
  davantage — n'importe quel joueur de l'effectif — mais noter quelqu'un sur une partie qu'il n'a
  pas jouée n'est pas un débrief. L'IHM propose donc **moins** que le serveur, jamais plus.
- **Une note par auteur, par joueur et par partie.** Une seconde tentative revient en 409 ; la
  note existante se modifie, elle ne se double pas.
