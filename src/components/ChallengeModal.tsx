import React, { useState } from 'react';
import { Player } from '../types/defi';
import { useDefi } from '../context/DefiContext';
import { validateChallenge, buildWhatsAppChallengeUrl, buildWhatsAppGroupShareUrl, buildChallengeMessageText } from '../utils/defiRules';
import { X, AlertTriangle, CheckCircle, MessageSquare, Calendar, Clock, MapPin, Send, Info, Copy, Users } from 'lucide-react';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlayer: Player | null;
  onOpenLogin?: () => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  targetPlayer,
  onOpenLogin,
}) => {
  const { currentUser, players, matches, scheduleMatch, showToast } = useDefi();

  // Selected challenger: defaults to currentUser or first player if admin/guest
  const [challengerId, setChallengerId] = useState<string>(currentUser?.id || '');
  const [matchDate, setMatchDate] = useState<string>('2026-10-15');
  const [matchTime, setMatchTime] = useState<string>('18:00');
  const [court, setCourt] = useState<string>('A Kortu (Sert Kort)');
  const [notes, setNotes] = useState<string>('');
  const [showScheduleForm, setShowScheduleForm] = useState<boolean>(false);

  if (!isOpen || !targetPlayer) return null;

  // Active challenger
  const challenger = currentUser || players.find((p) => p.id === challengerId);

  // Run official club validation
  const validation = challenger
    ? validateChallenge(challenger, targetPlayer, matches, '2026-10-14')
    : { canChallenge: false, reason: 'Lütfen teklifte bulunmak için önce oyuncu seçiniz veya giriş yapınız.' };

  const handleSendWhatsAppGroup = () => {
    if (!challenger) return;
    const url = buildWhatsAppGroupShareUrl(challenger, targetPlayer);
    window.open(url, '_blank');
    showToast(`WhatsApp açılıyor: ZTDSK Defi Ligi Grubunu seçerek teklifi gönderebilirsiniz.`, 'success');
  };

  const handleCopyMessage = () => {
    if (!challenger) return;
    const text = buildChallengeMessageText(challenger, targetPlayer);
    navigator.clipboard.writeText(text);
    showToast('Resmi teklif metni kopyalandı! WhatsApp grubuna yapıştırabilirsiniz.', 'success');
  };

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challenger) return;

    scheduleMatch({
      category: targetPlayer.category,
      challengerId: challenger.id,
      defenderId: targetPlayer.id,
      challengerRankAtMatch: challenger.rank,
      defenderRankAtMatch: targetPlayer.rank,
      matchDate,
      matchTime,
      court,
      notes: notes || `Kort rezervasyonu ${challenger.name} tarafından yapıldı. Wilson maç topları.`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
              Defi Meydan Okuma
            </span>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{targetPlayer.name}</span>
              <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Sıra #{targetPlayer.rank}
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Challenger Selector if not logged in */}
          {!currentUser && (
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Teklif Eden Oyuncuyu Seçin:
                </label>
                {onOpenLogin && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLogin();
                    }}
                    className="text-[11px] text-emerald-400 hover:underline font-medium"
                  >
                    Giriş Yaparak Teklif Et
                  </button>
                )}
              </div>
              <select
                value={challengerId}
                onChange={(e) => setChallengerId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="">-- Teklif Yapacak Oyuncuyu Seçin --</option>
                {players
                  .filter((p) => p.category === targetPlayer.category && p.id !== targetPlayer.id)
                  .sort((a, b) => a.rank - b.rank)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.rank} - {p.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Validation Status Banner */}
          {challenger ? (
            validation.canChallenge ? (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-emerald-300">
                      Defi Teklifi Kurala Uygun!
                    </h3>
                    <p className="text-xs text-emerald-400/90 mt-1 leading-relaxed">
                      <strong>{challenger.name}</strong> (#{challenger.rank}),{' '}
                      <strong>{targetPlayer.name}</strong> (#{targetPlayer.rank}) oyuncusuna
                      resmi olarak meydan okuyabilir (Fark: {challenger.rank - targetPlayer.rank} basamak,
                      Madde 7 izin verilen azami 5 üst sıra sınırları dahilindedir).
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-rose-300">
                      Bu Oyuncuya Teklifte Bulunamazsınız!
                    </h3>
                    <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
                      {validation.reason}
                    </p>
                    {challenger && challenger.rank > 1 && (
                      <div className="mt-2 text-[11px] bg-rose-900/40 p-2 rounded-lg text-rose-200">
                        💡 <strong>İzin Verilen Teklif Aralığınız:</strong> #{Math.max(1, challenger.rank - 5)} ile #{challenger.rank - 1} sıraları arasındaki oyuncular.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="p-3 bg-slate-800/40 text-slate-400 text-xs rounded-xl flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Kural kontrolü için lütfen yukarıdan teklif edecek oyuncuyu belirleyin.</span>
            </div>
          )}

          {/* Friendly WhatsApp Message Preview */}
          {challenger && validation.canChallenge && (
            <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  Gruba Gönderilecek Maç Teklifi Mesajı:
                </span>
                <span className="text-[10px] text-slate-500">ZTDSK Grubu</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg text-xs font-sans text-slate-200 border border-slate-800 leading-relaxed whitespace-pre-line">
                {buildChallengeMessageText(challenger, targetPlayer)}
              </div>
            </div>
          )}

          {/* Rule Reminders */}
          <div className="bg-slate-950/50 border border-slate-800 p-3.5 rounded-xl space-y-1.5 text-xs text-slate-300">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              Kulüp Talimatnamesi Hatırlatmaları:
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
              <li>
                <strong>Madde 9:</strong> 1.5 saatlik kort rezervasyonu ve maç topları teklif eden oyuncuya aittir.
              </li>
              <li>
                <strong>Madde 15:</strong> 3 set üzerinden karar puanlı (No-Ad), 3. set 10'lu maç tie-break.
              </li>
              <li>
                <strong>Madde 13:</strong> Maç sonu kortta fotoğraf çekilerek WhatsApp grubunda paylaşılmalıdır.
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleSendWhatsAppGroup}
              disabled={!validation.canChallenge}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                validation.canChallenge
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/60 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>WhatsApp Grubunda Meydan Oku / Paylaş</span>
            </button>

            {validation.canChallenge && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="py-2 px-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  title="Resmi teklif metnini panoya kopyala"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Metni Kopyala</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowScheduleForm(!showScheduleForm)}
                  className="py-2 px-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span>{showScheduleForm ? 'Formu Kapat' : 'Takvime Kaydet'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Schedule Form */}
          {validation.canChallenge && showScheduleForm && (
            <form onSubmit={handleConfirmSchedule} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 animate-fade-in text-xs">
              <h4 className="font-semibold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-400" />
                Maç Randevusu Bilgileri
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Maç Tarihi:
                  </label>
                  <input
                    type="date"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Saat:
                  </label>
                  <input
                    type="time"
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Kort:
                </label>
                <select
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="A Kortu (Sert Kort)">A Kortu (Sert Kort)</option>
                  <option value="B Kortu (Sert Kort)">B Kortu (Sert Kort)</option>
                  <option value="C Kortu (Sert Kort)">C Kortu (Sert Kort)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Notlar / Top Markası:
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Örn: Wilson US Open topları, 1.5 saat rezervasyon onaylandı."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 rounded-lg text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Maçı Takvime Kaydet</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
