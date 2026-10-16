import React, { useState } from 'react';
import { useDefi } from '../context/DefiContext';
import { Match, Player } from '../types/defi';
import { CheckCircle2, Clock, Trophy, AlertTriangle, Swords, Calendar, MapPin, XCircle, LogIn, Sparkles, Trash2, PauseCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExcuseModal } from './ExcuseModal';

interface MyMatchesProps {
  onOpenScoreModal: (match: Match) => void;
  onOpenLoginModal: () => void;
}

export const MyMatches: React.FC<MyMatchesProps> = ({ onOpenScoreModal, onOpenLoginModal }) => {
  const { currentUser, matches, players, confirmScore, cancelMatch, isAdmin, theme } = useDefi();
  const [matchToCancel, setMatchToCancel] = useState<Match | null>(null);
  const [isExcuseModalOpen, setIsExcuseModalOpen] = useState<boolean>(false);
  const isLight = theme === 'light';

  if (!currentUser) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
          <LogIn className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">Oyuncu Girişi Yapınız</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Tanımlanmış maçlarınızı görmek, skor girmek ve rakibinizin girdiği skora onay vermek için
          lütfen isminizi listeden seçip şifrenizle giriş yapınız.
        </p>
        <button
          onClick={onOpenLoginModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-950/60 cursor-pointer"
        >
          Giriş Yap Ekranını Aç
        </button>
      </div>
    );
  }

  const getOpponent = (m: Match): Player | undefined => {
    const oppId = m.challengerId === currentUser.id ? m.defenderId : m.challengerId;
    return players.find((p) => p.id === oppId);
  };

  const myMatches = matches.filter(
    (m) =>
      (m.challengerId === currentUser.id || m.defenderId === currentUser.id) &&
      m.status !== 'cancelled'
  );

  // 1. Pending confirmation (where current user is the loser or participant and score is submitted)
  const pendingConfirmations = myMatches.filter(
    (m) => m.status === 'score_submitted' && m.score?.loserId === currentUser.id
  );

  // 2. Pending score submission (scheduled matches where match date has arrived or past)
  const pendingScoreSubmissions = myMatches.filter(
    (m) => m.status === 'scheduled'
  );

  // 3. Awaiting opponent's confirmation (I submitted score, waiting for opponent)
  const awaitingOpponentConfirmation = myMatches.filter(
    (m) => m.status === 'score_submitted' && m.score?.winnerId === currentUser.id
  );

  // 4. Completed
  const completedMatches = myMatches.filter((m) => m.status === 'confirmed');

  const handleConfirm = (matchId: string) => {
    confirmScore(matchId);
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Player Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl ${
              currentUser.avatarBg || 'bg-emerald-600'
            } text-white font-bold flex items-center justify-center text-lg shadow-lg border border-white/10`}
          >
            {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Defi Sırası #{currentUser.rank}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser.category === 'men' ? '14(+) Tek Erkekler' : '14(+) Tek Kadınlar'} Ligi • {currentUser.phone}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center text-xs">
            <div className="text-slate-400 text-[10px]">Toplam Maç</div>
            <div className="font-bold text-white text-sm">{currentUser.matchesPlayed}</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center text-xs">
            <div className="text-slate-400 text-[10px]">Galibiyet / Mağl.</div>
            <div className="font-bold text-emerald-400 text-sm">
              {currentUser.wins} <span className="text-slate-600">/</span>{' '}
              <span className="text-rose-400">{currentUser.losses}</span>
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center text-xs">
            <div className="text-slate-400 text-[10px]">TTF Puanı</div>
            <div className="font-bold text-sky-400 font-mono text-sm">
              {currentUser.ttfScore || 1500}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExcuseModalOpen(true)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer self-stretch sm:self-auto ${
              currentUser.isExcused
                ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/40'
            }`}
          >
            <PauseCircle className="w-4 h-4 text-amber-400" />
            <span>{currentUser.isExcused ? 'Mazereti Yönet / Kaldır' : 'Mazeret Bildir (Madde 10)'}</span>
          </button>
        </div>
      </div>

      {/* Active Excuse Alert Banner if currentUser is Excused */}
      {currentUser.isExcused && (
        <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-amber-950/60 border-2 border-amber-500/80 rounded-2xl p-4.5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 text-xs">
            <div className="font-bold text-amber-400 flex items-center gap-2">
              <PauseCircle className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-sm">Şu Anda Mazeret İzinli Statüsündesiniz (Madde 10)</span>
            </div>
            <div className="text-white">
              <strong>Mazeret:</strong> {currentUser.excuseReason || 'Mazeretli'}
            </div>
            <div className="text-amber-200/80 text-[11px]">
              <strong>İzin Tarihleri:</strong> {currentUser.excuseStartDate || 'Belirtilmedi'} – {currentUser.excuseEndDate || 'Belirtilmedi'} • Bu tarihlerde sıralamanız korunur ve maç tekliflerine kapalı sayılırsınız.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsExcuseModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer self-start sm:self-auto shrink-0 shadow-sm"
          >
            Mazereti Düzenle / Kaldır
          </button>
        </div>
      )}

      {/* 1. URGENT: PENDING OPPONENT'S SCORE CONFIRMATION */}
      {pendingConfirmations.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-600/50 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
            <h3 className="font-bold text-sm sm:text-base">
              Onayınızı Bekleyen Maç Skoru ({pendingConfirmations.length})
            </h3>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            Rakibiniz maç skorunu sisteme girmiştir. Çift taraflı onay kuralı gereğince skoru kontrol edip
            onayladığınızda defi ligi sıralaması resmi olarak güncellenecektir.
          </p>

          <div className="space-y-3 pt-2">
            {pendingConfirmations.map((m) => {
              const opp = getOpponent(m);
              if (!opp || !m.score) return null;

              return (
                <div
                  key={m.id}
                  className="bg-slate-900 border border-amber-700/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      <span>{m.matchDate}</span>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{m.court || 'Merkez Kort'}</span>
                    </div>

                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>vs {opp.name} (#{opp.rank})</span>
                      <span className="text-xs text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded font-mono font-bold">
                        Bildirilen Skor: {m.score.scoreText}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Kazanan olarak iletilen: <strong className="text-white">{players.find((p) => p.id === m.score?.winnerId)?.name}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => handleConfirm(m.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Skoru Onayla & Sıralamayı Yenile</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. WAITING OPPONENT'S CONFIRMATION (SUBMITTED BY ME) */}
      {awaitingOpponentConfirmation.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            Rakibin Onaylaması Beklenen Maçlarınız ({awaitingOpponentConfirmation.length})
          </h3>
          <div className="space-y-2">
            {awaitingOpponentConfirmation.map((m) => {
              const opp = getOpponent(m);
              return (
                <div
                  key={m.id}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">vs {opp?.name} (#{opp?.rank})</span>
                    <span className="text-slate-400 text-[11px] ml-2">({m.matchDate})</span>
                    <div className="text-emerald-400 font-mono font-bold mt-0.5">
                      Girdiğiniz Skor: {m.score?.scoreText}
                    </div>
                  </div>
                  <span className="text-amber-400 text-[11px] bg-amber-950/60 border border-amber-800/80 px-2 py-1 rounded-lg">
                    Rakip onayı bekleniyor
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SCHEDULED MATCHES TO PLAY / REPORT SCORE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
            <Swords className="w-4 h-4 text-emerald-400" />
            Tanımlanmış / Skor Girişi Bekleyen Maçlarım ({pendingScoreSubmissions.length})
          </h3>
          <span className="text-xs text-slate-400">
            Kazanan oyuncu skoru girer
          </span>
        </div>

        {pendingScoreSubmissions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
            Şu anda bekleyen veya tanımlanmış maçınız bulunmuyor. Defi tablosundan 5 üst sıranıza meydan okuyabilirsiniz!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingScoreSubmissions.map((m) => {
              const opp = getOpponent(m);
              const isChallenger = m.challengerId === currentUser.id;

              return (
                <div
                  key={m.id}
                  className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      {m.matchDate} • {m.matchTime || '18:00'}
                    </span>
                    <span className="text-sky-400 font-semibold">{m.court || 'Merkez Kort'}</span>
                  </div>

                  <div className="text-xs font-semibold text-white flex items-center justify-between">
                    <div>
                      <span>vs {opp?.name}</span>
                      <span className="text-xs text-slate-500 ml-1.5">(#{opp?.rank})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-900 rounded">
                      {isChallenger ? 'Meydan Okuyan Sizsiniz' : 'Meydan Okunan Sizsiniz'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 italic">
                    {m.notes || '1.5 saatlik kort ve toplar challenger sorumluluğundadır.'}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onOpenScoreModal(m)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Bu Maça Skor Gir (Kazanan Oyuncu)</span>
                    </button>

                    <button
                      onClick={() => setMatchToCancel(m)}
                      className="py-2 px-3 bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Bu Eşleştirmeyi İptal Et & Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>İptal Et</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. COMPLETED MATCHES ARCHIVE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Tamamlanmış Maçlarım ({completedMatches.length})
        </h3>

        {completedMatches.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 bg-slate-950 rounded-xl">
            Henüz tamamlanmış maç kaydınız yok.
          </div>
        ) : (
          <div className="space-y-2">
            {completedMatches.map((m) => {
              const opp = getOpponent(m);
              const won = m.score?.winnerId === currentUser.id;

              return (
                <div
                  key={m.id}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">vs {opp?.name} (#{opp?.rank})</span>
                    <span className="text-slate-400 text-[11px] ml-2">({m.matchDate} - {m.court})</span>
                    <div className="text-slate-300 font-mono text-[11px] mt-0.5">
                      Skor: <strong>{m.score?.scoreText}</strong>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      won
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {won ? 'GALİBİYET' : 'MAĞLUBİYET'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MAÇ İPTAL ONAY MODALI */}
      {matchToCancel && (
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
                  Bu maç eşleştirmesi fikstürden, takvimden ve listenizden tamamen kaldırılacaktır.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
                vs {getOpponent(matchToCancel)?.name} (#{getOpponent(matchToCancel)?.rank})
              </div>
              <div className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                Tarih & Saat: <strong>{matchToCancel.matchDate} {matchToCancel.matchTime}</strong>
              </div>
              <div className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                Kort: <strong>{matchToCancel.court}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMatchToCancel(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  cancelMatch(matchToCancel.id);
                  setMatchToCancel(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow"
              >
                Evet, Eşleştirmeyi İptal Et ve Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excuse Modal */}
      {currentUser && (
        <ExcuseModal
          player={currentUser}
          isOpen={isExcuseModalOpen}
          onClose={() => setIsExcuseModalOpen(false)}
        />
      )}
    </div>
  );
};
