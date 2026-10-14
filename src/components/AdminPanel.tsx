import React, { useState } from 'react';
import { useDefi } from '../context/DefiContext';
import { Player, Category, Match } from '../types/defi';
import { Shield, UserPlus, Key, ArrowUp, ArrowDown, Trash2, Edit2, Check, X, Download, Upload, RefreshCw, Calendar, Trophy, AlertTriangle, Search } from 'lucide-react';

interface AdminPanelProps {
  onOpenScoreModal: (match: Match) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onOpenScoreModal }) => {
  const {
    players,
    matches,
    currentCategory,
    addPlayer,
    updatePlayer,
    deletePlayer,
    reorderRanks,
    setPlayerExcuse,
    scheduleMatch,
    confirmScore,
    cancelMatch,
    resetToDefaults,
    exportBackupJson,
    importBackupJson,
    showToast,
  } = useDefi();

  const [activeSubTab, setActiveSubTab] = useState<'players' | 'reorder' | 'matches' | 'backup'>('players');

  // New Player Form State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<Category>(currentCategory);
  const [newPhone, setNewPhone] = useState<string>('0530');
  const [newPassword, setNewPassword] = useState<string>('123');
  const [newTtf, setNewTtf] = useState<number>(1500);

  // Edit Player State
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editPassword, setEditPassword] = useState<string>('');

  // Bulk Import text state
  const [bulkNamesText, setBulkNamesText] = useState<string>('');
  const [backupJsonInput, setBackupJsonInput] = useState<string>('');

  // Admin match scheduling
  const [schedP1, setSchedP1] = useState<string>('');
  const [schedP2, setSchedP2] = useState<string>('');
  const [schedDate, setSchedDate] = useState<string>('2026-10-15');
  const [schedTime, setSchedTime] = useState<string>('18:00');
  const [schedCourt, setSchedCourt] = useState<string>('Merkez Kort');

  const categoryPlayers = players
    .filter((p) => p.category === currentCategory)
    .sort((a, b) => a.rank - b.rank);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addPlayer({
      name: newName.trim(),
      category: newCategory,
      phone: newPhone.trim(),
      password: newPassword.trim() || '123',
      ttfScore: newTtf,
      joinedDate: new Date().toISOString().split('T')[0],
    });

    setNewName('');
    setShowAddForm(false);
  };

  const startEditPlayer = (p: Player) => {
    setEditingPlayerId(p.id);
    setEditName(p.name);
    setEditPhone(p.phone);
    setEditPassword(p.password);
  };

  const saveEditPlayer = (p: Player) => {
    updatePlayer({
      ...p,
      name: editName.trim(),
      phone: editPhone.trim(),
      password: editPassword.trim(),
    });
    setEditingPlayerId(null);
  };

  const moveRank = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categoryPlayers.length) return;

    const ids = categoryPlayers.map((p) => p.id);
    const temp = ids[index];
    ids[index] = ids[targetIndex];
    ids[targetIndex] = temp;

    reorderRanks(currentCategory, ids);
  };

  const handleBulkImport = () => {
    const lines = bulkNamesText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      showToast('Lütfen en az bir isim satırı giriniz.', 'error');
      return;
    }

    lines.forEach((name, i) => {
      addPlayer({
        name,
        category: currentCategory,
        phone: '05300000000',
        password: '123',
        ttfScore: 1500,
        joinedDate: new Date().toISOString().split('T')[0],
      });
    });

    setBulkNamesText('');
    showToast(`${lines.length} oyuncu başarıyla sisteme eklendi.`, 'success');
  };

  const handleAdminSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedP1 || !schedP2 || schedP1 === schedP2) {
      showToast('Lütfen iki farklı oyuncu seçiniz.', 'error');
      return;
    }

    const p1 = players.find((p) => p.id === schedP1);
    const p2 = players.find((p) => p.id === schedP2);
    if (!p1 || !p2) return;

    scheduleMatch({
      category: currentCategory,
      challengerId: p1.id,
      defenderId: p2.id,
      challengerRankAtMatch: p1.rank,
      defenderRankAtMatch: p2.rank,
      matchDate: schedDate,
      matchTime: schedTime,
      court: schedCourt,
      notes: 'Yönetici (Defi Komitesi) tarafından takvime eşleştirildi.',
    });

    showToast('Maç eşleştirmesi takvime kaydedildi.', 'success');
    setSchedP1('');
    setSchedP2('');
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ztdsk_defi_yedek_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Yedek dosyası indirildi.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-amber-950/30 border border-amber-600/40 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-slate-950 font-bold flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Defi Yönetim Paneli</span>
              <span className="text-xs bg-amber-950 text-amber-300 border border-amber-700 px-2 py-0.5 rounded-full font-bold">
                Yönetici Modu
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Oyuncu kaydı, şifre belirleme, sıralama düzenleme ve maç eşleştirme kontrolleri.
            </p>
          </div>
        </div>

        {/* Sub tabs */}
        <div className="flex flex-wrap items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('players')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              activeSubTab === 'players' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Oyuncular & Şifreler
          </button>
          <button
            onClick={() => setActiveSubTab('reorder')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              activeSubTab === 'reorder' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sıralama Düzenle
          </button>
          <button
            onClick={() => setActiveSubTab('matches')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              activeSubTab === 'matches' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Maç Eşleştirme & Onay
          </button>
          <button
            onClick={() => setActiveSubTab('backup')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              activeSubTab === 'backup' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Yedekleme & Sıfırla
          </button>
        </div>
      </div>

      {/* SUBTAB 1: PLAYERS & PASSWORDS */}
      {activeSubTab === 'players' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">
              {currentCategory === 'men' ? 'Erkekler' : 'Kadınlar'} Oyuncu Listesi & Giriş Şifreleri ({categoryPlayers.length})
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Formu Kapat' : 'Yeni Oyuncu Kaydet'}</span>
            </button>
          </div>

          {/* Add Player Form */}
          {showAddForm && (
            <form onSubmit={handleAddPlayer} className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in text-xs">
              <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Defi Ligine Yeni Oyuncu Ekle
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Adı Soyadı:</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Örn: Caner Korkmaz"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Kategori:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Category)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="men">14(+) Tek Erkekler</option>
                    <option value="women">14(+) Tek Kadınlar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Telefon (WhatsApp):</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Giriş Şifresi:</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl shadow cursor-pointer"
                >
                  Oyuncuyu Kaydet
                </button>
              </div>
            </form>
          )}

          {/* Players Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4 w-12 text-center">Sıra</th>
                    <th className="py-3 px-4">Oyuncu Adı</th>
                    <th className="py-3 px-4">Telefon</th>
                    <th className="py-3 px-4">Oyuncu Şifresi</th>
                    <th className="py-3 px-4 text-center">Mazeret İzni</th>
                    <th className="py-3 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {categoryPlayers.map((player) => {
                    const isEditing = editingPlayerId === player.id;

                    return (
                      <tr key={player.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 text-center font-bold text-amber-400">
                          #{player.rank}
                        </td>

                        <td className="py-3 px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs w-full max-w-[180px]"
                            />
                          ) : (
                            <span className="font-semibold text-white">{player.name}</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-300">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs w-full max-w-[140px]"
                            />
                          ) : (
                            player.phone
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              className="bg-slate-950 border border-amber-600 rounded px-2 py-1 text-amber-300 font-mono text-xs w-24"
                            />
                          ) : (
                            <span className="font-mono bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-amber-300 text-[11px]">
                              {player.password || '123'}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() =>
                              setPlayerExcuse(
                                player.id,
                                !player.isExcused,
                                !player.isExcused ? 'Yönetici İzni (Sınav / Seyahat)' : undefined
                              )
                            }
                            className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                              player.isExcused
                                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {player.isExcused ? 'Mazeretli (Kapalı)' : 'Aktif (Teklif Alabilir)'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveEditPlayer(player)}
                                  className="p-1 text-emerald-400 hover:bg-emerald-950 rounded transition"
                                  title="Kaydet"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingPlayerId(null)}
                                  className="p-1 text-slate-400 hover:bg-slate-800 rounded transition"
                                  title="Vazgeç"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditPlayer(player)}
                                  className="p-1 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded transition"
                                  title="Düzenle / Şifre Değiştir"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`${player.name} oyuncusunu ligden çıkarmak istediğinize emin misiniz?`)) {
                                      deletePlayer(player.id);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                                  title="Sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: REORDER & BULK IMPORT */}
      {activeSubTab === 'reorder' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manual Reordering */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div>
              <h3 className="font-bold text-white text-sm">
                Manuel Sıralama Düzenleyici ({currentCategory === 'men' ? 'Erkekler' : 'Kadınlar'})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Oyuncuların yerini yukarı/aşağı taşıyarak geçici veya nihai defi listesi sıralamasını belirleyebilirsiniz.
              </p>
            </div>

            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {categoryPlayers.map((player, idx) => (
                <div
                  key={player.id}
                  className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-amber-950 text-amber-300 font-bold flex items-center justify-center text-xs">
                      #{player.rank}
                    </span>
                    <span className="font-semibold text-white">{player.name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveRank(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer"
                      title="1 Sıra Yukarı Taşı"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveRank(idx, 'down')}
                      disabled={idx === categoryPlayers.length - 1}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer"
                      title="1 Sıra Aşağı Taşı"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bulk Import */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div>
              <h3 className="font-bold text-white text-sm">Toplu Oyuncu Listesi Yükleme</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Her satıra bir oyuncu adı gelecek şekilde yapıştırın. Sistem sırasıyla defi listesinin altına ekleyecektir.
              </p>
            </div>

            <textarea
              rows={8}
              value={bulkNamesText}
              onChange={(e) => setBulkNamesText(e.target.value)}
              placeholder={"Ahmet Yılmaz\nMehmet Öz\nBurak Şahin\nCan Polat"}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
            />

            <button
              onClick={handleBulkImport}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow"
            >
              Toplu Listeyi Defi Ligine Aktar
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 3: MATCH SCHEDULING & APPROVAL */}
      {activeSubTab === 'matches' && (
        <div className="space-y-6">
          {/* Admin Schedule New Match */}
          <form onSubmit={handleAdminSchedule} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl text-xs">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              Yönetici Tarafından Yeni Maç Eşleştir & Takvime Ekle
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Meydan Okuyan (Oyuncu 1):</label>
                <select
                  value={schedP1}
                  onChange={(e) => setSchedP1(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  required
                >
                  <option value="">-- Oyuncu 1 --</option>
                  {categoryPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.rank} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Meydan Okunan (Oyuncu 2):</label>
                <select
                  value={schedP2}
                  onChange={(e) => setSchedP2(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  required
                >
                  <option value="">-- Oyuncu 2 --</option>
                  {categoryPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.rank} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tarih:</label>
                <input
                  type="date"
                  value={schedDate}
                  onChange={(e) => setSchedDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Saat:</label>
                <input
                  type="time"
                  value={schedTime}
                  onChange={(e) => setSchedTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kort:</label>
                <select
                  value={schedCourt}
                  onChange={(e) => setSchedCourt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Merkez Kort">Merkez Kort</option>
                  <option value="Kort 1 (Toprak)">Kort 1 (Toprak)</option>
                  <option value="Kort 2 (Sert Zemin)">Kort 2 (Sert Zemin)</option>
                  <option value="Kort 3 (Işıklandırmalı)">Kort 3</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow"
            >
              Eşleştirmeyi Takvime Ekle
            </button>
          </form>

          {/* Matches List with Direct Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-white text-sm">
              Aktif ve Onay Bekleyen Maçlar ({matches.length})
            </h3>

            <div className="space-y-3">
              {matches.map((m) => {
                const p1 = players.find((p) => p.id === m.challengerId);
                const p2 = players.find((p) => p.id === m.defenderId);

                return (
                  <div
                    key={m.id}
                    className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <span>{m.matchDate} {m.matchTime}</span>
                        <span>•</span>
                        <span>{m.court}</span>
                        <span>•</span>
                        <span className="font-bold text-amber-400">{m.category === 'men' ? 'Erkekler' : 'Kadınlar'}</span>
                      </div>
                      <div className="text-sm font-semibold text-white mt-0.5">
                        {p1?.name} (#{m.challengerRankAtMatch}) vs {p2?.name} (#{m.defenderRankAtMatch})
                      </div>
                      {m.score && (
                        <div className="text-emerald-400 font-mono font-bold mt-0.5">
                          Skor: {m.score.scoreText} (Kazanan: {players.find((p) => p.id === m.score?.winnerId)?.name})
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      {m.status === 'scheduled' && (
                        <button
                          onClick={() => onOpenScoreModal(m)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
                        >
                          Skor Gir
                        </button>
                      )}

                      {m.status === 'score_submitted' && (
                        <button
                          onClick={() => confirmScore(m.id)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
                        >
                          Skoru Doğrudan Onayla
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm('Maçı iptal etmek istediğinize emin misiniz?')) {
                            cancelMatch(m.id);
                          }
                        }}
                        className="px-2.5 py-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: BACKUP & FACTORY RESET */}
      {activeSubTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export / Import */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div>
              <h3 className="font-bold text-white text-sm">Veri Yedekleme & Geri Yükleme</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tüm lig durumunu JSON olarak indirebilir ve dilediğiniz zaman yükleyebilirsiniz.
              </p>
            </div>

            <button
              onClick={handleDownloadBackup}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow"
            >
              <Download className="w-4 h-4" />
              <span>Lig Verilerini JSON Olarak İndir (Yedek Al)</span>
            </button>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                JSON Yedeğini Geri Yükle:
              </label>
              <textarea
                rows={4}
                value={backupJsonInput}
                onChange={(e) => setBackupJsonInput(e.target.value)}
                placeholder="Yedek JSON metnini buraya yapıştırın..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono"
              />
              <button
                onClick={() => {
                  if (importBackupJson(backupJsonInput)) {
                    setBackupJsonInput('');
                  }
                }}
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Yedeği Sisteme Geri Yükle</span>
              </button>
            </div>
          </div>

          {/* Reset */}
          <div className="bg-slate-900 border border-rose-900/40 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-rose-300 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Fabrika Ayarlarına Sıfırlama
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Bu işlem mevcut tüm özel skorları ve değişiklikleri temizler ve sistemi
                Zonguldak Tenis Deniz Spor Kulübü'nün resmi başlangıç verilerine (15 erkek sporcu,
                10 kadın sporcu, örnek maçlar) döndürür.
              </p>
            </div>

            <button
              onClick={() => {
                if (confirm('Tüm lig verileri başlangıç durumuna sıfırlanacaktır. Emin misiniz?')) {
                  resetToDefaults();
                }
              }}
              className="w-full py-2.5 bg-rose-900/60 hover:bg-rose-800 border border-rose-700 text-rose-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Lig Verilerini Başlangıç Durumuna Sıfırla</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
