export type Category = 'men' | 'women';

export type MatchStatus = 'scheduled' | 'score_submitted' | 'confirmed' | 'cancelled';

export type MatchFinishType = 'completed' | 'retired' | 'walkover';

export interface SetScore {
  player1Games: number;
  player2Games: number;
  tiebreakPlayer1?: number;
  tiebreakPlayer2?: number;
}

export interface MatchScore {
  sets: SetScore[]; // 1 to 3 sets depending on completion, retirement, or walkover
  winnerId: string;
  loserId: string;
  scoreText: string; // e.g. "6-4, 3-6, 10-8" or "6-3, 2-1 (Ret.)" or "W.O."
  finishType?: MatchFinishType; // 'completed' | 'retired' | 'walkover'
  retireReason?: string; // e.g. "Sakatlık / Çekilme"
}

export interface Match {
  id: string;
  category: Category;
  challengerId: string; // Meydan okuyan (genelde alt sıradaki veya yeni katılan)
  defenderId: string; // Meydan okunan (üst sıradaki)
  challengerRankAtMatch: number;
  defenderRankAtMatch: number;
  matchDate: string; // YYYY-MM-DD
  matchTime?: string; // HH:mm
  court?: string; // e.g. "Kort 1", "Merkez Kort"
  status: MatchStatus;
  finishType?: MatchFinishType;
  score?: MatchScore;
  scoreSubmittedBy?: string; // Kazanan oyuncunun id'si
  scoreSubmittedAt?: string;
  scoreConfirmedBy?: string; // Kaybeden oyuncunun id'si
  scoreConfirmedAt?: string;
  notes?: string;
  photoUrl?: string; // WhatsApp paylaşım veya hatıra fotoğrafı
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  category: Category;
  rank: number;
  previousRank?: number;
  phone: string;
  password: string; // Admin tarafından belirlenir, oyuncu girişinde kullanılır
  isExcused?: boolean; // Mazeretli mi (Madde 10: sınav, seyahat, sakatlık)
  excuseReason?: string;
  excuseStartDate?: string; // YYYY-MM-DD
  excuseEndDate?: string; // YYYY-MM-DD
  excuseNotes?: string;
  isNewJoiner?: boolean; // Madde 11: 11. sıra ve altına meydan okuyarak lige giren
  matchesPlayed: number;
  wins: number;
  losses: number;
  ttfScore?: number;
  joinedDate: string;
  avatarBg?: string;
}

export interface ChallengeValidation {
  canChallenge: boolean;
  reason?: string;
  rankDiff?: number;
  isWithinLimit?: boolean;
  hasWeeklyChallengeQuota?: boolean;
  hasRematchCooldown?: boolean;
}

export interface LeagueSettings {
  leagueName: string;
  clubName: string;
  coordinatorName: string;
  coordinatorPhone: string;
  adminPassword: string;
  startDate: string;
  endDate: string;
  playoffStartDate: string;
  playoffEndDate: string;
  entryFee: string;
  lateJoinDeadline: string;
}
