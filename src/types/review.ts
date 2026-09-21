/**
 * Les notes d'après-match, telles que le cœur les sert.
 *
 * <p>Ce que le front peut proposer vient des deux faits sur le lecteur — `viewerCanReviewAnyone`
 * et `viewerMemberId` — et de `viewerCanEdit` sur chaque note. Aucun identifiant de compte n'y
 * figure, et aucune comparaison n'est à faire côté client (plan §A.5 bis).</p>
 */

export interface GameReviewDto {
  id: string;
  matchId: string;
  subjectMemberId: string;
  subjectDisplayName: string | null;
  /** La place de l'auteur dans l'équipe, ou `null` s'il n'en est pas membre. */
  authorMemberId: string | null;
  authorDisplayName: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  viewerCanEdit: boolean;
}

export interface GameReviewsDto {
  teamId: string;
  matchId: string;
  reviews: GameReviewDto[];
  viewerMemberId: string | null;
  /** Faux : le lecteur ne peut écrire que sur `viewerMemberId`, et sur personne s'il est `null`. */
  viewerCanReviewAnyone: boolean;
  generatedAt: string;
}

export interface GameReviewRequest {
  subjectMemberId: string;
  content: string;
}
