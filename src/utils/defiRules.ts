import { Player, Match, ChallengeValidation, Category } from '../types/defi';

/**
 * Returns ISO week key (e.g. "2026-W42") for a date to enforce 1 challenge/week
 */
export function getIsoWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${target.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Validates whether challenger can challenge defender based on official club rules (1-17)
 */
export function validateChallenge(
  challenger: Player,
  defender: Player,
  allMatches: Match[],
  currentDateStr: string = '2026-10-14'
): ChallengeValidation {
  // 1. Same person check
  if (challenger.id === defender.id) {
    return {
      canChallenge: false,
      reason: 'Kendinize meydan okuyamazsınız.',
    };
  }

  // 2. Same category check
  if (challenger.category !== defender.category) {
    return {
      canChallenge: false,
      reason: 'Sadece kendi kategorinizdeki (Erkekler / Kadınlar) oyunculara maç teklif edebilirsiniz.',
    };
  }

  // 3. Defender excused check (Madde 10: Sınav, sağlık, şehir dışı izni)
  if (defender.isExcused) {
    return {
      canChallenge: false,
      reason: `${defender.name} Defi Komitesi'nden mazeret izni almıştır (${defender.excuseReason || 'Mazeretli'}). Bu hafta maç teklifi kabul edemez.`,
    };
  }

  // 4. Challenger excused check
  if (challenger.isExcused) {
    return {
      canChallenge: false,
      reason: 'Şu anda mazeret izinli statüsündesiniz. Maç teklif etmeden önce komiteye başvurup mazeret durumunuzu kaldırmalısınız.',
    };
  }

  // 5. New Joiner Rule (Madde 11):
  // "Defi ligine sonradan katılmak isteyen oyuncular; sıralamadaki 11.ya da aşağıya doğru oyunculardan herhangi birine maç teklif ederek defi ligine katılabilirler."
  if (challenger.isNewJoiner) {
    if (defender.rank < 11) {
      return {
        canChallenge: false,
        reason: 'Lige sonradan katılan oyuncular talimatname gereği (Madde 11) yalnızca 11. sıra ve altındaki oyunculara ilk maç teklifini yapabilir.',
        rankDiff: defender.rank,
        isWithinLimit: false,
      };
    }
  } else {
    // 6. Regular 5-Rank Upwards Rule (Madde 7):
    // "Her oyuncu bulunduğu sıralamadan 5 üstüne kadar maç teklifi edebilir, 5 altına kadar bir oyuncudan maç teklifi alabilir."
    // Challengers challenge upwards (defender rank must be lower number, i.e., higher standing)
    if (defender.rank >= challenger.rank) {
      return {
        canChallenge: false,
        reason: 'Defi ligi mantığı gereği yalnızca sıralamada sizin üstünüzde bulunan oyunculara meydan okuyabilirsiniz (Sıralamanızı yükseltmek için).',
        rankDiff: challenger.rank - defender.rank,
        isWithinLimit: false,
      };
    }

    const rankDiff = challenger.rank - defender.rank;
    if (rankDiff > 5) {
      return {
        canChallenge: false,
        reason: `Sıralamanız uygun değil! Madde 7 gereğince en fazla 5 üst sıranızdaki oyuncuya teklifte bulunabilirsiniz. (Şu anki fark: ${rankDiff} sıra. Teklif edebileceğiniz aralık: #${challenger.rank - 5} ile #${challenger.rank - 1} arası)`,
        rankDiff,
        isWithinLimit: false,
      };
    }
  }

  // 7. Weekly Quota (Madde 5):
  // "Her oyuncu haftada 1 kez maç teklif edebilir ve 1 kez maç teklifi alabilir."
  const currentWeek = getIsoWeekKey(currentDateStr);

  // Active / scheduled / recently played in this week
  const challengerOutgoingThisWeek = allMatches.some(
    (m) =>
      m.challengerId === challenger.id &&
      m.status !== 'cancelled' &&
      getIsoWeekKey(m.matchDate || m.createdAt) === currentWeek
  );

  if (challengerOutgoingThisWeek) {
    return {
      canChallenge: false,
      reason: 'Bu hafta için 1 adet maç teklif etme kotanızı zaten kullandınız (Madde 5 gereği haftada 1 kez teklif yapılabilir). Gelecek hafta tekrar teklif edebilirsiniz.',
      hasWeeklyChallengeQuota: false,
    };
  }

  const defenderIncomingThisWeek = allMatches.some(
    (m) =>
      m.defenderId === defender.id &&
      m.status !== 'cancelled' &&
      getIsoWeekKey(m.matchDate || m.createdAt) === currentWeek
  );

  if (defenderIncomingThisWeek) {
    return {
      canChallenge: false,
      reason: `${defender.name} bu hafta zaten bir maç teklifi almıştır (Madde 5 gereği bir oyuncu haftada en fazla 1 teklif alabilir).`,
      hasWeeklyChallengeQuota: false,
    };
  }

  // 8. Rematch Cooldown (Madde 8):
  // "Oyuncu; kaybettiği oyuncuya 2 haftadan önce bir kez daha maç teklifi yapamaz."
  const twoWeeksAgo = new Date(currentDateStr);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const recentLossToDefender = allMatches.find(
    (m) =>
      m.status === 'confirmed' &&
      m.score?.winnerId === defender.id &&
      m.score?.loserId === challenger.id &&
      new Date(m.matchDate) >= twoWeeksAgo
  );

  if (recentLossToDefender) {
    const daysAgo = Math.floor(
      (new Date(currentDateStr).getTime() - new Date(recentLossToDefender.matchDate).getTime()) / (1000 * 3600 * 24)
    );
    const daysLeft = 14 - daysAgo;
    return {
      canChallenge: false,
      reason: `Rövanş Kuralı (Madde 8): Kaybettiğiniz bir oyuncuya 2 hafta (14 gün) geçmeden tekrar teklif yapamazsınız. Kalan süre: yaklaşık ${daysLeft} gün.`,
      hasRematchCooldown: false,
    };
  }

  return {
    canChallenge: true,
    rankDiff: challenger.rank - defender.rank,
    isWithinLimit: true,
    hasWeeklyChallengeQuota: true,
    hasRematchCooldown: true,
  };
}

/**
 * Calculates new rankings after a match is confirmed based on Madde 7 and Madde 11:
 * - If Challenger beats Defender (who is above them):
 *   Challenger moves to Defender's rank.
 *   Defender shifts down 1 spot (e.g. 5 -> 6).
 *   All players between defender and challenger also shift down 1 spot (6->7, 7->8, etc.)
 * - If Defender wins:
 *   Ranking does not change! (Except if challenger was a new joiner Madde 11: placed at very bottom)
 */
export function applyMatchResultToRankings(
  categoryPlayers: Player[],
  match: Match,
  winnerId: string,
  loserId: string
): Player[] {
  const sorted = [...categoryPlayers].sort((a, b) => a.rank - b.rank);
  const challenger = sorted.find((p) => p.id === match.challengerId);
  const defender = sorted.find((p) => p.id === match.defenderId);

  if (!challenger || !defender) return categoryPlayers;

  // Clone players to avoid mutation
  let updated = sorted.map((p) => ({
    ...p,
    previousRank: p.rank,
  }));

  const challengerWon = winnerId === challenger.id;

  if (challengerWon) {
    const targetRank = defender.rank; // Challenger takes this rank!
    const oldChallengerRank = challenger.rank;

    if (challenger.isNewJoiner) {
      // Madde 11: Lige sonradan giren kazanırsa o sıraya geçer, o sıra ve altındakiler 1 kayar
      updated = updated.map((p) => {
        if (p.id === challenger.id) {
          return {
            ...p,
            rank: targetRank,
            isNewJoiner: false,
            wins: p.wins + 1,
            matchesPlayed: p.matchesPlayed + 1,
          };
        }
        if (p.rank >= targetRank && p.id !== challenger.id) {
          return {
            ...p,
            rank: p.rank + 1,
          };
        }
        return p;
      });
    } else {
      // Madde 7: Normal Defi Sıralama Değişimi
      // Oyuncu 10'dan 5'e teklif etti ve kazandı:
      // Challenger -> 5
      // 5 -> 6, 6 -> 7, 7 -> 8, 8 -> 9, 9 -> 10
      updated = updated.map((p) => {
        if (p.id === challenger.id) {
          return {
            ...p,
            rank: targetRank,
            wins: p.wins + 1,
            matchesPlayed: p.matchesPlayed + 1,
          };
        }
        if (p.rank >= targetRank && p.rank < oldChallengerRank) {
          // Bu aralıktaki oyuncular 1 sıra aşağı kayar
          return {
            ...p,
            rank: p.rank + 1,
            // Defender lost
            losses: p.id === defender.id ? p.losses + 1 : p.losses,
            matchesPlayed: p.id === defender.id ? p.matchesPlayed + 1 : p.matchesPlayed,
          };
        }
        if (p.id === defender.id && p.rank < targetRank) {
          return {
            ...p,
            losses: p.losses + 1,
            matchesPlayed: p.matchesPlayed + 1,
          };
        }
        return p;
      });
    }
  } else {
    // Defender won - ranking does NOT change (Madde 7: "Maçı kaybedersem sıralama değişmiyor.")
    // But if challenger was new joiner (Madde 11): "Maçı kaybederse lige en alt sıradan başlıyor."
    const maxRank = Math.max(...updated.filter((p) => !p.isNewJoiner).map((p) => p.rank), 0);

    updated = updated.map((p) => {
      if (p.id === defender.id) {
        return {
          ...p,
          wins: p.wins + 1,
          matchesPlayed: p.matchesPlayed + 1,
        };
      }
      if (p.id === challenger.id) {
        return {
          ...p,
          losses: p.losses + 1,
          matchesPlayed: p.matchesPlayed + 1,
          rank: challenger.isNewJoiner ? maxRank + 1 : p.rank,
          isNewJoiner: false,
        };
      }
      return p;
    });
  }

  // Sort again and ensure sequential ranks (1, 2, 3...)
  return updated.sort((a, b) => a.rank - b.rank);
}

export function buildChallengeMessageText(
  challenger: Player,
  defender: Player
): string {
  // Semi-formal address: Hanım for women, Bey for men as instructed
  const honorific = defender.category === 'women' ? 'Hanım' : 'Bey';
  const categoryLabel = challenger.category === 'women' ? 'Tek Kadınlar' : 'Tek Erkekler';

  return (
    `Selamlar ${defender.name} ${honorific} 🎾\n\n` +
    `ZTDSK Defi Ligi kapsamında sizinle maç yapmak için teklifte bulunuyorum. Kort rezervasyonu ve maç topları benden olacaktır. Bu hafta içi uygun olduğunuz gün ve saatleri kararlaştırabiliriz. İyi maçlar dilerim.\n\n` +
    `— *${challenger.name}* (${categoryLabel}, Sıra: #${challenger.rank})`
  );
}

/**
 * Builds the WhatsApp pre-filled text for defi match challenge
 */
export function buildWhatsAppChallengeUrl(
  challenger: Player,
  defender: Player,
  phone?: string
): string {
  const message = buildChallengeMessageText(challenger, defender);
  if (phone && phone.replace(/[^0-9]/g, '').length >= 10) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone.startsWith('90') ? cleanPhone : '90' + cleanPhone}?text=${encodeURIComponent(message)}`;
  }
  // Default to WhatsApp group share picker
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

/**
 * WhatsApp group share link (opens WhatsApp chat picker to choose ZTDSK group)
 */
export function buildWhatsAppGroupShareUrl(
  challenger: Player,
  defender: Player
): string {
  const message = buildChallengeMessageText(challenger, defender);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}
