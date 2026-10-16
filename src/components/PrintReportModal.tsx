import React from 'react';
import { useDefi } from '../context/DefiContext';
import { Printer, X, Trophy, FileText, Calendar, CheckCircle2 } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ isOpen, onClose }) => {
  const { players, matches, settings } = useDefi();

  if (!isOpen) return null;

  const women = players.filter((p) => p.category === 'women').sort((a, b) => a.rank - b.rank);
  const men = players.filter((p) => p.category === 'men').sort((a, b) => a.rank - b.rank);
  const confirmedMatches = matches
    .filter((m) => m.status === 'confirmed')
    .sort((a, b) => b.matchDate.localeCompare(a.matchDate));

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative flex flex-col my-auto max-h-[95vh]">
        {/* Action bar (hidden in print) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Resmi Defi Ligi Raporu (PDF / Yazdır)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Yazdır / PDF Olarak Kaydet</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-white text-slate-900 text-xs font-sans print:p-0 print:m-0 print:overflow-visible print:bg-white print:text-black">
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 text-center">
            <div className="text-sm font-extrabold tracking-wider uppercase text-slate-900">
              {settings.clubName}
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 mt-1">
              ZTDSK KIŞ DEFİ LİGİ RESMİ DURUM RAPORU
            </h1>
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-600 font-medium mt-2">
              <span>Rapor Tarihi: {new Date().toLocaleDateString('tr-TR')}</span>
              <span>•</span>
              <span>Sezon: 05 Ekim 2026 – 28 Şubat 2027</span>
              <span>•</span>
              <span>Defi Koordinatörü: {settings.coordinatorName}</span>
            </div>
          </div>

          {/* Section 1: Kadınlar Sıralaması */}
          <div className="mb-6">
            <div className="bg-slate-100 p-2 border-l-4 border-rose-600 font-bold text-slate-900 uppercase text-xs mb-2">
              14(+) Tek Kadınlar Güncel Defi Sıralaması ({women.length} Sporcu)
            </div>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-200 border border-slate-300 text-slate-800">
                  <th className="p-1.5 border border-slate-300 w-12 text-center">Sıra</th>
                  <th className="p-1.5 border border-slate-300 text-left">Oyuncu Adı Soyadı</th>
                  <th className="p-1.5 border border-slate-300 text-center w-16">Maç</th>
                  <th className="p-1.5 border border-slate-300 text-center w-16">Galibiyet</th>
                  <th className="p-1.5 border border-slate-300 text-center w-16">Mağlubiyet</th>
                  <th className="p-1.5 border border-slate-300 text-center w-20">TTF Puanı</th>
                  <th className="p-1.5 border border-slate-300 text-center w-24">Play-Off Potası</th>
                </tr>
              </thead>
              <tbody>
                {women.map((p) => (
                  <tr key={p.id} className="border-b border-slate-300 hover:bg-slate-50">
                    <td className="p-1.5 border border-slate-300 text-center font-bold">#{p.rank}</td>
                    <td className="p-1.5 border border-slate-300 font-semibold">{p.name}</td>
                    <td className="p-1.5 border border-slate-300 text-center">{p.matchesPlayed}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-semibold text-emerald-700">{p.wins}</td>
                    <td className="p-1.5 border border-slate-300 text-center text-rose-700">{p.losses}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-mono">{p.ttfScore || '-'}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-bold">
                      {p.rank <= 4 ? 'Çeyrek Final (Bye)' : p.rank <= 12 ? '1. Tur Eleme' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Erkekler Sıralaması */}
          <div className="mb-6">
            <div className="bg-slate-100 p-2 border-l-4 border-sky-600 font-bold text-slate-900 uppercase text-xs mb-2">
              14(+) Tek Erkekler Güncel Defi Sıralaması ({men.length} Sporcu)
            </div>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-200 border border-slate-300 text-slate-800">
                  <th className="p-1.5 border border-slate-300 w-12 text-center">Sıra</th>
                  <th className="p-1.5 border border-slate-300 text-left">Oyuncu Adı Soyadı</th>
                  <th className="p-1.5 border border-slate-300 text-center w-16">Maç</th>
                  <th className="p-1.5 border border-slate-300 text-center w-16">Galibiyet</th>
                  <th className="p-1.5 border border-slate-300 text-center w-16">Mağlubiyet</th>
                  <th className="p-1.5 border border-slate-300 text-center w-20">TTF Puanı</th>
                  <th className="p-1.5 border border-slate-300 text-center w-24">Play-Off Potası</th>
                </tr>
              </thead>
              <tbody>
                {men.map((p) => (
                  <tr key={p.id} className="border-b border-slate-300 hover:bg-slate-50">
                    <td className="p-1.5 border border-slate-300 text-center font-bold">#{p.rank}</td>
                    <td className="p-1.5 border border-slate-300 font-semibold">{p.name}</td>
                    <td className="p-1.5 border border-slate-300 text-center">{p.matchesPlayed}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-semibold text-emerald-700">{p.wins}</td>
                    <td className="p-1.5 border border-slate-300 text-center text-rose-700">{p.losses}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-mono">{p.ttfScore || '-'}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-bold">
                      {p.rank <= 4 ? 'Çeyrek Final (Bye)' : p.rank <= 12 ? '1. Tur Eleme' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Oynanmış & Onaylanmış Maçlar Listesi */}
          <div className="mb-6">
            <div className="bg-slate-100 p-2 border-l-4 border-emerald-600 font-bold text-slate-900 uppercase text-xs mb-2">
              Oynanmış ve Onaylanmış Maçlar Kronolojik Listesi ({confirmedMatches.length} Maç)
            </div>
            {confirmedMatches.length === 0 ? (
              <div className="p-4 text-center text-slate-500 italic border border-slate-200">
                Henüz onaylanmış resmi maç skoru bulunmamaktadır.
              </div>
            ) : (
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-200 border border-slate-300 text-slate-800">
                    <th className="p-1.5 border border-slate-300 w-24 text-center">Tarih</th>
                    <th className="p-1.5 border border-slate-300 w-20 text-center">Kategori</th>
                    <th className="p-1.5 border border-slate-300 text-left">Meydan Okuyan</th>
                    <th className="p-1.5 border border-slate-300 text-left">Meydan Okunan</th>
                    <th className="p-1.5 border border-slate-300 text-center">Set Skorları</th>
                    <th className="p-1.5 border border-slate-300 text-left">Kazanan</th>
                    <th className="p-1.5 border border-slate-300 text-center w-24">Kort</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmedMatches.map((m) => {
                    const challenger = getPlayer(m.challengerId);
                    const defender = getPlayer(m.defenderId);
                    const winner = m.score ? getPlayer(m.score.winnerId) : null;

                    return (
                      <tr key={m.id} className="border-b border-slate-300 hover:bg-slate-50">
                        <td className="p-1.5 border border-slate-300 text-center font-medium">{m.matchDate}</td>
                        <td className="p-1.5 border border-slate-300 text-center">
                          {m.category === 'men' ? 'Erkekler' : 'Kadınlar'}
                        </td>
                        <td className="p-1.5 border border-slate-300 font-semibold">{challenger?.name}</td>
                        <td className="p-1.5 border border-slate-300 font-semibold">{defender?.name}</td>
                        <td className="p-1.5 border border-slate-300 text-center font-mono font-bold text-emerald-800">
                          {m.score?.scoreText}
                        </td>
                        <td className="p-1.5 border border-slate-300 font-bold text-slate-900">{winner?.name}</td>
                        <td className="p-1.5 border border-slate-300 text-center">{m.court || 'Merkez Kort'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Official Signatures Footer */}
          <div className="mt-8 pt-4 border-t border-slate-400 flex items-center justify-between text-slate-700 text-[11px]">
            <div>
              <p className="font-bold">ZTDSK Defi Komitesi</p>
              <p>Zonguldak Tenis Deniz Spor Kulübü</p>
            </div>
            <div className="text-right">
              <p className="font-bold">Defi Koordinatörü</p>
              <p>{settings.coordinatorName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
