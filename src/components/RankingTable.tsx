import React, { useState } from 'react';
import { Player } from '../types/defi';
import { useDefi } from '../context/DefiContext';
import { Trophy, ArrowUp, ArrowDown, Minus, Swords, Phone, Search, Award, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

interface RankingTableProps {
  onChallengePlayer: (player: Player) => void;
  onSelectPlayerDetail: (player: Player) => void;
}

export const RankingTable: React.FC<RankingTableProps> = ({
  onChallengePlayer,
  onSelectPlayerDetail,
}) => {
  const { players, currentCategory, currentUser, isAdmin } = useDefi();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categoryPlayers = players
    .filter((p) => p.category === currentCategory)
    .sort((a, b) => a.rank - b.rank);

  const filtered = categoryPlayers.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-4">
      {/* Top Banner & Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Trophy className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {currentCategory === 'men' ? '14(+) Tek Erkekler' : '14(+) Tek Kadınlar'} Canlı Defi Sıralaması
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Madde 7 gereği oyuncular en fazla <strong>5 üst basamağa</strong> meydan okuyabilir.
            İlk 12 sporcu sezon sonunda Play-Off aşamasına kalacaktır.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="İsim veya tel ara..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Play-Off Qualification Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-2.5 bg-amber-950/30 border border-amber-600/30 rounded-xl flex items-center gap-2 text-amber-200">
          <Award className="w-4 h-4 text-amber-400 shrink-0" />
          <span><strong>1 - 4. Sıra:</strong> Play-Off Çeyrek Final (Doğrudan)</span>
        </div>
        <div className="p-2.5 bg-sky-950/30 border border-sky-600/30 rounded-xl flex items-center gap-2 text-sky-200">
          <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
          <span><strong>5 - 12. Sıra:</strong> Play-Off 1. Eleme Turu</span>
        </div>
        <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2 text-slate-400">
          <Swords className="w-4 h-4 text-emerald-400 shrink-0" />
          <span><strong>Maksimum Teklif:</strong> 5 Sıra Üstü</span>
        </div>
      </div>

      {/* Main Ranking Ladder */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-16 text-center">Sıra</th>
                <th className="py-3.5 px-3 w-14 text-center">Değişim</th>
                <th className="py-3.5 px-4">Oyuncu & Kulüp Bilgisi</th>
                <th className="py-3.5 px-3 text-center">Maç (G/M)</th>
                <th className="py-3.5 px-3 text-center hidden md:table-cell">TTF Puanı</th>
                <th className="py-3.5 px-3 text-center">Durum</th>
                <th className="py-3.5 px-4 text-right">Meydan Okuma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((player) => {
                const isMe = currentUser?.id === player.id;
                const prev = player.previousRank ?? player.rank;
                const diff = prev - player.rank; // Positive means moved up!

                // Check eligibility for challenge if user is logged in
                const isAboveMe = currentUser && player.rank < currentUser.rank;
                const isWithin5 = currentUser && currentUser.rank - player.rank <= 5;
                const canChallengeMe = isAboveMe && isWithin5 && !player.isExcused;

                // Qualification tier
                const isTop4 = player.rank <= 4;
                const isTop12 = player.rank <= 12;

                return (
                  <tr
                    key={player.id}
                    className={`transition-colors hover:bg-slate-800/40 ${
                      isMe ? 'bg-emerald-950/30 ring-1 ring-emerald-500/40' : ''
                    } ${player.rank === 12 ? 'border-b-2 border-b-sky-700/80' : ''}`}
                  >
                    {/* Rank Badge */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            player.rank === 1
                              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                              : player.rank === 2
                              ? 'bg-slate-300 text-slate-950'
                              : player.rank === 3
                              ? 'bg-amber-700 text-white'
                              : isTop4
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : isTop12
                              ? 'bg-sky-950 text-sky-300 border border-sky-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          #{player.rank}
                        </span>
                      </div>
                    </td>

                    {/* Rank Change Arrow */}
                    <td className="py-3 px-3 text-center">
                      {diff > 0 ? (
                        <div className="inline-flex items-center gap-0.5 text-emerald-400 font-bold text-[11px]">
                          <ArrowUp className="w-3.5 h-3.5" />
                          <span>+{diff}</span>
                        </div>
                      ) : diff < 0 ? (
                        <div className="inline-flex items-center gap-0.5 text-rose-400 font-bold text-[11px]">
                          <ArrowDown className="w-3.5 h-3.5" />
                          <span>{diff}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center text-slate-600">
                          <Minus className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </td>

                    {/* Player Info (Clickable for profile) */}
                    <td className="py-3 px-4">
                      <div
                        onClick={() => onSelectPlayerDetail(player)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg ${
                            player.avatarBg || 'bg-slate-700'
                          } text-white font-bold flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform`}
                        >
                          {player.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-emerald-400 transition flex items-center gap-1.5">
                            <span>{player.name}</span>
                            {isMe && (
                              <span className="text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                                Siz
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{player.phone}</span>
                            {player.isNewJoiner && (
                              <span className="text-amber-400 text-[10px] bg-amber-950/60 px-1 rounded">
                                Yeni Katılan
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Matches W/L */}
                    <td className="py-3 px-3 text-center">
                      <div className="font-semibold text-white">
                        <span className="text-emerald-400">{player.wins}G</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-rose-400">{player.losses}M</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {player.matchesPlayed} maç
                      </div>
                    </td>

                    {/* TTF Score */}
                    <td className="py-3 px-3 text-center hidden md:table-cell">
                      <span className="font-mono text-slate-300">
                        {player.ttfScore || '-'}
                      </span>
                    </td>

                    {/* Status / Excuse */}
                    <td className="py-3 px-3 text-center">
                      {player.isExcused ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800"
                          title={player.excuseReason || 'Mazeret izinli'}
                        >
                          <ShieldAlert className="w-3 h-3 text-amber-400" />
                          Mazeretli
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                          <UserCheck className="w-3 h-3 text-emerald-400" />
                          Aktif
                        </span>
                      )}
                    </td>

                    {/* Actions: Challenge Button */}
                    <td className="py-3 px-4 text-right">
                      {isMe ? (
                        <span className="text-[11px] text-slate-500 italic">Sizin Sıranız</span>
                      ) : (
                        <button
                          onClick={() => onChallengePlayer(player)}
                          className={`px-3 py-1.5 rounded-xl font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer ${
                            canChallengeMe
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          <Swords className="w-3.5 h-3.5" />
                          <span>Meydan Oku</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Qualification Line Indicator Note */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-sky-500 rounded-full" />
            <span>Mavi çizgi Play-Off barajıdır (İlk 12 sporcu). Sezon sonu 22-28 Şubat 2027 tarihlerinde eleme oynanır.</span>
          </div>
          <span className="font-medium text-slate-300">
            Toplam: {categoryPlayers.length} Oyuncu
          </span>
        </div>
      </div>
    </div>
  );
};
