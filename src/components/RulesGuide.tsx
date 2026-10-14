import React, { useState } from 'react';
import { OFFICIAL_RULES } from '../data/initialData';
import { useDefi } from '../context/DefiContext';
import { BookOpen, Search, Phone, Shield, Calendar, Trophy, MessageSquare, AlertCircle } from 'lucide-react';

export const RulesGuide: React.FC = () => {
  const { settings } = useDefi();
  const [search, setSearch] = useState<string>('');

  const filteredRules = OFFICIAL_RULES.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.text.toLowerCase().includes(search.toLowerCase()) ||
      r.number.toString() === search
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {settings.clubName} Resmi Defi Ligi Talimatnamesi
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            14 Yaş (+) Tek Erkekler & 14 Yaş(+) Tek Kadınlar Defi Ligi resmi 17 maddelik yönetmelik metni.
          </p>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kural veya madde ara..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Coordinator & Official Info Card */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-sky-950/60 border border-emerald-600/30 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-slate-950 font-bold flex items-center justify-center text-sm shadow">
            VB
          </div>
          <div>
            <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
              Defi Koordinatörü (Madde 6)
            </div>
            <div className="text-base font-bold text-white mt-0.5">{settings.coordinatorName}</div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>İletişim: {settings.coordinatorPhone}</span>
              <span>•</span>
              <span className="text-sky-400">Resmi Kulüp WhatsApp Grubu</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Giriş Ücreti:</span>
            <span className="font-bold text-amber-300">1.500 TL (Kulüp Bağışı)</span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Maç Formatı:</span>
            <span className="font-bold text-emerald-400">3 Set / No-Ad / 10'lu TB</span>
          </div>
        </div>
      </div>

      {/* 17 Rules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map((rule) => {
          const isHighlight = [7, 8, 14, 15].includes(rule.number);

          return (
            <div
              key={rule.number}
              className={`p-5 rounded-2xl border space-y-2.5 transition ${
                isHighlight
                  ? 'bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isHighlight
                        ? 'bg-emerald-600 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    #{rule.number}
                  </span>
                  <h3 className="font-bold text-white text-xs sm:text-sm">
                    {rule.title}
                  </h3>
                </div>

                {isHighlight && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Önemli Madde
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {rule.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
