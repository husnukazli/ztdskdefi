import React, { useState } from 'react';
import { useDefi } from '../context/DefiContext';
import { Match, Player } from '../types/defi';
import { CheckCircle2, Calendar, MapPin, Trophy, Search, Filter, Camera, Swords, Trash2 } from 'lucide-react';

interface MatchArchiveProps {
  onOpenScoreModal?: (match: Match) => void;
}

export const MatchArchive: React.FC<MatchArchiveProps> = ({ onOpenScoreModal }) => {
  const { matches, players, currentCategory, isAdmin, deleteMatch, theme } = useDefi();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'score_submitted' | 'scheduled'>('all');
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  const isLight = theme === 'light';

  const categoryMatches = matches
    .filter((m) => m.category === currentCategory && m.status !== 'cancelled')
    .sort((a, b) => b.matchDate.localeCompare(a.matchDate));

  const getPlayer = (id: string): Player | undefined => players.find((p) => p.id === id);

  const filteredMatches = categoryMatches.filter((m) => {
    const p1 = getPlayer(m.challengerId);
    const p2 = getPlayer(m.defenderId);
    const searchMatch =
      p1?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p2?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.matchDate.includes(searchTerm);

    if (!searchMatch) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {currentCategory === 'men' ? '14(+) Tek Erkekler' : '14(+) Tek Kadınlar'} Maç Arşivi
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Lig bünyesinde oynanmış tüm maçların set skorları, kazananları ve randevuları.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Oyuncu veya tarih ara..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tümü ({categoryMatches.length})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                statusFilter === 'confirmed' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Onaylı Skorlar
            </button>
            <button
              onClick={() => setStatusFilter('scheduled')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                statusFilter === 'scheduled' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Planlananlar
            </button>
          </div>
        </div>
      </div>

      {/* Match Cards List */}
      {filteredMatches.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500">
          Arama kriterine uygun maç kaydı bulunamadı.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((m) => {
            const challenger = getPlayer(m.challengerId);
            const defender = getPlayer(m.defenderId);
            const winner = m.score ? getPlayer(m.score.winnerId) : null;

            return (
              <div
                key={m.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                {/* Left: Date, Court & Players */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      {m.matchDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {m.court || 'Merkez Kort'} {m.matchTime ? `(${m.matchTime})` : ''}
                    </span>
                  </div>

                  {/* Players Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-[11px]">
                        #{m.challengerRankAtMatch}
                      </span>
                      <span className={`text-sm font-bold ${winner?.id === challenger?.id ? 'text-emerald-400' : 'text-white'}`}>
                        {challenger?.name}
                      </span>
                    </div>

                    <span className="text-xs text-slate-500 font-semibold">vs</span>

                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-sky-950 text-sky-400 border border-sky-800 flex items-center justify-center font-bold text-[11px]">
                        #{m.defenderRankAtMatch}
                      </span>
                      <span className={`text-sm font-bold ${winner?.id === defender?.id ? 'text-emerald-400' : 'text-white'}`}>
                        {defender?.name}
                      </span>
                    </div>
                  </div>

                  {m.notes && (
                    <div className="text-[11px] text-slate-400 italic">
                      {m.notes}
                    </div>
                  )}
                </div>

                {/* Right: Score & Status */}
                <div className="flex items-center gap-4 self-end md:self-auto">
                  {m.score ? (
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400 uppercase font-semibold">
                        {m.score.finishType === 'walkover' || m.finishType === 'walkover' || m.score.scoreText.includes('W.O.') ? (
                          <span className="bg-purple-950/90 text-purple-300 border border-purple-700/80 px-2 py-0.5 rounded-full font-bold">
                            Hükmen (W.O.)
                          </span>
                        ) : m.score.finishType === 'retired' || m.finishType === 'retired' || m.score.scoreText.includes('(Ret.') ? (
                          <span className="bg-amber-950/90 text-amber-300 border border-amber-600/80 px-2 py-0.5 rounded-full font-bold">
                            Çekilme / Terk (Ret.)
                          </span>
                        ) : (
                          <span>Nihai Skor (Karar Puanlı)</span>
                        )}
                      </div>
                      <div className="text-sm sm:text-base font-mono font-bold text-emerald-400 tracking-wider">
                        {m.score.scoreText}
                      </div>
                      <div className="text-[11px] text-slate-300 flex items-center gap-1 justify-end font-semibold">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Kazanan: {winner?.name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="bg-sky-950 text-sky-300 border border-sky-800 text-xs px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                        <Swords className="w-3.5 h-3.5" />
                        Oynanacak
                      </span>
                    </div>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => setMatchToDelete(m)}
                      className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl border border-rose-300 dark:border-rose-800 transition cursor-pointer"
                      title="Maç Eşleştirmesini İptal Et & Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {m.photoUrl && (
                    <a
                      href={m.photoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-white bg-slate-950 rounded-xl border border-slate-800 transition"
                      title="Kort Fotoğrafını Gör"
                    >
                      <Camera className="w-4 h-4 text-sky-400" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MAÇ SİLME / İPTAL ONAY MODALI */}
      {matchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border-2 border-rose-500 ${
            isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0 border border-rose-300 dark:border-rose-700 shadow-sm">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  Maç Eşleştirmesini İptal Et & Sil
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Bu maç eşleştirmesi arşivden, takvimden ve ana sayfa listesinden tamamen silinecektir.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
                {getPlayer(matchToDelete.challengerId)?.name || 'Oyuncu'} (#{matchToDelete.challengerRankAtMatch}) vs {getPlayer(matchToDelete.defenderId)?.name || 'Oyuncu'} (#{matchToDelete.defenderRankAtMatch})
              </div>
              <div className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                Tarih: <strong>{matchToDelete.matchDate} {matchToDelete.matchTime}</strong>
              </div>
              <div className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                Kort: <strong>{matchToDelete.court}</strong> • Kategori: <strong>{matchToDelete.category === 'men' ? '14(+) Erkekler' : '14(+) Kadınlar'}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMatchToDelete(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMatch(matchToDelete.id);
                  setMatchToDelete(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow"
              >
                Evet, Eşleştirmeyi İptal Et ve Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
