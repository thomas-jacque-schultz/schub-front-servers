import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createGameReviewApi,
  deleteGameReviewApi,
  getGameReviewsApi,
  updateGameReviewApi,
} from "../../../api/reviewsApi";
import {
  Alert,
  Button,
  Card,
  Dialog,
  Divider,
  ProgressBar,
  SelectField,
  Stack,
  Text,
  TextField,
} from "../../../design-system";
import { useLocaleFormat } from "../../../i18n/format";
import type { GameReviewsDto } from "../../../types/review";
import type { TeamGameDto } from "../../../types/stats";

export interface GameReviewDialogProps {
  teamId: string;
  /** La partie ouverte, ou `null` quand le dialogue est fermé. */
  game: TeamGameDto | null;
  onClose: () => void;
}

/**
 * Le débrief d'une partie : les notes déjà écrites, et celle qu'on peut ajouter.
 *
 * <p>Sur qui l'on peut écrire vient de deux faits servis par le cœur — `viewerCanReviewAnyone` et
 * `viewerMemberId` — jamais d'une comparaison d'identifiants. Le choix des sujets est restreint
 * aux joueurs présents dans cette partie : le serveur en accepterait davantage, mais noter
 * quelqu'un sur une partie qu'il n'a pas jouée n'est pas un débrief.</p>
 */
export function GameReviewDialog({
  teamId,
  game,
  onClose,
}: GameReviewDialogProps) {
  const { t } = useTranslation("reviews");
  const { formatDateTime } = useLocaleFormat();

  const [reviews, setReviews] = useState<GameReviewsDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [editedId, setEditedId] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const matchId = game?.matchId ?? "";

  const load = useCallback(async () => {
    if (!matchId) {
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      setReviews(await getGameReviewsApi(teamId, matchId));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : t("loadFailed"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [teamId, matchId, t]);

  useEffect(() => {
    setReviews(null);
    setContent("");
    setEditedId("");
    setSubject("");
    void load();
  }, [load]);

  /** Les places notables : celles qui ont joué cette partie, bornées à soi sans TEAM_EDIT. */
  const sujets = useMemo(() => {
    if (!game || !reviews) {
      return [];
    }
    return game.players
      .filter((player) => player.memberId !== null)
      .filter(
        (player) =>
          reviews.viewerCanReviewAnyone ||
          player.memberId === reviews.viewerMemberId,
      )
      .map((player) => ({
        value: player.memberId as string,
        label: player.displayName ?? (player.memberId as string),
      }));
  }, [game, reviews]);

  useEffect(() => {
    if (sujets.length > 0 && !sujets.some((option) => option.value === subject)) {
      setSubject(sujets[0].value);
    }
  }, [sujets, subject]);

  const onSave = async () => {
    if (!matchId || !content.trim()) {
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      if (editedId) {
        await updateGameReviewApi(teamId, matchId, editedId, content.trim());
      } else {
        await createGameReviewApi(teamId, matchId, {
          subjectMemberId: subject,
          content: content.trim(),
        });
      }
      setContent("");
      setEditedId("");
      await load();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : t("form.failed"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async (reviewId: string) => {
    if (!matchId) {
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await deleteGameReviewApi(teamId, matchId, reviewId);
      if (editedId === reviewId) {
        setEditedId("");
        setContent("");
      }
      await load();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : t("remove.failed"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const peutEcrire = sujets.length > 0;

  return (
    <Dialog
      open={game !== null}
      title={t("title")}
      description={t("description")}
      cancelLabel={t("close")}
      onClose={onClose}
      maxWidth="md"
    >
      <Stack spacing={2}>
        {isLoading && !reviews && <ProgressBar label={t("loading")} />}
        {error && <Alert severity="error">{error}</Alert>}

        {reviews && reviews.reviews.length === 0 && (
          <Text variant="body" tone="secondary">
            {t("empty")}
          </Text>
        )}

        {reviews?.reviews.map((review) => (
          <Card key={review.id}>
            <Stack spacing={0.5}>
              <Text variant="subtitle">{review.subjectDisplayName}</Text>
              <Text variant="caption" tone="secondary">
                {t("author", {
                  name: review.authorDisplayName ?? t("unknownAuthor"),
                })}
                {" · "}
                {review.updatedAt !== review.createdAt
                  ? t("updated", {
                      date: formatDateTime(new Date(review.updatedAt)),
                    })
                  : t("written", {
                      date: formatDateTime(new Date(review.createdAt)),
                    })}
              </Text>
              <Text variant="body">{review.content}</Text>
              {review.viewerCanEdit && (
                <Stack direction="row" spacing={1} wrap>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => {
                      setEditedId(review.id);
                      setContent(review.content);
                    }}
                  >
                    {t("edit.action")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => void onDelete(review.id)}
                  >
                    {t("remove.action")}
                  </Button>
                </Stack>
              )}
            </Stack>
          </Card>
        ))}

        {reviews && <Divider />}

        {reviews && !peutEcrire && (
          <Text variant="caption" tone="secondary">
            {t("readOnly")}
          </Text>
        )}

        {reviews && peutEcrire && (
          <Stack spacing={1.5}>
            {!reviews.viewerCanReviewAnyone && (
              <Text variant="caption" tone="secondary">
                {t("onlyYourself")}
              </Text>
            )}
            {!editedId && (
              <SelectField
                label={t("form.subject")}
                value={subject}
                onChange={setSubject}
                options={sujets}
              />
            )}
            <TextField
              label={editedId ? t("edit.title") : t("form.content")}
              value={content}
              onChange={setContent}
              helperText={t("form.contentHelper")}
              multiline
              minRows={3}
            />
            <Stack direction="row" spacing={1} wrap>
              <Button
                onClick={() => void onSave()}
                disabled={!content.trim()}
                loading={isSaving}
              >
                {editedId ? t("edit.confirm") : t("form.submit")}
              </Button>
              {editedId && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditedId("");
                    setContent("");
                  }}
                >
                  {t("close")}
                </Button>
              )}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Dialog>
  );
}
