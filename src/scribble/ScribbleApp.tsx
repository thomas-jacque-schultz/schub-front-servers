import { useCallback, useRef, useState } from "react";
import { catalogue } from "../commun/champions";
import { Devinette, Joueurs, Scores } from "../commun/jeu";
import type { Evenement } from "../commun/relay";
import {
  Bandeau,
  type Contexte,
  ErreurSalon,
  JeuApp,
  useMaintenant,
  useSalon,
} from "../commun/salon";
import { langueDuNavigateur } from "../commun/textes";
import { estMessageJeu, type MessageJeu, useMeneur } from "../commun/useMeneur";
import { Board } from "./Board";
import { Flux } from "./flux";
import { Consigne } from "./Jeu";
import { nouvellePartie, type Partie } from "./partie";
import { nouvelleManche, REGLES } from "./regles";
import { texte } from "./textes";
import { estMorceau, GOMME, type Morceau, Tableau } from "./traits";

const COULEURS = [
  "#F2E9EE",
  "#8A8A8A",
  "#E0576B",
  "#FF8C42",
  "#FFD23F",
  "#C9A227",
  "#8B5A2B",
  "#9BE564",
  "#4FB783",
  "#2E7D32",
  "#3DDBD9",
  "#5B9BE8",
  "#1E3A8A",
  "#8E5CF7",
  "#A4477E",
  "#FF77B7",
];
const EPAISSEURS = [0.004, 0.009, 0.02];

export function ScribbleApp() {
  return (
    <JeuApp
      titre={texte(langueDuNavigateur(), "titre")}
      rendu={(contexte, nom) => <Salon contexte={contexte} nom={nom} />}
    />
  );
}

