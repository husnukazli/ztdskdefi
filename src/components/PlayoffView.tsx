import React, { useState } from 'react';
import { useDefi } from '../context/DefiContext';
import { Award, Trophy, Sparkles, Shuffle, Calendar, CheckCircle2, ChevronRight, Medal } from 'lucide-react';
import { Player } from '../types/defi';

export const PlayoffView: React.FC = () => {
  const { players, currentCategory, settings } = useDefi();

  const top12 = players
    .filter((p) => p.category === currentCategory)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 12);

  // Groupings according to Rule 14
  const pot1to4 = top12.slice(0, 4); // 1, 2, 3, 4
  const pot5to8 = top12.slice(4, 8); // 5, 6, 7, 8
  const pot9to12 = top12.slice(8, 12); // 9, 10, 11, 12

  // Simulated draw state
  const [hasDrawnRound1, setHasDrawnRound1] = useState<boolean>(false);
  const [round1Matches, setRound1Matches] = useState<Array<{ p1: Player; p2: Player }>>([]);

  const handleDrawRound1 = () => {
    // Shuffle 5-8 against 9-12
    const shuffled5to8 = [...pot5to8].sort(() => Math.random() - 0.5);
    const shuffled9to12 = [...pot9to12].sort(() => Math.random() - 0.5);

    const matches = shuffled5to8.map((p, i) => ({
      p1: p,
      p2: shuffled9to12[i] || pot9to12[0],
    }));

    setRound1Matches(matches);
    setHasDrawnRound1(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-sky-950/40 border border-amber-600/30 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Play-Off Şampiyonası & Kura Sistemi (Madde 14)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tarih: <strong>{settings.playoffStartDate} – {settings.playoffEndDate}</strong> • İlk 12 Oyuncu Eleme Usulü
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDrawRound1}
          className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-amber-950/60 cursor-pointer self-start md:self-auto"
        >
          <Shuffle className="w-4 h-4" />
          <span>{hasDrawnRound1 ? '1. Tur Kurasını Yeniden Çek' : '1. Tur Kura Çekimini Başlat'}</span>
        </button>
      </div>

      {/* 3 Seed Pots Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pot A (1-4) */}
        <div className="bg-slate-900 border border-amber-600/40 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              1. Torba (1 - 4. Sıra)
            </span>
            <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full font-bold">
              Çeyrek Final (Bye)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Lig etabını ilk 4 sırada tamamlayan sporcular doğrudan çeyrek finale çıkar ve 1. turdan gelenlerle kura çeker.
          </p>
          <div className="space-y-1.5">
            {pot1to4.map((p) => (
              <div
                key={p.id}
                className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center justify-center">
                    #{p.rank}
                  </span>
                  <span className="font-semibold text-white">{p.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{p.ttfScore || 2000} P</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pot B (5-8) */}
        <div className="bg-slate-900 border border-sky-600/40 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              2. Torba (5 - 8. Sıra)
            </span>
            <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded-full font-bold">
              1. Eleme Turu
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            5-6-7-8 numaralı oyuncular, 9-10-11-12 numaralı oyuncular ile kura çekilerek eşleşir.
          </p>
          <div className="space-y-1.5">
            {pot5to8.map((p) => (
              <div
                key={p.id}
                className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center">
                    #{p.rank}
                  </span>
                  <span className="font-semibold text-white">{p.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{p.ttfScore || 1800} P</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pot C (9-12) */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              3. Torba (9 - 12. Sıra)
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold">
              1. Eleme Turu
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Lig etabında son 4 bileti alan sporcular, 5-8 torbasıyla kura çeker.
          </p>
          <div className="space-y-1.5">
            {pot9to12.map((p) => (
              <div
                key={p.id}
                className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-700 text-white font-bold text-[11px] flex items-center justify-center">
                    #{p.rank}
                  </span>
                  <span className="font-semibold text-white">{p.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{p.ttfScore || 1600} P</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tournament Progression Stages */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          Play-Off Turnuva Ağacı & Aşamaları (22 - 28 Şubat 2027)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Stage 1: Round 1 */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-sky-400">1. Tur Elemeleri</span>
              <span className="text-[10px] text-slate-400">22-23 Şubat</span>
            </div>

            {hasDrawnRound1 ? (
              <div className="space-y-2">
                {round1Matches.map((m, idx) => (
                  <div key={idx} className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px] space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold">Maç {idx + 1}</div>
                    <div className="font-semibold text-white truncate">#{m.p1.rank} {m.p1.name}</div>
                    <div className="text-slate-400 text-[10px]">vs</div>
                    <div className="font-semibold text-white truncate">#{m.p2.rank} {m.p2.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 italic">
                Yukarıdaki "Kura Çek" butonuna basarak 1. tur eşleşmelerini oluşturabilirsiniz.
              </div>
            )}
          </div>

          {/* Stage 2: Quarterfinals */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-400">Çeyrek Finaller</span>
              <span className="text-[10px] text-slate-400">24-25 Şubat</span>
            </div>

            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-amber-300">#1-{pot1to4[0]?.name || 'Seribaşı'}</div>
                <div className="text-[10px]">vs 1. Tur Galibi (Kura)</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-amber-300">#2-{pot1to4[1]?.name || 'Seribaşı'}</div>
                <div className="text-[10px]">vs 1. Tur Galibi (Kura)</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-amber-300">#3-{pot1to4[2]?.name || 'Seribaşı'}</div>
                <div className="text-[10px]">vs 1. Tur Galibi (Kura)</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-amber-300">#4-{pot1to4[3]?.name || 'Seribaşı'}</div>
                <div className="text-[10px]">vs 1. Tur Galibi (Kura)</div>
              </div>
            </div>
          </div>

          {/* Stage 3: Semifinals */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-400">Yarı Finaller</span>
              <span className="text-[10px] text-slate-400">26-27 Şubat</span>
            </div>

            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-300">Yarı Final 1</div>
                <div className="text-[10px]">Çeyrek Final 1 vs Çeyrek Final 2</div>
              </div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-300">Yarı Final 2</div>
                <div className="text-[10px]">Çeyrek Final 3 vs Çeyrek Final 4</div>
              </div>
            </div>
          </div>

          {/* Stage 4: Finals & 3rd Place */}
          <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-300">BÜYÜK FİNAL</span>
              <span className="text-[10px] text-amber-400 font-bold">28 Şubat</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-3 bg-gradient-to-r from-amber-950 to-slate-900 rounded-lg border border-amber-500/40 text-center space-y-1">
                <Medal className="w-6 h-6 text-amber-400 mx-auto" />
                <div className="font-bold text-white text-xs">ŞAMPİYONLUK MAÇI</div>
                <div className="text-[10px] text-amber-300">1.lik ve 2.lik Kupası</div>
              </div>

              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-center text-slate-400">
                <div className="font-semibold text-slate-300 text-[10px]">3.LÜK MAÇI</div>
                <div className="text-[10px]">Yarı Final Mağlupları</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Awards Info */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-300">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Defi ligini ilk 3 sırada bitiren sporcularımıza kupa ve özel sporcu ödülleri takdim edilecektir.</span>
        </div>
        <span className="font-semibold text-emerald-400">Zonguldak Tenis Deniz Spor Kulübü</span>
      </div>
    </div>
  );
};
