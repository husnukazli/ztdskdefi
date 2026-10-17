import React, { useState, useEffect } from 'react';
import { Match, MatchScore, SetScore, MatchFinishType } from '../types/defi';
import { useDefi } from '../context/DefiContext';
import { X, CheckCircle2, Trophy, Camera, AlertCircle, Info, Activity, UserX } from 'lucide-react';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
}

export const ScoreModal: React.FC<ScoreModalProps> = ({ isOpen, onClose, match }) => {
  const { players, currentUser, isAdmin, submitScore, adminDirectApproveScore, showToast } = useDefi();

  const [finishType, setFinishType] = useState<MatchFinishType>('completed');
  const [manualWinnerId, setManualWinnerId] = useState<string>('');
  const [retireReason, setRetireReason] = useState<string>('');
  const [retiredStage, setRetiredStage] = useState<'set1' | 'set2' | 'set3'>('set2');

  const [set1P1, setSet1P1] = useState<number>(6);
  const [set1P2, setSet1P2] = useState<number>(4);
  const [set2P1, setSet2P1] = useState<number>(6);
  const [set2P2, setSet2P2] = useState<number>(4);
  const [set3P1, setSet3P1] = useState<number>(10);
  const [set3P2, setSet3P2] = useState<number>(8);
  const [hasThirdSet, setHasThirdSet] = useState<boolean>(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  // Maç seçildiğinde veya düzenlemek için açıldığında mevcut skorları otomatik doldur
  useEffect(() => {
    if (!match) return;
    if (match.score) {
      setFinishType(match.score.finishType || match.finishType || 'completed');
      setManualWinnerId(match.score.winnerId || '');
      setRetireReason(match.score.retireReason || '');

      const s = match.score.sets || [];
      if (s[0]) {
        setSet1P1(s[0].player1Games);
        setSet1P2(s[0].player2Games);
      }
      if (s[1]) {
        setSet2P1(s[1].player1Games);
        setSet2P2(s[1].player2Games);
      }
      if (s[2]) {
        setSet3P1(s[2].player1Games);
        setSet3P2(s[2].player2Games);
        setHasThirdSet(true);
      } else {
        setHasThirdSet(false);
      }

      if (match.score.finishType === 'retired') {
        if (s.length === 1) setRetiredStage('set1');
        else if (s.length === 3) setRetiredStage('set3');
        else setRetiredStage('set2');
      }
    } else {
      setFinishType('completed');
      setManualWinnerId('');
      setRetireReason('');
      setRetiredStage('set2');
      setSet1P1(6);
      setSet1P2(4);
      setSet2P1(6);
      setSet2P2(4);
      setSet3P1(10);
      setSet3P2(8);
      setHasThirdSet(false);
    }
    setPhotoUrl(match.photoUrl || '');
  }, [match, isOpen]);

  if (!isOpen || !match) return null;

  const challenger = players.find((p) => p.id === match.challengerId);
  const defender = players.find((p) => p.id === match.defenderId);

  if (!challenger || !defender) return null;

  const isEditingExistingScore = !!match.score;
  const activeWinnerId = manualWinnerId || defender.id;

  // Determine sets won
  let p1Sets = 0;
  let p2Sets = 0;

  if (set1P1 > set1P2) p1Sets++;
  else if (set1P2 > set1P1) p2Sets++;

  if (set2P1 > set2P2) p1Sets++;
  else if (set2P2 > set2P1) p2Sets++;

  const isTied = p1Sets === 1 && p2Sets === 1;

  if (isTied) {
    if (set3P1 > set3P2) p1Sets++;
    else if (set3P2 > set3P1) p2Sets++;
  }

  let winner = p1Sets > p2Sets ? challenger : defender;
  let loser = p1Sets > p2Sets ? defender : challenger;

  if (finishType === 'walkover' || finishType === 'retired') {
    winner = activeWinnerId === challenger.id ? challenger : defender;
    loser = activeWinnerId === challenger.id ? defender : challenger;
  }

  const isParticipant =
    isAdmin ||
    (currentUser && (currentUser.id === challenger.id || currentUser.id === defender.id));

  const handleSubmit = (directAdmin: boolean = false) => {
    if (finishType === 'completed' && p1Sets === p2Sets) {
      showToast('Maç skoru berabere kalamaz, lütfen set skorlarını kontrol ediniz.', 'error');
      return;
    }

    let sets: SetScore[];
    let scoreText = '';

    if (finishType === 'walkover') {
      sets = [{ player1Games: 0, player2Games: 0 }];
      const reasonDetail = retireReason.trim() ? ` (${retireReason.trim()})` : '';
      scoreText = `W.O. (${winner.name} Hükmen Galip${reasonDetail})`;
    } else if (finishType === 'retired') {
      const retiredPlayer = winner.id === challenger.id ? defender : challenger;
      const reasonDetail = retireReason.trim() ? ` - ${retireReason.trim()}` : '';

      if (retiredStage === 'set1') {
        sets = [{ player1Games: set1P1, player2Games: set1P2 }];
        scoreText = `${set1P1}-${set1P2} (Ret. - ${retiredPlayer.name} Çekildi${reasonDetail})`;
      } else if (retiredStage === 'set3') {
        sets = [
          { player1Games: set1P1, player2Games: set1P2 },
          { player1Games: set2P1, player2Games: set2P2 },
          { player1Games: set3P1, player2Games: set3P2 },
        ];
        scoreText = `${set1P1}-${set1P2}, ${set2P1}-${set2P2}, [${set3P1}-${set3P2}] (Ret. - ${retiredPlayer.name} Çekildi${reasonDetail})`;
      } else {
        sets = [
          { player1Games: set1P1, player2Games: set1P2 },
          { player1Games: set2P1, player2Games: set2P2 },
        ];
        scoreText = `${set1P1}-${set1P2}, ${set2P1}-${set2P2} (Ret. - ${retiredPlayer.name} Çekildi${reasonDetail})`;
      }
    } else {
      sets = [
        { player1Games: set1P1, player2Games: set1P2 },
        { player1Games: set2P1, player2Games: set2P2 },
      ];

      scoreText = `${set1P1}-${set1P2}, ${set2P1}-${set2P2}`;

      if (isTied || hasThirdSet) {
        sets.push({ player1Games: set3P1, player2Games: set3P2 });
        scoreText += `, [${set3P1}-${set3P2}]`;
      }
    }

    const matchScore: MatchScore = {
      sets,
      winnerId: winner.id,
      loserId: loser.id,
      scoreText,
      finishType,
      retireReason: retireReason.trim() || undefined,
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
              {isEditingExistingScore ? 'Maç Skorunu Düzelt / Güncelle' : 'Skor Giriş Ekranı'}
            </span>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{challenger.name}</span>
              <span className="text-xs text-slate-500 font-normal">vs</span>
              <span>{defender.name}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {isEditingExistingScore && (
            <div className="p-3 bg-amber-950/50 border border-amber-700/70 rounded-xl text-amber-200 flex items-center justify-between">
              <span>
                <strong>Mevcut Kayıtlı Skor:</strong> {match.score?.scoreText}
              </span>
              <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 font-bold">
                Düzenleme Modu
              </span>
            </div>
          )}

          {!isParticipant && (
            <div className="p-3 bg-amber-950/50 border border-amber-800 rounded-xl text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Yalnızca bu maçta oynayan oyuncular veya Yönetici skor girebilir. Lütfen giriş yapınız.
              </span>
            </div>
          )}

          {/* Match Completion Type Selector */}
          <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setFinishType('completed')}
              className={`py-2 px-1 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                finishType === 'completed'
                  ? 'bg-emerald-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎾 Normal Maç</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFinishType('retired');
                if (!manualWinnerId) setManualWinnerId(defender.id);
              }}
              className={`py-2 px-1 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                finishType === 'retired'
                  ? 'bg-amber-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Çekilme (Ret.)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFinishType('walkover');
                if (!manualWinnerId) setManualWinnerId(defender.id);
              }}
              className={`py-2 px-1 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                finishType === 'walkover'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Hükmen (W.O.)</span>
            </button>
          </div>

          {/* Walkover (W.O.) Card */}
          {finishType === 'walkover' && (
            <div className="p-4 bg-purple-950/40 border border-purple-800/60 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                <UserX className="w-4 h-4" />
                <span>Hükmen Galibiyet (Walkover / W.O.):</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Oyuncunun maça gelememesi / çıkamaması durumunda maçı hükmen kazanan sporcuyu seçiniz:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setManualWinnerId(defender.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    activeWinnerId === defender.id
                      ? 'bg-purple-900/80 border-purple-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-xs text-purple-300 flex items-center justify-between">
                    <span>{defender.name}</span>
                    <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-200">Hükmen Galip</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{challenger.name} maça çıkamadı</div>
                </button>
                <button
                  type="button"
                  onClick={() => setManualWinnerId(challenger.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    activeWinnerId === challenger.id
                      ? 'bg-purple-900/80 border-purple-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-xs text-purple-300 flex items-center justify-between">
                    <span>{challenger.name}</span>
                    <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-200">Hükmen Galip</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{defender.name} maça çıkamadı</div>
                </button>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-purple-300 block mb-1">
                  Hükmen Galibiyet Nedeni / Açıklaması (İsteğe bağlı):
                </label>
                <input
                  type="text"
                  value={retireReason}
                  onChange={(e) => setRetireReason(e.target.value)}
                  placeholder="Örn: Maça gelemedi, Sakatlık, Şehir dışı seyahat"
                  className="w-full bg-slate-900 border border-purple-800/80 rounded-lg p-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          )}

          {/* Retired (Çekilme) Card */}
          {finishType === 'retired' && (
            <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Activity className="w-4 h-4" />
                <span>Çekilme / Sakatlık (Retired - Maç Yarım Kaldı):</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Maç sırasında sakatlanan / oyunu bırakan sporcuyu ve galip ilan edilen sporcuyu seçiniz:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setManualWinnerId(defender.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    activeWinnerId === defender.id
                      ? 'bg-amber-900/80 border-amber-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-xs text-amber-300 flex items-center justify-between">
                    <span>{defender.name}</span>
                    <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200">Galip (Ret.)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{challenger.name} oyunu bıraktı</div>
                </button>
                <button
                  type="button"
                  onClick={() => setManualWinnerId(challenger.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    activeWinnerId === challenger.id
                      ? 'bg-amber-900/80 border-amber-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-xs text-amber-300 flex items-center justify-between">
                    <span>{challenger.name}</span>
                    <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200">Galip (Ret.)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{defender.name} oyunu bıraktı</div>
                </button>
              </div>

              <div className="pt-1 space-y-1.5">
                <label className="text-[10px] font-semibold text-amber-300 block">
                  Maç Kaçıncı Sette Yarım Kaldı?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRetiredStage('set1')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      retiredStage === 'set1'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    1. Sette Yarım Kaldı
                  </button>
                  <button
                    type="button"
                    onClick={() => setRetiredStage('set2')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      retiredStage === 'set2'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    2. Sette Yarım Kaldı
                  </button>
                  <button
                    type="button"
                    onClick={() => setRetiredStage('set3')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      retiredStage === 'set3'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    3. Set Karar Tie-Break
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-amber-300 block mb-1">
                  Çekilme / Sakatlık Sebebi (İsteğe bağlı):
                </label>
                <input
                  type="text"
                  value={retireReason}
                  onChange={(e) => setRetireReason(e.target.value)}
                  placeholder="Örn: 2. sette sağ adale sakatlığı, ayak bileği burkulması"
                  className="w-full bg-slate-900 border border-amber-800/80 rounded-lg p-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Rule 15 Reminder */}
          {finishType === 'completed' && (
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5 text-slate-300">
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <strong>Madde 15:</strong> Tüm maçlar 3 set üzerinden karar puanlı (No-Ad) oynanır.
                Setler 1-1 olursa 3. set <strong>10'lu maç tie-break</strong> (Süper tie-break) oynanır.
              </div>
            </div>
          )}

          {/* Score Table Input */}
          {finishType !== 'walkover' && (
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {finishType === 'retired' ? 'Yarım Kalan Skor Seçimi:' : 'Tıklamalı Skor Seçimi:'}
                </span>
                <span className="font-mono font-bold text-sm text-amber-400 bg-amber-950/60 border border-amber-800 px-3 py-0.5 rounded-lg">
                  {finishType === 'retired' ? (
                    retiredStage === 'set1'
                      ? `${set1P1}-${set1P2} (Ret.)`
                      : retiredStage === 'set2'
                      ? `${set1P1}-${set1P2}, ${set2P1}-${set2P2} (Ret.)`
                      : `${set1P1}-${set1P2}, ${set2P1}-${set2P2}, [${set3P1}-${set3P2}] (Ret.)`
                  ) : (
                    `${set1P1}-${set1P2}, ${set2P1}-${set2P2}${((isTied || hasThirdSet) && finishType === 'completed') ? ` [${set3P1}-${set3P2}]` : ''}`
                  )}
                </span>
              </div>

              {/* Set 1 Selection */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">1</span>
                    1. Set Sonucu
                  </span>
                  <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    {challenger.name.split(' ')[0]}: {set1P1} — {defender.name.split(' ')[0]}: {set1P2}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="w-16 truncate font-semibold text-emerald-400">{challenger.name.split(' ')[0]} Kazandı:</span>
                    <div className="flex flex-wrap gap-1 flex-1">
                      {[
                        [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [7, 5], [7, 6]
                      ].map(([p1g, p2g]) => (
                        <button
                          key={`s1-p1-${p1g}-${p2g}`}
                          type="button"
                          onClick={() => { setSet1P1(p1g); setSet1P2(p2g); }}
                          className={`px-2 py-1 rounded text-[11px] font-bold font-mono transition cursor-pointer ${
                            set1P1 === p1g && set1P2 === p2g
                              ? 'bg-emerald-600 text-slate-950 ring-2 ring-emerald-400 shadow-md'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          {p1g}-{p2g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="w-16 truncate font-semibold text-sky-400">{defender.name.split(' ')[0]} Kazandı:</span>
                    <div className="flex flex-wrap gap-1 flex-1">
                      {[
                        [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 7], [6, 7]
                      ].map(([p1g, p2g]) => (
                        <button
                          key={`s1-p2-${p1g}-${p2g}`}
                          type="button"
                          onClick={() => { setSet1P1(p1g); setSet1P2(p2g); }}
                          className={`px-2 py-1 rounded text-[11px] font-bold font-mono transition cursor-pointer ${
                            set1P1 === p1g && set1P2 === p2g
                              ? 'bg-sky-600 text-slate-950 ring-2 ring-sky-400 shadow-md'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          {p1g}-{p2g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <div className="text-slate-400 text-[10px] mb-1 font-semibold">{challenger.name} Oyun Sayısı:</div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <button
                          key={`s1-num-p1-${num}`}
                          type="button"
                          onClick={() => setSet1P1(num)}
                          className={`w-6 h-6 rounded font-mono font-bold text-[10px] transition cursor-pointer ${
                            set1P1 === num
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] mb-1 font-semibold">{defender.name} Oyun Sayısı:</div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <button
                          key={`s1-num-p2-${num}`}
                          type="button"
                          onClick={() => setSet1P2(num)}
                          className={`w-6 h-6 rounded font-mono font-bold text-[10px] transition cursor-pointer ${
                            set1P2 === num
                              ? 'bg-sky-500 text-slate-950'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Set 2 Selection */}
              {(finishType === 'completed' || retiredStage === 'set2' || retiredStage === 'set3') && (
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">2</span>
                      2. Set Sonucu
                    </span>
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      {challenger.name.split(' ')[0]}: {set2P1} — {defender.name.split(' ')[0]}: {set2P2}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="w-16 truncate font-semibold text-emerald-400">{challenger.name.split(' ')[0]} Kazandı:</span>
                      <div className="flex flex-wrap gap-1 flex-1">
                        {[
                          [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [7, 5], [7, 6]
                        ].map(([p1g, p2g]) => (
                          <button
                            key={`s2-p1-${p1g}-${p2g}`}
                            type="button"
                            onClick={() => { setSet2P1(p1g); setSet2P2(p2g); }}
                            className={`px-2 py-1 rounded text-[11px] font-bold font-mono transition cursor-pointer ${
                              set2P1 === p1g && set2P2 === p2g
                                ? 'bg-emerald-600 text-slate-950 ring-2 ring-emerald-400 shadow-md'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                            }`}
                          >
                            {p1g}-{p2g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="w-16 truncate font-semibold text-sky-400">{defender.name.split(' ')[0]} Kazandı:</span>
                      <div className="flex flex-wrap gap-1 flex-1">
                        {[
                          [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 7], [6, 7]
                        ].map(([p1g, p2g]) => (
                          <button
                            key={`s2-p2-${p1g}-${p2g}`}
                            type="button"
                            onClick={() => { setSet2P1(p1g); setSet2P2(p2g); }}
                            className={`px-2 py-1 rounded text-[11px] font-bold font-mono transition cursor-pointer ${
                              set2P1 === p1g && set2P2 === p2g
                                ? 'bg-sky-600 text-slate-950 ring-2 ring-sky-400 shadow-md'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                            }`}
                          >
                            {p1g}-{p2g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <div className="text-slate-400 text-[10px] mb-1 font-semibold">{challenger.name} Oyun Sayısı:</div>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                          <button
                            key={`s2-num-p1-${num}`}
                            type="button"
                            onClick={() => setSet2P1(num)}
                            className={`w-6 h-6 rounded font-mono font-bold text-[10px] transition cursor-pointer ${
                              set2P1 === num
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px] mb-1 font-semibold">{defender.name} Oyun Sayısı:</div>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                          <button
                            key={`s2-num-p2-${num}`}
                            type="button"
                            onClick={() => setSet2P2(num)}
                            className={`w-6 h-6 rounded font-mono font-bold text-[10px] transition cursor-pointer ${
                              set2P2 === num
                                ? 'bg-sky-500 text-slate-950'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Set 3 (10'lu Süper Tie-Break) */}
              {((finishType === 'completed' && (isTied || hasThirdSet)) || (finishType === 'retired' && retiredStage === 'set3')) && (
                <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-600/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">3</span>
                      3. Set Karar Tie-Break (10 Puanlık)
                    </span>
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600">
                      [{set3P1} - {set3P2}]
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="w-16 truncate font-semibold text-emerald-400">{challenger.name.split(' ')[0]} Kazandı:</span>
                      <div className="flex flex-wrap gap-1 flex-1">
                        {[
                          [10, 4], [10, 6], [10, 7], [10, 8], [11, 9], [12, 10]
                        ].map(([p1g, p2g]) => (
                          <button
                            key={`s3-p1-${p1g}-${p2g}`}
                            type="button"
                            onClick={() => { setSet3P1(p1g); setSet3P2(p2g); }}
                            className={`px-2 py-1 rounded text-[11px] font-bold font-mono transition cursor-pointer ${
                              set3P1 === p1g && set3P2 === p2g
                                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-md'
                                : 'bg-slate-800 hover:bg-slate-700 text-amber-200 border border-slate-700'
                            }`}
                          >
                            {p1g}-{p2g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="w-16 truncate font-semibold text-sky-400">{defender.name.split(' ')[0]} Kazandı:</span>
                      <div className="flex flex-wrap gap-1 flex-1">
                        {[
                          [4, 10], [6, 10], [7, 10], [8, 10], [9, 11], [10, 12]
                        ].map(([p1g, p2g]) => (
                          <button
                            key={`s3-p2-${p1g}-${p2g}`}
                            type="button"
                            onClick={() => { setSet3P1(p1g); setSet3P2(p2g); }}
                            className={`px-2 py-1 rounded text-[11px] font-bold font-mono transition cursor-pointer ${
                              set3P1 === p1g && set3P2 === p2g
                                ? 'bg-sky-500 text-slate-950 ring-2 ring-sky-300 shadow-md'
                                : 'bg-slate-800 hover:bg-slate-700 text-sky-200 border border-slate-700'
                            }`}
                          >
                            {p1g}-{p2g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-900/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px]">{challenger.name.split(' ')[0]}:</span>
                      <button
                        type="button"
                        onClick={() => setSet3P1(Math.max(0, set3P1 - 1))}
                        className="w-6 h-6 rounded bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-emerald-400 w-5 text-center">{set3P1}</span>
                      <button
                        type="button"
                        onClick={() => setSet3P1(set3P1 + 1)}
                        className="w-6 h-6 rounded bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px]">{defender.name.split(' ')[0]}:</span>
                      <button
                        type="button"
                        onClick={() => setSet3P2(Math.max(0, set3P2 - 1))}
                        className="w-6 h-6 rounded bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-sky-400 w-5 text-center">{set3P2}</span>
                      <button
                        type="button"
                        onClick={() => setSet3P2(set3P2 + 1)}
                        className="w-6 h-6 rounded bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!isTied && finishType === 'completed' && (
                <div className="pt-1 flex items-center justify-end">
                  <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasThirdSet}
                      onChange={(e) => setHasThirdSet(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-600"
                    />
                    <span>İsteğe bağlı 3. Set (10'lu Maç Tie-Break) Aç / Kapat</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Winner Calculation Banner */}
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">
                {finishType === 'walkover'
                  ? 'Hükmen Kazanan: '
                  : finishType === 'retired'
                  ? 'Galip İlan Edilen: '
                  : 'Hesaplanan Kazanan: '}
                <span className="text-emerald-400">{winner.name}</span>
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-300">
              {finishType === 'walkover'
                ? 'Hükmen (W.O.)'
                : finishType === 'retired'
                ? 'Çekilme (Ret.)'
                : `${p1Sets} - ${p2Sets} (${p1Sets > p2Sets ? challenger.name : defender.name})`}
            </span>
          </div>

          {/* Ranking impact preview */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-300">
            <span className="text-amber-400 font-semibold">Sıralama Etkisi (Madde 7): </span>
            {winner.id === challenger.id ? (
              <span>
                Meydan okuyan <strong>{challenger.name}</strong> kazandığı için #{match.defenderRankAtMatch} sıraya
                yükselecek, <strong>{defender.name}</strong> ve aradaki oyuncular 1 basamak aşağı kayacaktır.
              </span>
            ) : (
              <span>
                Üst sıradaki <strong>{defender.name}</strong> kazandığı için defi ligi sıralaması değişmeyecektir.
              </span>
            )}
          </div>

          {/* Court Photo Upload / URL */}
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
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg
