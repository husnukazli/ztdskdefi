import React, { useState, useEffect, useRef } from 'react';
import { Player } from '../types/defi';
import {
  Shuffle,
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  X,
  Play,
  FastForward,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlayoffDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  pot5to8: Player[];
  pot9to12: Player[];
  onCompleteDraw: (matches: Array<{ p1: Player; p2: Player }>) => void;
  isRedraw?: boolean;
}

export const PlayoffDrawModal: React.FC<PlayoffDrawModalProps> = ({
  isOpen,
  onClose,
  pot5to8,
  pot9to12,
  onCompleteDraw,
  isRedraw,
}) => {
  // Stages: 'confirm' -> 'drawing' -> 'done'
  const [stage, setStage] = useState<'confirm' | 'drawing' | 'done'>('confirm');

  // Prepared randomized pairs
  const [shuffledPairs, setShuffledPairs] = useState<Array<{ p1: Player; p2: Player }>>([]);

  // Animation states
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const [revealedMatches, setRevealedMatches] = useState<Array<{ p1: Player; p2: Player }>>([]);
  const [isSpinningP1, setIsSpinningP1] = useState<boolean>(false);
  const [isSpinningP2, setIsSpinningP2] = useState<boolean>(false);
  const [displayP1, setDisplayP1] = useState<Player | null>(null);
  const [displayP2, setDisplayP2] = useState<Player | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStage('confirm');
      setCurrentMatchIndex(0);
      setRevealedMatches([]);
      setDisplayP1(null);
      setDisplayP2(null);
      setIsSpinningP1(false);
      setIsSpinningP2(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawCeremony = () => {
    // Generate the random matchups
    const s5to8 = [...pot5to8].sort(() => Math.random() - 0.5);
    const s9to12 = [...pot9to12].sort(() => Math.random() - 0.5);

    const pairs = s5to8.map((p, i) => ({
      p1: p,
      p2: s9to12[i] || pot9to12[0],
    }));

    setShuffledPairs(pairs);
    setRevealedMatches([]);
    setCurrentMatchIndex(0);
    setStage('drawing');

    // Automatically trigger drawing the first pair
    triggerDrawPair(0, pairs);
  };

  const triggerDrawPair = (pairIdx: number, allPairs = shuffledPairs) => {
    if (pairIdx >= allPairs.length) {
      finishAll(allPairs);
      return;
    }

    const targetPair = allPairs[pairIdx];
    setCurrentMatchIndex(pairIdx);
    setIsSpinningP1(true);
    setIsSpinningP2(false);
    setDisplayP1(null);
    setDisplayP2(null);

    // 1. Reel spinning for Pot 2 (Player 1)
    let rollCountP1 = 0;
    const intervalP1 = setInterval(() => {
      rollCountP1++;
      const randomIdx = Math.floor(Math.random() * pot5to8.length);
      setDisplayP1(pot5to8[randomIdx]);

      if (rollCountP1 > 14) {
        clearInterval(intervalP1);
        setDisplayP1(targetPair.p1);
        setIsSpinningP1(false);

        // 2. Reel spinning for Pot 3 (Player 2)
        setTimeout(() => {
          setIsSpinningP2(true);
          let rollCountP2 = 0;
          const intervalP2 = setInterval(() => {
            rollCountP2++;
            const randomIdx = Math.floor(Math.random() * pot9to12.length);
            setDisplayP2(pot9to12[randomIdx]);

            if (rollCountP2 > 16) {
              clearInterval(intervalP2);
              setDisplayP2(targetPair.p2);
              setIsSpinningP2(false);

              // Pair locked in!
              setRevealedMatches((prev) => [...prev, targetPair]);

              try {
                confetti({
                  particleCount: 40,
                  spread: 45,
                  origin: { y: 0.6 },
                });
              } catch {
                // ignore
              }

              // Check if that was the last match
              if (pairIdx + 1 >= allPairs.length) {
                setTimeout(() => {
                  finishAll(allPairs);
                }, 1000);
              }
            }
          }, 80);
        }, 400);
      }
    }, 75);
  };

  const finishAll = (allPairs: Array<{ p1: Player; p2: Player }>) => {
    setRevealedMatches(allPairs);
    setStage('done');
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }
  };

  const handleSkipAnimation = () => {
    finishAll(shuffledPairs);
  };

  const handleSaveAndClose = () => {
    onCompleteDraw(shuffledPairs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-amber-950/80 via-slate-900 to-sky-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Shuffle className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Play-Off 1. Tur Kura Çekim Sistemi
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                  Madde 14
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ZTDSK Defi Ligi 2026-2027 • Eleme Aşaması Eşleşmeleri
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. CONFIRMATION STAGE */}
        {stage === 'confirm' && (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Shuffle className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h4 className="text-lg sm:text-xl font-bold text-white">
                {isRedraw ? 'Kura Çekimi Yenilenecektir' : 'Kura Çekimi Yapılacaktır, Emin Misiniz?'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                DEFİ Talimatnamesi <strong>Madde 14</strong> gereğince lig etabını 5, 6, 7 ve 8. sırada tamamlayan sporcular (2. Torba) ile 9, 10, 11 ve 12. sırada tamamlayan sporcular (3. Torba) kura ile 1. Tur eleme maçlarına eşleştirilecektir.
              </p>
            </div>

            {/* Pots summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-600/30 space-y-2">
                <div className="text-xs font-bold text-sky-400 flex items-center justify-between">
                  <span>2. Torba (5 - 8. Sıralar)</span>
                  <span className="text-[10px] bg-sky-900 text-sky-200 px-2 py-0.5 rounded-full">4 Oyuncu</span>
                </div>
                <div className="space-y-1 text-xs">
                  {pot5to8.map((p) => (
                    <div key={p.id} className="text-slate-300 flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center">
                        #{p.rank}
                      </span>
                      <span className="font-semibold">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>3. Torba (9 - 12. Sıralar)</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">4 Oyuncu</span>
                </div>
                <div className="space-y-1 text-xs">
                  {pot9to12.map((p) => (
                    <div key={p.id} className="text-slate-300 flex items-center gap-2">
                      <span className="w-4 h-4 rounded bg-slate-700 text-white text-[10px] font-bold flex items-center justify-center">
                        #{p.rank}
                      </span>
                      <span className="font-semibold">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={startDrawCeremony}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shuffle className="w-4 h-4" />
                <span>Evet, Canlı Kura Çekimini Başlat</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. ANIMATED DRAW CEREMONY STAGE */}
        {stage === 'drawing' && (
          <div className="p-6 space-y-6">
            {/* Draw Stage Header Banner */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  CANLI ÇEKİLİŞ • MAÇ {currentMatchIndex + 1} / {shuffledPairs.length}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSkipAnimation}
                className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Animasyonu Atla (Hızlı Tamamla)</span>
              </button>
            </div>

            {/* Live Draw Stage Screen */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-amber-500/30 relative overflow-hidden shadow-2xl">
              <div className="text-center text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">
                1. Tur Eleme Maçı #{currentMatchIndex + 1} Çekiliyor...
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center relative">
                {/* Pot 2 Selection Box */}
                <div
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-2 ${
                    isSpinningP1
                      ? 'border-sky-500 bg-sky-950/40 animate-pulse'
                      : displayP1
                      ? 'border-emerald-500 bg-emerald-950/30'
                      : 'border-slate-800 bg-slate-900'
                  }`}
                >
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                    2. Torba (5 - 8. Sıra)
                  </span>

                  {displayP1 ? (
                    <div className="space-y-1">
                      <div className="w-12 h-12 rounded-xl bg-sky-600 text-white font-black text-base flex items-center justify-center mx-auto shadow-md">
                        #{displayP1.rank}
                      </div>
                      <div className="font-bold text-white text-sm sm:text-base">
                        {displayP1.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {displayP1.ttfScore || 1800} TTF Puanı
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-xs text-slate-500 italic">
                      Kura çekiliyor...
                    </div>
                  )}
                </div>

                {/* VS Badge */}
                <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-amber-400 font-black text-xs items-center justify-center z-10 shadow-lg">
                  VS
                </div>

                {/* Pot 3 Selection Box */}
                <div
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-2 ${
                    isSpinningP2
                      ? 'border-amber-500 bg-amber-950/40 animate-pulse'
                      : displayP2
                      ? 'border-emerald-500 bg-emerald-950/30'
                      : 'border-slate-800 bg-slate-900'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    3. Torba (9 - 12. Sıra)
                  </span>

                  {displayP2 ? (
                    <div className="space-y-1">
                      <div className="w-12 h-12 rounded-xl bg-slate-700 text-white font-black text-base flex items-center justify-center mx-auto shadow-md">
                        #{displayP2.rank}
                      </div>
                      <div className="font-bold text-white text-sm sm:text-base">
                        {displayP2.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {displayP2.ttfScore || 1600} TTF Puanı
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-xs text-slate-500 italic">
                      {isSpinningP1 ? 'Rakip bekleniyor...' : 'Kura çekiliyor...'}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="mt-5 flex items-center justify-center gap-2">
                {shuffledPairs.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i < revealedMatches.length
                        ? 'w-6 bg-emerald-400'
                        : i === currentMatchIndex
                        ? 'w-6 bg-amber-400 animate-pulse'
                        : 'w-2 bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Previously Drawn Matches List */}
            {revealedMatches.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Belirlenen Eşleşmeler ({revealedMatches.length} / {shuffledPairs.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {revealedMatches.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-400">M{idx + 1}:</span>
                        <span className="font-semibold text-white">#{m.p1.rank} {m.p1.name}</span>
                      </div>
                      <span className="text-slate-500 text-[10px] font-bold">vs</span>
                      <div className="font-semibold text-slate-200">#{m.p2.rank} {m.p2.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step trigger button */}
            {!isSpinningP1 && !isSpinningP2 && currentMatchIndex + 1 < shuffledPairs.length && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => triggerDrawPair(currentMatchIndex + 1)}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-950/60"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Sıradaki Eşleşmeyi Çek (Maç {currentMatchIndex + 2})</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. DONE / REVEAL ALL STAGE */}
        {stage === 'done' && (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg sm:text-xl font-bold text-white">
                1. Tur Kura Çekimi Başarıyla Tamamlandı!
              </h4>
              <p className="text-xs text-slate-400">
                Aşağıdaki 4 eleme maçı resmen belirlenmiştir. Turnuva ağacına aktarabilirsiniz.
              </p>
            </div>

            {/* Complete Drawn Matches Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {revealedMatches.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-1.5">
                    <span className="font-bold text-amber-400">1. Tur Eleme Maçı #{idx + 1}</span>
                    <span className="text-[10px] text-slate-500">22-23 Şubat 2027</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span className="w-5 h-5 rounded bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center">
                          #{m.p1.rank}
                        </span>
                        <span>{m.p1.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{m.p1.ttfScore || 1800} P</span>
                    </div>

                    <div className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      vs
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-2 font-bold text-slate-200">
                        <span className="w-5 h-5 rounded bg-slate-700 text-white font-bold text-[11px] flex items-center justify-center">
                          #{m.p2.rank}
                        </span>
                        <span>{m.p2.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{m.p2.ttfScore || 1600} P</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={startDrawCeremony}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Kurasını Yeniden Çek</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndClose}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Eşleşmeleri Turnuva Ağacına Kaydet ve Kapat</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
