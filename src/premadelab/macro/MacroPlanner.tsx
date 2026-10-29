import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  IconButton,
  MacroMap,
  SideLayout,
  Stack,
  Text,
  ToolPanel,
  inkWidths,
  useCurrentLanguage,
  useLocaleFormat,
  useRequest,
  type MacroCursor,
  type MacroPointer,
  type MapPoint,
} from "../../common";
import { REPERES, VITESSE_PAR_DEFAUT } from "../ruler";
import { chargerChampions } from "../rulerChampions";
import {
  ChampionPicker,
  ChampionSpells,
  type PorteeTracee,
} from "../pages/ruler/ChampionRanges";
import type { Element } from "./plan";
import type { MacroPlan } from "./useMacroPlan";
import { MENUS, OUTILS, outilDe } from "./outils/registre";
import { dessineElement } from "./outils/rendus";
import { mesureActive } from "./outils/mesure";
import type {
  CleOutil,
  Contexte,
  ContexteRendu,
  Geste,
  Reglages,
} from "./outils/outil";
import { DessinReglages } from "./reglages/DessinReglages";
import { IconesReglages } from "./reglages/IconesReglages";
import { MesureLue, MesureReglages } from "./reglages/MesureReglages";

const REGLAGES_DE_DEPART: Reglages = {
  encre: "#5B9BE8",
  epaisseur: inkWidths[1],
  aimant: true,
  rayon: 1000,
  icone: "ward",
  camp: null,
  vision: true,
};

const saisieEnCours = (cible: EventTarget | null) =>
  cible instanceof HTMLElement &&
  (cible.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(cible.tagName));

export interface MacroPlannerProps {
  macro: MacroPlan;
  /** Au-dessus de la carte : le plan de l'équipe, les membres présents. */
  header?: ReactNode;
  cursors?: readonly MacroCursor[];
  /** Le curseur de ce membre, à montrer aux autres ; null quand il quitte la carte. */
  onCursor?: (point: MapPoint | null) => void;
}

/**
 * Le Macro Planner (Schub#166) : la carte, et à droite les outils par menu. Le même composant sert seul sur /ruler et
 * à plusieurs dans l'équipe ; seul change le canal derrière \`macro\`.
 */
