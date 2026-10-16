import React from 'react';
import { useDefi } from '../context/DefiContext';
import { Trophy, Lock, User, Shield, Award, Sparkles, LogIn, ArrowRight } from 'lucide-react';
import { Category } from '../types/defi';

interface PublicLandingProps {
  onOpenLoginModal: (mode?: 'player' | 'admin') => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({ onOpenLoginModal }) => {
  const { players, currentCategory, setCurrentCategory, settings } = useDefi();

  const womenCount = players.filter((p) => p.category === 'women').length;
  const menCount = players.filter((p) => p.category === 'men').length;

  const categoryPlayers = players
    .filter((p) => p.category === currentCategory)
    .sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-6">
      {/* Club Welcome Hero */}
      <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-sky-950/60 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-extrabold tracking-wider text-emerald-400 uppercase">
                {settings.clubName} • 1951'den Günümüze
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ZTDSK KIŞ DEFİ LİGİ
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Resmi Zonguldak Tenis Deniz Spor Kulübü Defi Sıralama Portalı. Defi teklifi göndermek,
              maç takvimini görüntülemek ve skor kaydetmek için lütfen üye girişi yapınız.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenLoginModal('player')}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/80 transition cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Oyuncu Girişi Yap</span>
            </button>
            <button
              onClick={() => onOpenLoginModal('admin')}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-4 py-3 rounded-2xl text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Yönetici Girişi</span>
            </button>
          </div>
        </div>

        {/* Info Strip */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>Defi Koordinatörü: <strong className="text-slate-200">{settings.coordinatorName}</strong></span>
            <span>•</span>
            <span>Sezon: <strong className="text-slate-200">05 Ekim 2026 – 21 Şubat 2027</strong></span>
          </div>
          <div className="flex items-center gap-2 text-amber-300 bg-amber-950/40 border border-amber-800/40 px-3 py-1 rounded-xl text-[11px]">
            <Lock className="w-3.5 h-3.5" />
            <span>Maç detayları ve takvim sadece giriş yapan üyelere açıktır.</span>
          </div>
        </div>
      </div>

      {/* Category Tabs: Kadın Sıralaması / Erkek Sıralaması */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-2 shadow-lg">
          <button
            onClick={() => setCurrentCategory('women')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
              currentCategory === 'women'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>14(+) Tek Kadınlar Sıralaması</span>
            <span className="bg-slate-950/60 px-2 py-0.5 rounded-full text-xs font-bold">
              {womenCount}
            </span>
          </button>

          <button
            onClick={() => setCurrentCategory('men')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
              currentCategory === 'men'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>14(+) Tek Erkekler Sıralaması</span>
            <span className="bg-slate-950/60 px-2 py-0.5 rounded-full text-xs font-bold">
              {menCount}
            </span>
          </button>
        </div>
      </div>

      {/* Main Public Ranking Ladder */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>
                {currentCategory === 'women' ? '14(+) Tek Kadınlar' : '14(+) Tek Erkekler'} Güncel Defi Sıralaması
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Lig sonunda ilk 12 sporcu Play-Off aşamasına yükselecektir.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Award className="w-4 h-4 text-amber-400" />
              1-4: Doğrudan Çeyrek Final
            </span>
            <span className="flex items-center gap-1.5 text-sky-300">
              <Sparkles className="w-4 h-4 text-sky-400" />
              5-12: 1. Eleme Turu
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px]">
                <th className="py-3.5 px-4 w-16 text-center">Sıra</th>
                <th className="py-3.5 px-4">Oyuncu Adı</th>
                <th className="py-3.5 px-3 text-center">Maç (G/M)</th>
                <th className="py-3.5 px-3 text-center hidden md:table-cell">TTF Puanı</th>
                <th className="py-3.5 px-3 text-center">Play-Off Potası</th>
                <th className="py-3.5 px-4 text-right">Meydan Okuma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {categoryPlayers.map((player) => {
                const isTop4 = player.rank <= 4;
                const isTop12 = player.rank <= 12;

                return (
                  <tr
                    key={player.id}
                    className={`hover:bg-slate-800/30 transition ${
                      player.rank === 12 ? 'border-b-2 border-b-sky-600/80' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-bold text-xs ${
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
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg ${
                            player.avatarBg || 'bg-slate-700'
                          } text-white font-bold flex items-center justify-center text-xs shrink-0`}
                        >
                          {player.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{player.name}</div>
                          <div className="text-[11px] text-slate-400">ZTDSK Defi Üyesi</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="text-emerald-400 font-semibold">{player.wins}G</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-rose-400 font-semibold">{player.losses}M</span>
                    </td>

                    <td className="py-3 px-3 text-center hidden md:table-cell font-mono text-slate-400">
                      {player.ttfScore || '-'}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {isTop4 ? (
                        <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-bold">
                          Çeyrek Final (Bye)
                        </span>
                      ) : isTop12 ? (
                        <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded-full font-bold">
                          Play-Off Eleme
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenLoginModal('player')}
                        className="px-3 py-1.5 rounded-xl font-semibold text-xs bg-slate-800/80 hover:bg-emerald-600 hover:text-slate-950 text-slate-300 border border-slate-700 transition inline-flex items-center gap-1.5 cursor-pointer"
                        title="Maç teklifi göndermek için oyuncu girişi yapınız"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Meydan Oku</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-sky-500 rounded-full" />
            <span>Mavi çizgi Play-Off barajıdır (İlk 12 sporcu).</span>
          </div>
          <button
            onClick={() => onOpenLoginModal('player')}
            className="text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Takvimi ve Maçları Görmek İçin Giriş Yapınız</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
