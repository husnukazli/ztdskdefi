import React, { useState, useEffect } from 'react';
import { Match, MatchScore, SetScore } from '../types/defi';
import { useDefi } from '../context/DefiContext';
import { X, CheckCircle2, Trophy, Camera, AlertCircle, Info } from 'lucide-react';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({ isOpen, onClose, match }) => {
  const { players, currentUser, isAdmin, submitScore, adminDirectApproveScore, showToast } = useDefi();

  const [set1P1, setSet1P1] = useState<number>(6);
  const [set1P2, setSet1P2] = useState<number>(4);
  const [set2P1, setSet2P1] = useState<number>(6);
  const [set2P2, setSet2P2] = useState<number>(3);
  const [set3P1, setSet3P1] = useState<number>(10);
  const [set3P2, setSet3P2] = useState<number>(8);
  const [hasThirdSet, setHasThirdSet] = useState<boolean>(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  useEffect(() => {
    if (match?.score?.sets) {
      const s1 = match.score.sets[0] || { player1Games: 6, player2Games: 4 };
      const s2 = match.score.sets[1] || { player1Games: 6, player2Games: 3 };
      const s3 = match.score.sets[2];

      setSet1P1(s1.player1Games);
      setSet1P2(s1.player2Games);
      setSet2P1(s2.player1Games);
      setSet2P2(s2.player2Games);

      if (s3) {
        setSet3P1(s3.player1Games);
        setSet3P2(s3.player2Games);
        setHasThirdSet(true);
      } else {
        setHasThirdSet(false);
      }
    } else {
      setSet1P1(6);
      setSet1P2(4);
      setSet2P1(6);
      setSet2P2(3);
      setSet3P1(10);
      setSet3P2(8);
      setHasThirdSet(false);
    }

    setPhotoUrl(match?.photoUrl || '');
  }, [match]);

  if (!isOpen || !match) return null;

  const challenger = players.find((p) => p.id === match.challengerId);
  const defender = players.find((p) => p.id === match.defenderId);

  if (!challenger || !defender) return null;

  let p1Sets = 0;
  let p2Sets = 0;

  if (set1P1 > set1P2) p1Sets++;
  else if (set1P2 > set1P1) p2Sets++;

  if (set2P1 > set2P2) p1Sets++;
  else if (set2P2 > set2P1) p2Sets++;

  const isTied = p1Sets === 1 && p2Sets === 1;

  if (isTied || hasThirdSet) {
    if (set3P1 > set3P2) p1Sets++;
    else if (set3P2 > set3P1) p2Sets++;
  }

  const winner = p1Sets > p2Sets ? challenger : defender;
  const loser = p1Sets > p2Sets ? defender : challenger;

  const isParticipant =
    isAdmin ||
    (currentUser && (currentUser.id === challenger.id || currentUser.id === defender.id));

  const handleSubmit = (directAdmin: boolean = false) => {
    if (p1Sets === p2Sets) {
      showToast('Maç skoru berabere kalamaz, lütfen set skorlarını kontrol ediniz.', 'error');
      return;
    }

    const sets: [SetScore, SetScore, SetScore?] = [
      { player1Games: set1P1, player2Games: set1P2 },
      { player1Games: set2P1, player2Games: set2P2 },
    ];

    let scoreText = `${set1P1}-${set1P2}, ${set2P1}-${set2P2}`;

    if (isTied || hasThirdSet) {
      sets.push({ player1Games: set3P1, player2Games: set3P2 });
      scoreText += `, [${set3P1}-${set3P2}]`;
    }

    const matchScore: MatchScore = {
      sets,
      winnerId: winner.id,
      loserId: loser.id,
      scoreText,
    };

    if (directAdmin && isAdmin) {
      adminDirectApproveScore(match.id, matchScore);
    } else {
      submitScore(match.id, matchScore, photoUrl || undefined);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
              {match.score ? 'Skor Düzenleme / Onaylama' : 'Skor Giriş Ekranı'}
            </span>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{challenger.name}</span>
              <span className="text-xs text-slate-500 font-normal">vs</span>
              <span>{defender.name}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {!isParticipant && (
            <div className="p-3 bg-amber-950/50 border border-amber-800 rounded-xl text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Yalnızca bu maçta oynayan oyuncular veya Yönetici skor girebilir. Lütfen giriş yapınız.
              </span>
            </div>
          )}

          {/* Rule 15 Reminder */}
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5 text-slate-300">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <strong>Madde 15:</strong> Tüm maçlar 3 set üzerinden karar puanlı (No-Ad) oynanır.
              Setler 1-1 olursa 3. set <strong>10'lu maç tie-break</strong> (Süper tie-break) oynanır.
            </div>
          </div>

          {/* Score Table Input */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-4">
            <div className="grid grid-cols-12 gap-2 text-center text-slate-400 font-semibold border-b border-slate-800 pb-2">
              <div className="col-span-6 text-left">Oyuncular</div>
              <div className="col-span-2">1. Set</div>
              <div className="col-span-2">2. Set</div>
              <div className="col-span-2">3. Set (TB)</div>
            </div>

            {/* Challenger Row */}
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-6 flex items-center gap-2 truncate">
                <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-[10px]">
                  #{challenger.rank}
                </span>
                <span className="font-semibold text-white truncate">{challenger.name}</span>
                <span className="text-[10px] text-slate-500">(Meydan Okuyan)</span>
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={set1P1}
                  onChange={(e) => setSet1P1(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-center text-white font-bold py-1.5 rounded-lg focus:border-emerald-500"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={set2P1}
                  onChange={(e) => setSet2P1(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-center text-white font-bold py-1.5 rounded-lg focus:border-emerald-500"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  max="30"
                  disabled={!isTied && !hasThirdSet}
                  value={set3P1}
                  onChange={(e) => setSet3P1(parseInt(e.target.value) || 0)}
                  className={`w-full border text-center font-bold py-1.5 rounded-lg ${
                    isTied || hasThirdSet
                      ? 'bg-slate-900 border-amber-600 text-amber-300'
                      : 'bg-slate-900/40 border-slate-800 text-slate-600'
                  }`}
                />
              </div>
            </div>

            {/* Defender Row */}
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-6 flex items-center gap-2 truncate">
                <span className="w-5 h-5 rounded-full bg-sky-950 text-sky-400 border border-sky-800 flex items-center justify-center font-bold text-[10px]">
                  #{defender.rank}
                </span>
                <span className="font-semibold text-white truncate">{defender.name}</span>
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={set1P2}
                  onChange={(e) => setSet1P2(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-center text-white font-bold py-1.5 rounded-lg focus:border-emerald-500"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={set2P2}
                  onChange={(e) => setSet2P2(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-center text-white font-bold py-1.5 rounded-lg focus:border-emerald-500"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  max="30"
                  disabled={!isTied && !hasThirdSet}
                  value={set3P2}
                  onChange={(e) => setSet3P2(parseInt(e.target.value) || 0)}
                  className={`w-full border text-center font-bold py-1.5 rounded-lg ${
                    isTied || hasThirdSet
                      ? 'bg-slate-900 border-amber-600 text-amber-300'
                      : 'bg-slate-900/40 border-slate-800 text-slate-600'
                  }`}
                />
              </div>
            </div>

            {/* Third set trigger */}
            {!isTied && (
              <div className="pt-2 flex items-center justify-end">
                <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasThirdSet}
                    onChange={(e) => setHasThirdSet(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-600"
                  />
                  <span>3. Set (10'lu Maç Tie-Break) Ekle</span>
                </label>
              </div>
            )}
          </div>

          {/* Winner Calculation Banner */}
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">
                Hesaplanan Kazanan: <span className="text-emerald-400">{winner.name}</span>
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-300">
              {p1Sets} - {p2Sets} ({p1Sets > p2Sets ? challenger.name : defender.name})
            </span>
          </div>

          {/* Ranking impact preview */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-300">
            <span className="text-amber-400 font-semibold">Sıralama Etkisi (Madde 7): </span>
            {winner.id === challenger.id ? (
              <span>
                Meydan okuyan <strong>{challenger.name}</strong> kazandığı için #{defender.rank} sıraya
                yükselecek, <strong>{defender.name}</strong> ve aradaki oyuncular 1 basamak aşağı kayacaktır.
              </span>
            ) : (
              <span>
                Üst sıradaki <strong>{defender.name}</strong> kazandığı için defi ligi sıralaması değişmeyecektir.
              </span>
            )}
          </div>

          {/* Court Photo Upload */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-sky-400" />
              Kort Fotoğrafı (Madde 13 - İsteğe Bağlı URL):
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://... (Fotoğraf linki)"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => handleSubmit(false)}
              disabled={!isParticipant}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer ${
                isParticipant
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-950/60'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Skoru İlet (Rakip Onayına Gönder)</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => handleSubmit(true)}
                className="py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-500 text-slate-950 shadow transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>Yönetici Doğrudan Onayla</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
