import React, { useState } from 'react';
import { useDefi } from '../context/DefiContext';
import { Match, Player } from '../types/defi';
import { CheckCircle2, Calendar, MapPin, Trophy, Search, Filter, Camera, Swords } from 'lucide-react';

interface MatchArchiveProps {
  onOpenScoreModal?: (match: Match) => void;
}

export const MatchArchive: React.FC<MatchArchiveProps> = ({ onOpenScoreModal }) => {
  const { matches, players, currentCategory } = useDefi();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'score_submitted' | 'scheduled'>('all');

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
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Nihai Skor (Karar Puanlı)
                      </div>
                      <div className="text-base sm:text-lg font-mono font-bold text-emerald-400 tracking-wider">
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
    </div>
  );
};
