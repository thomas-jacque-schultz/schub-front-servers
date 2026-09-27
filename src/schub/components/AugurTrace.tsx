import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Chip,
  DataTable,
  Stack,
  Text,
  TextField,
  messageOf,
} from "../../common";
import { getTraceApi, type EvaluationDto } from "../api/augurApi";

/** Chaque règle évaluée sur un joueur ou une partie, émise ou non, avec la valeur et le degré de chaque condition. */
export function AugurTrace() {
  const { t } = useTranslation("riot");
  const [riotId, setRiotId] = useState<string>("");
  const [matchId, setMatchId] = useState<string>("");
  const [trace, setTrace] = useState<EvaluationDto[] | null>(null);
  const [erreur, setErreur] = useState<string>("");
  const [occupe, setOccupe] = useState<boolean>(false);

  const lire = async () => {
    setOccupe(true);
    setErreur("");
    try {
      setTrace(await getTraceApi(riotId, matchId.trim() || undefined));
    } catch (e) {
      setErreur(messageOf(e, t("trace.failed")));
    } finally {
      setOccupe(false);
    }
  };

  const nombre = (x: number | null) =>
    x === null ? "—" : Math.round(x * 100) / 100;

  return (
    <Stack spacing={2}>
      <Text variant="subtitle">{t("trace.title")}</Text>
      <Text tone="secondary" variant="caption">
        {t("trace.description")}
      </Text>
      <Stack direction="responsive" spacing={1.5} align="start">
        <TextField
          label={t("trace.riotId")}
          value={riotId}
          onChange={setRiotId}
          placeholder="Pseudo#TAG"
        />
        <TextField
          label={t("trace.matchId")}
          value={matchId}
          onChange={setMatchId}
          placeholder="EUW1_…"
        />
        <Button
          onClick={() => void lire()}
          loading={occupe}
          disabled={!riotId.includes("#")}
        >
          {t("trace.run")}
        </Button>
      </Stack>
      {erreur && <Alert severity="error">{erreur}</Alert>}
      {trace && (
        <DataTable<EvaluationDto>
          dense
          caption={t("trace.title")}
          emptyTitle={t("trace.empty")}
          rows={trace}
          rowKey={(e) => e.patternKey}
          columns={[
            {
              key: "pattern",
              header: t("trace.pattern"),
              render: (e) => (
                <Text mono>{`${e.patternKey} v${e.version}`}</Text>
              ),
            },
            {
              key: "degree",
              header: t("trace.degree"),
              align: "right",
              render: (e) => (
                <Chip
                  size="small"
                  tone={
                    e.emitted ? "success" : e.excepted ? "warning" : "neutral"
                  }
                  label={`${Math.round(e.degree * 100)} %`}
                />
              ),
            },
            {
              key: "conditions",
              header: t("trace.conditions"),
              render: (e) => (
                <Stack spacing={0.25}>
                  {e.conditions.map((c, i) => (
                    <Text key={i} variant="caption" mono>
                      {`${c.role[0]} ${c.signal} ${c.unit === "PERCENTILE" ? "c" : ""}${nombre(c.observed)} [${c.from}→${c.to}] = ${nombre(c.degree)}`}
                    </Text>
                  ))}
                </Stack>
              ),
            },
          ]}
        />
      )}
    </Stack>
  );
}
