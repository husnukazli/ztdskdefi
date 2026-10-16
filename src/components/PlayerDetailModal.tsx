import React from 'react';
import { useDefi } from '../context/DefiContext';
import { Player } from '../types/defi';
import {
  X,
  Trophy,
  Swords,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Shield,
  Medal,
  Clock,
  PauseCircle,
  FileText,
  User,
  Sparkles,
} from 'lucide-react';
import { validateChallenge } from '../utils/defiRules';

interface PlayerDetailModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChallenge?: (player: Player) => void;
  onOpenExcuseModal?: (player: Player) => void;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  player,
  isOpen,
  onClose,
  onOpenChallenge,
  onOpenExcuseModal,
}) => {
  const { currentUser, isAdmin, matches, players, theme } = useDefi();
  const isLight = theme === 'light';

  if (!isOpen || !player) return null;

  const isMe = currentUser?.id === player.id;
  const isTop4 = player.rank <= 4;
  const isTop12 = player.rank <= 12;

  // Recent matches involving this player
  const playerMatches = matches.filter(
    (m) =>
      (m.challengerId === player.id || m.defenderId === player.id) &&
      m.status !== 'cancelled'
  );

  const completedMatches = playerMatches.filter((m) => m.status === 'confirmed');
  const activeMatches = playerMatches.filter((m) => m.status === 'scheduled' || m.status === 'score_submitted');

  const winRate =
    player.matchesPlayed > 0
      ? Math.round((player.wins / player.matchesPlayed) * 100)
      : 0;

  // Challenge eligibility (only for logged-in players who are not the player itself and not admin)
  const challengeCheck = currentUser && !isAdmin && !isMe
    ? validateChallenge(currentUser, player, matches)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 p-5 border-b border-blue-900/60 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl ${
                player.avatarBg || 'bg-emerald-600'
              } text-white font-bold flex items-center justify-center text-xl shadow-lg border border-white/10 shrink-0`}
            >
              {player.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">{player.name}</h3>
                {isMe && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    Siz
                  </span>
                )}
                {player.isNewJoiner && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    Yeni Katılan (Madde 11)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                <span className="bg-blue-950 text-blue-300 border border-blue-800/80 px-2.5 py-0.5 rounded-full font-bold">
                  Defi Sırası #{player.rank}
                </span>
                <span>•</span>
                <span>{player.category === 'men' ? '14(+) Tek Erkekler' : '14(+) Tek Kadınlar'}</span>
                <span>•</span>
                <span className="text-emerald-400 font-mono">TTF: {player.ttfScore || 1500} P</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
          {/* EXCUSE BANNER (If Player is Excused) */}
          {player.isExcused ? (
            <div className="bg-gradient-to-r from-amber-950/70 via-amber-900/30 to-amber-950/70 border-2 border-amber-500/80 rounded-2xl p-4.5 shadow-xl space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <PauseCircle className="w-6 h-6 animate-pulse" />
                  </span>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <span>DEFİ KURALI MADDE 10: MAZERET İZİNLİ SPORCU</span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-0.5">
                      {player.excuseReason || 'Mazeret Bildirimi'}
                    </h4>
                  </div>
                </div>

                <span className="text-[11px] bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-full uppercase shrink-0">
                  Mazeretli
                </span>
              </div>

              {/* Date Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-600/30">
                  <div className="text-[10px] text-amber-300/80 font-semibold uppercase flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mazeret Tarih Aralığı:</span>
                  </div>
                  <div className="font-bold text-white text-xs sm:text-sm mt-0.5">
                    {player.excuseStartDate || '12 Ekim 2026'} – {player.excuseEndDate || '22 Ekim 2026'}
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-600/30">
                  <div className="text-[10px] text-amber-300/80 font-semibold uppercase flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sıralama & Meydan Okuma Durumu:</span>
                  </div>
                  <div className="font-semibold text-amber-200 text-xs mt-0.5">
                    Sıralama donduruldu. Bu tarihlerde maç teklifi alamaz.
                  </div>
                </div>
              </div>

              {player.excuseNotes && (
                <div className="text-xs text-amber-100/90 bg-amber-950/40 p-2.5 rounded-xl border border-amber-600/30">
                  <strong>Sporcu Notu:</strong> {player.excuseNotes}
                </div>
              )}

              {(isMe || isAdmin) && onOpenExcuseModal && (
                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={() => onOpenExcuseModal(player)}
                    className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Mazereti Düzenle / Kaldır</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/30 border-emerald-700/40 text-emerald-300'
            }`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>
                  <strong>Durum: Aktif</strong> — Lig kuralları dahilinde maç tekliflerine açıktır.
                </span>
              </div>
              {(isMe || isAdmin) && onOpenExcuseModal && (
                <button
                  onClick={() => onOpenExcuseModal(player)}
                  className="text-amber-500 hover:text-amber-400 font-bold text-xs underline cursor-pointer"
                >
                  Mazeret Bildir
                </button>
              )}
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">Lig Sırası</div>
              <div className="text-xl font-black text-amber-400 mt-0.5">#{player.rank}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {isTop4 ? 'Çeyrek Final (Bye)' : isTop12 ? 'Play-Off Barajında' : 'Lig Etabı'}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">Maç Sayısı</div>
              <div className="text-xl font-black text-white mt-0.5">{player.matchesPlayed}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Bu Sezon Toplam</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">Galibiyet / Mağlubiyet</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">
                {player.wins} <span className="text-slate-600 text-base">/</span>{' '}
                <span className="text-rose-400">{player.losses}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Kazanma: %{winRate}</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400">TTF Puanı</div>
              <div className="text-xl font-black text-sky-400 font-mono mt-0.5">
                {player.ttfScore || 1500}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">ZTDSK Klasman</div>
            </div>
          </div>

          {/* Member Info & Contact */}
          <div className={`p-4 rounded-xl border text-xs space-y-2 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Kulüp & İletişim Bilgileri</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <div>
                <span className="text-slate-400">Üyelik Statüsü: </span>
                <strong className="text-white">ZTDSK Defi Ligi Sporcusu</strong>
              </div>
              <div>
                <span className="text-slate-400">İletişim / WhatsApp: </span>
                <strong className="text-emerald-400">{player.phone}</strong>
              </div>
              <div>
                <span className="text-slate-400">Lige Katılım Tarihi: </span>
                <span className="text-white">{player.joinedDate || '05 Ekim 2026'}</span>
              </div>
              <div>
                <span className="text-slate-400">Kategori: </span>
                <span className="text-white">{player.category === 'men' ? '14(+) Tek Erkekler' : '14(+) Tek Kadınlar'}</span>
              </div>
            </div>
          </div>

          {/* Matches History Section */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Lig Maçları Geçmişi ({playerMatches.length})</span>
            </h4>

            {playerMatches.length === 0 ? (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs text-slate-500 italic">
                Bu sporcunun henüz kayıtlı maçı bulunmuyor.
              </div>
            ) : (
              <div className="space-y-2">
                {playerMatches.map((m) => {
                  const isP1 = m.challengerId === player.id;
                  const oppId = isP1 ? m.defenderId : m.challengerId;
                  const opp = players.find((p) => p.id === oppId);
                  const isWinner = m.score?.winnerId === player.id;

                  return (
                    <div
                      key={m.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.status === 'confirmed'
                            ? isWinner
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {m.status === 'confirmed' ? (isWinner ? 'GALİBİYET' : 'MAĞLUBİYET') : 'PLANLANMIŞ'}
                        </span>
                        <div>
                          <div className="font-semibold text-white">
                            vs #{opp?.rank} {opp?.name || 'Rakip Sporcu'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {m.matchDate} • {m.court || 'Merkez Kort'}
                          </div>
                        </div>
                      </div>

                      {m.score ? (
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          {m.score.scoreText}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">
                          Skor Bekleniyor
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Kapat
          </button>

          <div className="flex items-center gap-2">
            {/* If viewed by current user on their own card */}
            {isMe && onOpenExcuseModal && (
              <button
                onClick={() => onOpenExcuseModal(player)}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <PauseCircle className="w-4 h-4" />
                <span>{player.isExcused ? 'Mazeretimi Düzenle' : 'Mazeret Bildir'}</span>
              </button>
            )}

            {/* If viewed by admin: Admin can set excuse, but NEVER challenge */}
            {isAdmin && onOpenExcuseModal && (
              <button
                onClick={() => onOpenExcuseModal(player)}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Mazeret Durumunu Yönet</span>
              </button>
            )}

            {/* If viewed by another player: Show challenge if eligible and NOT admin */}
            {!isAdmin && !isMe && currentUser && onOpenChallenge && (
              player.isExcused ? (
                <div className="text-xs text-amber-400 font-semibold px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800">
                  Sporcu mazeret izinli olduğundan meydan okunamaz
                </div>
              ) : challengeCheck?.canChallenge ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenChallenge(player);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-950/60 cursor-pointer"
                >
                  <Swords className="w-4 h-4" />
                  <span>Bu Oyuncuya Meydan Oku</span>
                </button>
              ) : (
                <div className="text-xs text-slate-400 italic">
                  {challengeCheck?.reason || 'Meydan okuma kuralları karşılanmıyor'}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
