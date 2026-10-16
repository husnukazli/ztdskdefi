import React, { useState } from 'react';
import { useDefi } from '../context/DefiContext';
import { Player } from '../types/defi';
import {
  X,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';

interface ExcuseModalProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
}

export const OFFICIAL_EXCUSE_OPTIONS = [
  {
    id: 'sakatlik',
    label: 'Sakatlık / Tedavi Süreci',
    description: 'Fiziksel sakatlık, kas/eklem zorlanması veya hekim tedavisi.',
    icon: '🩹',
  },
  {
    id: 'sehir_disi',
    label: 'Şehir Dışı / İş Seyahati',
    description: 'Zonguldak dışı zorunlu görev, iş seyahati veya resmi görevlendirme.',
    icon: '✈️',
  },
  {
    id: 'saglik',
    label: 'Sağlık Problemi / Raporlu İstirahat',
    description: 'Hastalık, hekim raporu veya tedavi amaçlı istirahat hali.',
    icon: '🩺',
  },
  {
    id: 'sinav',
    label: 'Sınav Haftası / Akademik Çalışma',
    description: 'Üniversite/okul vize, final veya mesleki yeterlilik sınav haftası.',
    icon: '📚',
  },
  {
    id: 'resmi_izin',
    label: 'Resmi İzin / Komite Özel İzni',
    description: 'DEFİ Tertip Komitesi tarafından onaylanmış özel zaruri izin.',
    icon: '📋',
  },
  {
    id: 'diger',
    label: 'Diğer Zorunlu Mazeret',
    description: 'Yukarıdakiler dışında komiteye sunulmuş zorunlu ailevi/kişisel mazeret.',
    icon: '📌',
  },
];

export const ExcuseModal: React.FC<ExcuseModalProps> = ({ player, isOpen, onClose }) => {
  const { setPlayerExcuse, theme } = useDefi();
  const isLight = theme === 'light';

  // Format today's date in default league context (2026-10-14)
  const defaultStart = player.excuseStartDate || '2026-10-14';
  const defaultEnd = player.excuseEndDate || '2026-10-24';

  const [selectedReason, setSelectedReason] = useState<string>(() => {
    if (player.excuseReason) {
      const matched = OFFICIAL_EXCUSE_OPTIONS.find((opt) => player.excuseReason?.includes(opt.label));
      return matched ? matched.label : player.excuseReason;
    }
    return OFFICIAL_EXCUSE_OPTIONS[0].label;
  });

  const [customDetail, setCustomDetail] = useState<string>(player.excuseNotes || '');
  const [startDate, setStartDate] = useState<string>(defaultStart);
  const [endDate, setEndDate] = useState<string>(defaultEnd);
  const [showConfirmRemove, setShowConfirmRemove] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmitExcuse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('Lütfen başlangıç ve bitiş tarihlerini belirleyiniz.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('Başlangıç tarihi bitiş tarihinden sonra olamaz.');
      return;
    }

    setPlayerExcuse(player.id, true, selectedReason, startDate, endDate, customDetail);
    onClose();
  };

  const handleRemoveExcuse = () => {
    setPlayerExcuse(player.id, false);
    setShowConfirmRemove(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-5 border-b border-amber-600/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <PauseCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Oyuncu Mazeret Bildirimi
                </h3>
                <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  Madde 10
                </span>
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Sporcu: <strong>{player.name}</strong> (#{player.rank} • {player.category === 'men' ? 'Erkekler' : 'Kadınlar'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Excuse Status Banner */}
        {player.isExcused && !showConfirmRemove && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 text-xs">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Mevcut Durum: Mazeretli Olarak Kayıtlı</span>
              </div>
              <div className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                <strong>Mazeret:</strong> {player.excuseReason || 'Mazeret İzni'}
              </div>
              <div className="text-[11px] text-slate-400">
                <strong>Tarih Aralığı:</strong> {player.excuseStartDate || 'Belirtilmedi'} — {player.excuseEndDate || 'Belirtilmedi'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmRemove(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto shrink-0"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Mazereti Kaldır (Aktif Ol)</span>
            </button>
          </div>
        )}

        {/* Confirm Remove Prompt */}
        {showConfirmRemove && (
          <div className="bg-rose-950/40 border-b border-rose-600/50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Mazeret durumunu sonlandırıp hemen lige aktif dönmek istiyor musunuz?</span>
            </div>
            <p className="text-xs text-rose-200/80 leading-relaxed">
              Mazeretiniz kaldırıldığında DEFİ listesindeki turuncu işaret kalkar ve tekrar maç tekliflerine açık hale gelirsiniz.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleRemoveExcuse}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Evet, Mazereti Kaldır ve Aktifleş
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmRemove(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Vazgeç
              </button>
            </div>
          </div>
        )}

        {/* Excuse Form */}
        <form onSubmit={handleSubmitExcuse} className="p-5 space-y-5">
          {/* Rulebook Info Card */}
          <div className={`p-3.5 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
            isLight
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : 'bg-amber-950/20 border-amber-700/40 text-amber-200/90'
          }`}>
            <div className="font-bold flex items-center gap-1.5 text-amber-500">
              <ShieldCheck className="w-4 h-4" />
              <span>DEFİ Talimatnamesi Madde 10: Mazeret Esasları</span>
            </div>
            <p>
              Maç teklif edilen veya maç yapması gereken sporcu; <strong>sınav haftası</strong>,{' '}
              <strong>şehir dışı iş seyahati</strong>, <strong>şiddetli sağlık problemi / sakatlık</strong> gibi durumlarda
              DEFİ Tertip Komitesi'ne mazeret bildirerek ilgili tarihlerde mazeretli sayılabilir.
            </p>
            <p className="text-[11px] opacity-80">
              * Mazeret süresince defi tablosunda isminiz farklı renkte ve mazeret ikonlarıyla gösterilir; profilinize tıklandığında mazeretinizin başlangıç ve bitiş tarihleri üyelerce görüntülenebilir.
            </p>
          </div>

          {/* Option Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Mazeret Sebebi Seçiniz (Kural Kitabı)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {OFFICIAL_EXCUSE_OPTIONS.map((opt) => {
                const isSelected = selectedReason === opt.label;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedReason(opt.label)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-white font-bold shadow-xs'
                        : isLight
                        ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <span className="text-lg shrink-0">{opt.icon}</span>
                    <div className="space-y-0.5">
                      <div className="font-bold flex items-center gap-1">
                        <span>{opt.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal leading-tight">
                        {opt.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Mazeret Başlangıç Tarihi:</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium transition focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Mazeret Bitiş Tarihi:</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium transition focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Ek Açıklama / Not (Opsiyonel):</span>
            </label>
            <input
              type="text"
              placeholder="Örn: 10 gün süreli iş seyahati / Hekim istirahat raporu mevcuttur."
              value={customDetail}
              onChange={(e) => setCustomDetail(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-xl border text-xs transition focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900'
                  : 'bg-slate-950 border-slate-800 text-white'
              }`}
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Kapat
            </button>

            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-950/60 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{player.isExcused ? 'Mazeret Bilgilerini Güncelle' : 'Mazeret Bildirimini Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
