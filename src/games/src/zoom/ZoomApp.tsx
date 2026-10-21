import { useCallback, useRef } from "react";
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
import { Consigne, Image } from "./Jeu";
import { nouvellePartie } from "./partie";
import { REGLES } from "./regles";
import { texte } from "./textes";

export function ZoomApp() {
  return (
    <JeuApp
      titre={texte(langueDuNavigateur(), "titre")}
      rendu={(contexte, nom) => <Salon contexte={contexte} nom={nom} />}
    />
  );
}

function Salon({ contexte, nom }: { contexte: Contexte; nom: string }) {
  const { lang } = contexte;
  const recoitJeu = useRef<(de: string | null, m: MessageJeu) => void>(
    () => undefined,
  );

  const surEvenement = useCallback((evenement: Evenement) => {
    if (evenement.type === "message" && estMessageJeu(evenement.data)) {
      recoitJeu.current(evenement.from, evenement.data);
    }
  }, []);

  const salon = useSalon({ jeu: "zoom", contexte, nom, surEvenement });
  const { moi, joueurs, meneur, etat, erreur } = salon;
  const jeu = useMeneur({
    moi,
    meneur,
    joueurs,
    regles: REGLES,
    envoie: salon.envoie,
  });
  recoitJeu.current = jeu.recoit;

  const { partie } = jeu;
  const maintenant = useMaintenant(partie?.phase === "manche");
  const restantMs = partie
    ? Math.max(0, partie.restantMs - (maintenant - jeu.recuA))
    : 0;
  const devine =
    partie?.phase === "manche" &&
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
          <div className="zone zone-zoom">
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
                restantMs={restantMs}
                nbJoueurs={joueurs.length}
                erreur={jeu.erreur}
                onLance={(duree, manches) =>
                  jeu.lance(() =>
                    catalogue(lang).then(({ champions: liste }) =>
                      nouvellePartie(
                        jeu.presents.current,
                        duree,
                        manches,
                        lang,
                        liste,
                        Math.random,
                      ),
                    ),
                  )
                }
              />
            )}
            <Image lang={lang} partie={partie} restantMs={restantMs} />
            {partie && partie.phase !== "fin" && (
              <Devinette
                lang={lang}
                proche={jeu.proche}
                actif={devine}
                onDevine={jeu.devine}
              />
            )}
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
