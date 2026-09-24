export interface GameReviewDto {
  id: string;
  matchId: string;
  subjectMemberId: string;
  subjectDisplayName: string | null;
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
  viewerCanReviewAnyone: boolean;
  generatedAt: string;
}

export interface GameReviewRequest {
  subjectMemberId: string;
  content: string;
}