export function MacroPlanner({
  macro,
  header,
  cursors,
  onCursor,
}: MacroPlannerProps) {
  const { t } = useTranslation("lol");
  const { formatNumber } = useLocaleFormat();
  const langue = useCurrentLanguage();
  const catalogue = useRequest(`ddragon/${langue}`, () =>
    chargerChampions(langue),
  );
  const [cle, setCle] = useState<CleOutil>("mesure");
  const outil = outilDe(cle);
  const [reglages, setReglages] = useState<Reglages>(REGLAGES_DE_DEPART);
  const regle = (changement: Partial<Reglages>) =>
    setReglages((avant) => ({ ...avant, ...changement }));
  const [vitesseSaisie, setVitesseSaisie] = useState(
    String(VITESSE_PAR_DEFAUT),
  );
  const [championId, setChampionId] = useState<string | null>(null);
  const champion =
    catalogue.data?.champions.find((candidat) => candidat.id === championId) ??
    null;
  const [tracee, setTracee] = useState<PorteeTracee | null>(null);
  const [aEffacer, setAEffacer] = useState(false);
  const geste = useRef<Geste | null>(null);
  const [, setImage] = useState(0);
  const redessine = () => setImage((n) => n + 1);

  const { plan, actif, joue, annule, choisis } = macro;
  const active = mesureActive({ plan, actif });

  const changeRayon = (rayon: number, source: PorteeTracee | null = null) => {
    setTracee(source);
    regle({ rayon });
    if (active && active.r !== rayon) {
      joue([{ t: "pose", e: { ...active, r: rayon } }]);
    }
  };

  useEffect(() => {
    const touche = (event: KeyboardEvent) => {
      if (saisieEnCours(event.target)) {
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        annule();
      } else if (
        (event.key === "Delete" || event.key === "Backspace") &&
        actif &&
        plan.some((element) => element.id === actif)
      ) {
        event.preventDefault();
        joue([{ t: "retire", id: actif }]);
        choisis(null);
      }
    };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [actif, annule, choisis, joue, plan]);

  const contexte = (unitesParPixel: number): Contexte => ({
    plan,
    reglages,
    actif,
    unitesParPixel,
    reperes: REPERES,
  });

  const surPointeur = (pointeur: MacroPointer) => {
    onCursor?.(pointeur.phase === "leave" ? null : pointeur.at);
    const ctx = contexte(pointeur.unitsPerPixel);
    switch (pointeur.phase) {
      case "down":
        geste.current = outil.commence(pointeur.at, ctx);
        redessine();
        break;
      case "move":
        if (geste.current) {
          geste.current.bouge(pointeur.at, ctx);
          redessine();
        }
        break;
      case "up": {
        const fini = geste.current;
        geste.current = null;
        if (fini) {
          const resultat = fini.termine(pointeur.at, ctx);
          joue(resultat.operations);
          if (resultat.actif !== undefined) {
            choisis(resultat.actif);
          }
          redessine();
        }
        break;
      }
      case "cancel":
        geste.current = null;
        redessine();
        break;
    }
  };

  const rendu = (element: Element, enCours = false): ContexteRendu => ({
    actif:
      enCours ||
      (element.type === "mesure"
        ? element.id === active?.id
        : element.id === actif),
    unites: (valeur) =>
      t("ruler.units", { value: formatNumber(Math.round(valeur)) }),
    champion: (id) =>
      catalogue.data?.champions.find((candidat) => candidat.id === id)?.icon ??
      null,
  });
  const masques = geste.current?.masques?.() ?? new Set<string>();
  const apercu = geste.current?.apercu(contexte(1)) ?? [];
  const formes = [
    ...plan
      .filter((element) => !masques.has(element.id))
      .flatMap((element) => dessineElement(element, rendu(element))),
    ...apercu.flatMap((element) => dessineElement(element, rendu(element, true))),
  ];

  const pas = (sens: 1 | -1) =>
    setReglages((avant) => {
      const rang = inkWidths.indexOf(avant.epaisseur as (typeof inkWidths)[number]);
      return {
        ...avant,
        epaisseur:
          inkWidths[Math.min(inkWidths.length - 1, Math.max(0, rang + sens))],
      };
    });

  const vitesse = Number(vitesseSaisie);
  const icone = plan.find((element) => element.id === actif);

  return (
    <SideLayout
      sideWidth={320}
      side={
        <Stack spacing={2}>
          <ToolPanel
            label={t("macro.panel")}
            menus={MENUS.map((menu) => ({
              key: menu,
              label: t(`macro.menus.${menu}`),
              tools: OUTILS.filter((candidat) => candidat.menu === menu).map(
                (candidat) => ({
                  key: candidat.cle,
                  label: t(`macro.tools.${candidat.cle}`),
                  icon: candidat.icone,
                }),
              ),
            }))}
            value={cle}
            onChange={(choisi) => setCle(choisi as CleOutil)}
            actions={
              <>
                <IconButton
                  icon="undo"
                  label={t("macro.undo")}
                  disabled={!macro.peutAnnuler}
                  onClick={annule}
                />
                <IconButton
                  icon="clearAll"
                  label={t("macro.clear")}
                  disabled={plan.length === 0}
                  destructive
                  onClick={() => setAEffacer(true)}
                />
              </>
            }
          >
            {outil.menu === "mesure" && (
              <MesureReglages
                aimant={reglages.aimant}
                onAimant={(aimant) => regle({ aimant })}
                rayon={active?.r ?? reglages.rayon}
                onRayon={(rayon) => changeRayon(rayon)}
                vitesse={vitesseSaisie}
                onVitesse={setVitesseSaisie}
              />
            )}
            {outil.menu === "dessin" && cle !== "gomme" && (
              <DessinReglages
                encre={reglages.encre}
                onEncre={(encre) => regle({ encre })}
                epaisseur={reglages.epaisseur}
                onEpaisseur={(epaisseur) => regle({ epaisseur })}
              />
            )}
            {outil.menu === "icones" && (
              <IconesReglages
                icone={reglages.icone}
                onIcone={(choisie) => regle({ icone: choisie })}
                camp={reglages.camp}
                onCamp={(camp) => regle({ camp })}
                vision={reglages.vision}
                onVision={(choix) => regle({ vision: choix })}
                catalogue={catalogue.data ?? null}
                peutRetirer={icone?.type === "icone"}
                onRetire={() => {
                  if (actif) {
                    joue([{ t: "retire", id: actif }]);
                    choisis(null);
                  }
                }}
              />
            )}
          </ToolPanel>
          {outil.menu === "mesure" && (
            <>
              <MesureLue mesure={active} vitesse={vitesse} tracee={tracee} />
              <ChampionSpells
                champion={champion}
                version={catalogue.data?.version ?? null}
                langue={langue}
                traced={tracee}
                onTrace={(portee) => changeRayon(portee.range, portee)}
              />
            </>
          )}
        </Stack>
      }
    >
      <Stack spacing={1}>
        {header}
        <MacroMap
          label={t("macro.mapLabel", { count: plan.length })}
          landmarks={REPERES}
          shapes={formes}
          cursors={cursors}
          cursor={outil.curseur}
          onPointer={surPointeur}
          onWheelStep={outil.molette ? pas : undefined}
          maxWidth={760}
        />
        <Text variant="caption" tone="secondary" align="center">
          {t(`macro.help.${cle}`)}
        </Text>
        {outil.menu === "mesure" && (
          <ChampionPicker
            catalogue={catalogue.data}
            isLoading={catalogue.isLoading}
            error={catalogue.error}
            selected={championId}
            onSelect={(id) => {
              setChampionId(id);
              setTracee(null);
              const choisi = catalogue.data?.champions.find(
                (candidat) => candidat.id === id,
              );
              if (choisi) {
                setVitesseSaisie(String(choisi.moveSpeed));
              }
            }}
          />
        )}
      </Stack>
      <Dialog
        open={aEffacer}
        title={t("macro.clearTitle")}
        description={t("macro.clearDescription")}
        cancelLabel={t("actions.cancel", { ns: "common" })}
        confirmLabel={t("macro.clearConfirm")}
        destructive
        onClose={() => setAEffacer(false)}
        onConfirm={() => {
          joue([{ t: "vide" }]);
          choisis(null);
          setAEffacer(false);
        }}
      />
    </SideLayout>
  );
}