function Salon({ contexte, nom }: { contexte: Contexte; nom: string }) {
  const { lang } = contexte;
  const tableau = useRef(new Tableau()).current;
  const recus = useRef(new Flux<Morceau>()).current;
  const [version, setVersion] = useState(0);
  const [couleur, setCouleur] = useState(COULEURS[0]);
  const [epaisseur, setEpaisseur] = useState(EPAISSEURS[1]);
  const enPartie = useRef<{ current: Partie | null }>({ current: null });
  const recoitJeu = useRef<(de: string | null, m: MessageJeu) => void>(
    () => undefined,
  );

  const vide = useCallback(() => {
    tableau.vide();
    setVersion((v) => v + 1);
  }, [tableau]);

  const surEvenement = useCallback(
    (evenement: Evenement) => {
      switch (evenement.type) {
        case "joined":
          tableau.vide();
          evenement.history
            .filter(estMorceau)
            .forEach((morceau) => tableau.ajoute(morceau));
          setVersion((v) => v + 1);
          break;
        case "message": {
          const p = enPartie.current.current;
          if (estMessageJeu(evenement.data)) {
            recoitJeu.current(evenement.from, evenement.data);
          } else if (
            estMorceau(evenement.data) &&
            (!p || (p.phase === "dessin" && evenement.from === p.dessinateur))
          ) {
            recus.emet(evenement.data);
          }
          break;
        }
        case "cleared":
          vide();
          break;
      }
    },
    [recus, tableau, vide],
  );

  const salon = useSalon({ jeu: "scribble", contexte, nom, surEvenement });
  const { moi, joueurs, meneur, etat, erreur, efface } = salon;

  const effaceTout = useCallback(() => {
    efface();
    vide();
  }, [efface, vide]);

  const jeu = useMeneur({
    moi,
    meneur,
    joueurs,
    regles: REGLES,
    envoie: salon.envoie,
    surPublication: (avant, apres) => {
      if (nouvelleManche(avant, apres)) {
        effaceTout();
      }
    },
  });
  recoitJeu.current = jeu.recoit;
  enPartie.current = jeu.courante;

  const { partie } = jeu;
  const maintenant = useMaintenant(
    partie?.phase === "choix" || partie?.phase === "dessin",
  );

  // Tout le monde dessine en attendant la première partie ; ensuite, le dessinateur seul, et personne à la fin.
  const dessinable =
    !partie || (partie.phase === "dessin" && partie.dessinateur === moi);
  const devine =
    partie?.phase === "dessin" &&
    partie.devineurs.includes(moi) &&
    !partie.trouve.includes(moi);

  return (
    <main className="salon">
      <Bandeau
        titre={texte(lang, "titre")}
        lang={lang}
        room={salon.room}
        hote={contexte.hote}
      />

      {etat === "erreur" && erreur ? (
        <ErreurSalon lang={lang} erreur={erreur} onNouveau={salon.nouveau} />
      ) : (
        <div className="jeu">
          <div className="zone">
            {etat !== "salon" && (
              <p className="etat">
                {texte(
                  lang,
                  etat === "reconnexion" ? "reconnexion" : "connexion",
                )}
              </p>
            )}
            {etat === "salon" && (
              <Consigne
                lang={lang}
                partie={partie}
                moi={moi}
                estMeneur={jeu.estMeneur}
                restantMs={
                  partie
                    ? Math.max(0, partie.restantMs - (maintenant - jeu.recuA))
                    : 0
                }
                nbJoueurs={joueurs.length}
                erreur={jeu.erreur}
                onLance={(duree, tours) =>
                  jeu.lance(() =>
                    catalogue(lang).then(({ version, champions }) =>
                      nouvellePartie(
                        jeu.presents.current,
                        duree,
                        tours,
                        lang,
                        version,
                        champions,
                        Math.random,
                      ),
                    ),
                  )
                }
                onChoisis={jeu.agit}
              />
            )}
            <Board
              tableau={tableau}
              actif={dessinable}
              couleur={couleur}
              epaisseur={epaisseur}
              version={version}
              auteur={moi}
              onMorceau={(morceau) => salon.envoie(morceau, true)}
              recus={recus}
            />
            {partie && partie.phase !== "fin" && (
              <Devinette
                lang={lang}
                proche={jeu.proche}
                actif={devine}
                cache={partie.dessinateur === moi && partie.phase !== "bilan"}
                onDevine={jeu.devine}
              />
            )}
            <div className={dessinable ? "outils" : "outils cache"}>
              {COULEURS.map((c) => (
                <button
                  key={c}
                  className={c === couleur ? "couleur choisie" : "couleur"}
                  style={{ background: c }}
                  aria-label={c}
                  onClick={() => setCouleur(c)}
                />
              ))}
              <span className="separateur" />
              {EPAISSEURS.map((e) => (
                <button
                  key={e}
                  className={
                    e === epaisseur ? "epaisseur choisie" : "epaisseur"
                  }
                  aria-label={`${texte(lang, "epaisseur")} ${e}`}
                  onClick={() => setEpaisseur(e)}
                >
                  <span
                    style={{ width: `${e * 600}px`, height: `${e * 600}px` }}
                  />
                </button>
              ))}
              <button
                className={couleur === GOMME ? "discret choisie" : "discret"}
                onClick={() => setCouleur(GOMME)}
              >
                {texte(lang, "gomme")}
              </button>
              <span className="separateur" />
              <button className="discret" onClick={effaceTout}>
                {texte(lang, "effacer")}
              </button>
            </div>
          </div>
          <aside className="joueurs">
            {partie ? (
              <Scores
                lang={lang}
                scores={partie.scores}
                noms={partie.noms}
                fil={partie.fil}
                trouve={partie.phase === "fin" ? [] : partie.trouve}
                joueurs={joueurs}
                moi={moi}
                meneur={meneur}
                etiquette={(id) =>
                  partie.phase !== "fin" && id === partie.dessinateur
                    ? texte(lang, "dessinateur")
                    : null
                }
              />
            ) : (
              <Joueurs
                lang={lang}
                joueurs={joueurs}
                moi={moi}
                meneur={meneur}
              />
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
