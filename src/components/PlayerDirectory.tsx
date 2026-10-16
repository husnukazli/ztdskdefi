import React, { useState } from 'react';
import { Player, Match } from '../types/defi';
import { useDefi } from '../context/DefiContext';
import { Users, Search, Phone, Swords, Trophy, Calendar, CheckCircle2, XCircle, ShieldAlert, Award, X, Sparkles } from 'lucide-react';
import { validateChallenge } from '../utils/defiRules';

interface PlayerDirectoryProps {
  onChallengePlayer: (player: Player) => void;
  selectedPlayer: Player | null;
  setSelectedPlayer: (player: Player | null) => void;
}

export const PlayerDirectory: React.FC<PlayerDirectoryProps> = ({
  onChallengePlayer,
  selectedPlayer,
  setSelectedPlayer,
}) => {
  const { players, matches, currentCategory, currentUser, theme } = useDefi();
  const [search, setSearch] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'playoff' | 'active'>('all');
  const isLight = theme === 'light';

  const categoryPlayers = players
    .filter((p) => p.category === currentCategory)
    .sort((a, b) => a.rank - b.rank);

  const filtered = categoryPlayers.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search);
    if (!matchesSearch) return false;
    if (filterMode === 'playoff') return p.rank <= 12;
    if (filterMode === 'active') return !p.isExcused;
    return true;
  });

  // Matches for selected player
  const playerMatches = selectedPlayer
    ? matches
        .filter(
          (m) =>
            (m.challengerId === selectedPlayer.id || m.defenderId === selectedPlayer.id) &&
            m.status !== 'cancelled'
        )
        .sort((a, b) => b.matchDate.localeCompare(a.matchDate))
    : [];

  const getOpponent = (m: Match, pId: string): Player | undefined => {
    const oppId = m.challengerId === pId ? m.defenderId : m.challengerId;
    return players.find((p) => p.id === oppId);
  };

  const validationForSelected =
    currentUser && selectedPlayer
      ? validateChallenge(currentUser, selectedPlayer, matches, '2026-10-14')
      : null;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {currentCategory === 'men' ? '14(+) Tek Erkekler' : '14(+) Tek Kadınlar'} Oyuncu Kataloğu
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Oyuncunun üzerine tıklayarak detaylı maç geçmişini, defi sırasını inceleyebilir ve maç teklifinde bulunabilirsiniz.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Oyuncu ara..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                filterMode === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tümü ({categoryPlayers.length})
            </button>
            <button
              onClick={() => setFilterMode('playoff')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                filterMode === 'playoff' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Play-Off (İlk 12)
            </button>
            <button
              onClick={() => setFilterMode('active')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                filterMode === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Aktif
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Players */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((player) => {
          const isMe = currentUser?.id === player.id;
          const winRate =
            player.matchesPlayed > 0
              ? Math.round((player.wins / player.matchesPlayed) * 100)
              : 0;

          return (
            <div
              key={player.id}
              onClick={() => setSelectedPlayer(player)}
              className={`border rounded-2xl p-4 space-y-3 cursor-pointer transition group relative ${
                isLight
                  ? isMe
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-sky-400 hover:shadow-md'
                  : isMe
                  ? 'border-emerald-500/60 bg-emerald-950/20'
                  : 'border-slate-800 bg-slate-900 hover:border-sky-500/50 hover:shadow-xl'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${
                      player.avatarBg || 'bg-slate-700'
                    } text-white font-bold flex items-center justify-center text-sm shadow group-hover:scale-105 transition-transform`}
                  >
                    {player.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className={`font-bold text-xs transition flex items-center gap-1.5 ${
                      isLight ? 'text-slate-950 group-hover:text-sky-700' : 'text-white group-hover:text-sky-400'
                    }`}>
                      <span>{player.name}</span>
                      {isMe && (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 px-1.5 rounded font-bold border border-emerald-300 dark:border-emerald-700">
                          Siz
                        </span>
                      )}
                    </h3>
                    <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>ZTDSK Defi Üyesi</div>
                  </div>
                </div>

                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    player.rank <= 4
                      ? 'bg-amber-400 text-slate-950'
                      : player.rank <= 12
                      ? 'bg-sky-950 text-sky-300 border border-sky-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  #{player.rank}
                </span>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-1 bg-slate-950/70 p-2 rounded-xl text-center border border-slate-800/80 text-[11px]">
                <div>
                  <div className="text-slate-400 text-[10px]">Maç</div>
                  <div className="font-bold text-white">{player.matchesPlayed}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">G / M</div>
                  <div className="font-bold text-emerald-400">
                    {player.wins} <span className="text-slate-500">/</span>{' '}
                    <span className="text-rose-400">{player.losses}</span>
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Başarı</div>
                  <div className="font-bold text-sky-400">%{winRate}</div>
                </div>
              </div>

              {/* Status / Excuse */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                {player.isExcused ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Mazeretli
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Meydan Okunabilir
                  </span>
                )}

                {!isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChallengePlayer(player);
                    }}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-300 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>Teklif Et</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SELECTED PLAYER DETAIL MODAL */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl ${
                    selectedPlayer.avatarBg || 'bg-slate-700'
                  } text-white font-bold flex items-center justify-center text-base shadow-lg`}
                >
                  {selectedPlayer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      {selectedPlayer.name}
                    </h2>
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
                      Defi Sırası #{selectedPlayer.rank}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                    <span className="text-emerald-400 font-semibold">ZTDSK Defi Ligi Üyesi</span>
                    <span>•</span>
                    <span>Lige Katılım: {selectedPlayer.joinedDate}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlayer(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 overflow-y-auto text-xs">
              {/* Stats Overview */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Defi Sırası</div>
                  <div className="text-base font-bold text-amber-400">#{selectedPlayer.rank}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Toplam Maç</div>
                  <div className="text-base font-bold text-white">{selectedPlayer.matchesPlayed}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Galibiyet / Mağl.</div>
                  <div className="text-base font-bold text-emerald-400">
                    {selectedPlayer.wins} <span className="text-slate-600">/</span>{' '}
                    <span className="text-rose-400">{selectedPlayer.losses}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[10px]">TTF Puanı</div>
                  <div className="text-base font-bold text-sky-400 font-mono">
                    {selectedPlayer.ttfScore || 1500}
                  </div>
                </div>
              </div>

              {/* Challenge Button & Validation Banner (Only for players) */}
              {currentUser && !isAdmin && currentUser.id !== selectedPlayer.id && (
                <div className="space-y-2">
                  {validationForSelected && !validationForSelected.canChallenge ? (
                    <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs">
                      <strong>Meydan Okuma Uyarı (Madde 7): </strong>
                      {validationForSelected.reason}
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
                      <span>Bu oyuncuya maç teklifi yapma hakkınız bulunmaktadır!</span>
                      <span className="font-bold">5 Sıra Kuralı Uygun</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedPlayer(null);
                      onChallengePlayer(selectedPlayer);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                  >
                    <Swords className="w-4 h-4" />
                    <span>Bu Oyuncuya Defi Teklif Et (WhatsApp / Takvim)</span>
                  </button>
                </div>
              )}

              {/* Match History */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Maç Geçmişi & Sonuçlar ({playerMatches.length})
                </h4>

                {playerMatches.length === 0 ? (
                  <div className="p-4 bg-slate-950 rounded-xl text-center text-slate-500 text-xs">
                    Henüz kayıtlı maç bulunmuyor.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {playerMatches.map((m) => {
                      const opp = getOpponent(m, selectedPlayer.id);
                      const isWinner = m.score?.winnerId === selectedPlayer.id;

                      return (
                        <div
                          key={m.id}
                          className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400">{m.matchDate}</span>
                              <span className="text-slate-600">•</span>
                              <span className="font-semibold text-white">
                                vs {opp ? opp.name : 'Bilinmeyen'} (#{opp?.rank})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {m.court || 'Merkez Kort'}
                            </div>
                          </div>

                          <div className="text-right">
                            {m.status === 'confirmed' ? (
                              <div>
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                    isWinner
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                                  }`}
                                >
                                  {isWinner ? 'KAZANDI' : 'KAYBETTİ'}
                                </span>
                                <div className="font-mono text-slate-300 font-bold mt-0.5 text-[11px]">
                                  {m.score?.scoreText}
                                </div>
                              </div>
                            ) : (
                              <span className="text-amber-400 font-semibold text-[11px]">
                                {m.status === 'score_submitted' ? 'Onay Bekliyor' : 'Planlandı'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
