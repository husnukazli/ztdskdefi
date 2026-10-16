import React, { useState, useRef, useMemo } from 'react';
import { useDefi } from '../context/DefiContext';
import { Player, Category, Match } from '../types/defi';
import {
  Shield,
  UserPlus,
  Key,
  ArrowUp,
  ArrowDown,
  Trash2,
  Check,
  X,
  Download,
  Upload,
  RefreshCw,
  Search,
  Copy,
  Sparkles,
  Share2,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { ClubLogo } from './ClubLogo';

interface AdminPanelProps {
  onOpenScoreModal: (match: Match) => void;
  onOpenReportModal: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onOpenScoreModal,
  onOpenReportModal,
}) => {
  const {
    players,
    matches,
    currentCategory,
    setCurrentCategory,
    addPlayer,
    updatePlayer,
    updatePlayerPassword,
    deletePlayer,
    reorderRanks,
    setPlayerExcuse,
    scheduleMatch,
    confirmScore,
    cancelMatch,
    deleteMatch,
    generateBulkPasswords,
    getFormattedPasswordListText,
    resetToDefaults,
    exportBackupJson,
    importBackupJson,
    showToast,
    theme,
  } = useDefi();

  const isLight = theme === 'light';

  const [activeSubTab, setActiveSubTab] = useState<'passwords' | 'reorder' | 'matches' | 'system'>('passwords');
  const [adminSearch, setAdminSearch] = useState<string>('');

  // Password editing state per row: { [playerId]: password }
  const [rowPasswords, setRowPasswords] = useState<{ [playerId: string]: string }>({});
  const [savedRowSuccess, setSavedRowSuccess] = useState<{ [playerId: string]: boolean }>({});

  // Bulk password modal/popover
  const [showBulkPasswordOptions, setShowBulkPasswordOptions] = useState<boolean>(false);
  const [bulkPinInput, setBulkPinInput] = useState<string>('1234');

  // Add player form
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<Category>(currentCategory);
  const [newPhone, setNewPhone] = useState<string>('ZTDSK Üyesi');
  const [newPassword, setNewPassword] = useState<string>(() => Math.floor(1000 + Math.random() * 9000).toString());

  // Match scheduling form
  const [schedP1, setSchedP1] = useState<string>('');
  const [schedP2, setSchedP2] = useState<string>('');
  const [schedDate, setSchedDate] = useState<string>('2026-10-15');
  const [schedTime, setSchedTime] = useState<string>('18:00');
  const [schedCourt, setSchedCourt] = useState<string>('A Kortu (Sert Kort)');

  // Modal states for safe deletions & rule warnings
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [showNonCompliantWarningModal, setShowNonCompliantWarningModal] = useState<boolean>(false);

  // Bulk Names text state
  const [bulkNamesText, setBulkNamesText] = useState<string>('');

  // Reset confirmation modal state
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetConfirmText, setResetConfirmText] = useState<string>('');

  // File upload input ref for restoring backup from computer
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [adminMatchCategoryFilter, setAdminMatchCategoryFilter] = useState<'all' | 'category'>('all');

  const categoryPlayers = players
    .filter((p) => p.category === currentCategory)
    .sort((a, b) => a.rank - b.rank);

  const menCount = players.filter((p) => p.category === 'men').length;
  const womenCount = players.filter((p) => p.category === 'women').length;
  const completedMatchesCount = matches.filter((m) => m.status === 'confirmed').length;

  const displayedMatches = useMemo(() => {
    if (adminMatchCategoryFilter === 'category') {
      return matches.filter((m) => m.category === currentCategory);
    }
    return matches;
  }, [matches, adminMatchCategoryFilter, currentCategory]);

  // Selected players in Match Scheduling
  const p1Selected = players.find((p) => p.id === schedP1);
  const p2Selected = players.find((p) => p.id === schedP2);

  // Comprehensive live DEFİ rules compliance evaluation
  const defiRuleCheck = useMemo(() => {
    if (!p1Selected || !p2Selected) return null;
    if (p1Selected.id === p2Selected.id) {
      return {
        isCompliant: false,
        isSamePlayer: true,
        rankDiff: 0,
        higherPlayer: p1Selected,
        lowerPlayer: p2Selected,
        issues: ['Aynı oyuncuyu iki kez seçemezsiniz. Lütfen iki farklı sporcu belirleyiniz.'],
        summary: 'Aynı oyuncuyu iki kez seçemezsiniz.',
      };
    }

    const issues: string[] = [];

    // Identify who is higher in rank (closer to #1) and who is lower in rank (larger number)
    const higherPlayer = p1Selected.rank < p2Selected.rank ? p1Selected : p2Selected;
    const lowerPlayer = p1Selected.rank < p2Selected.rank ? p2Selected : p1Selected;
    const rankDiff = lowerPlayer.rank - higherPlayer.rank;

    // RULE 1: Maximum 5 rank difference (Article 7)
    // E.g. player 10 vs player 1 (difference is 9 ranks)
    if (rankDiff > 5) {
      issues.push(
        `Madde 7 Basamak Sınırı İhlali: #${lowerPlayer.rank} ${lowerPlayer.name} ile #${higherPlayer.rank} ${higherPlayer.name} arasında ${rankDiff} basamak fark vardır! DEFİ talimatnamesine göre bir oyuncu en fazla 5 basamak üstündeki bir rakibe meydan okuyabilir. Örneğin 10 numaralı oyuncu en fazla 5 numaralı oyuncuyla eşleşebilir; 1 numarayla kural gereği eşleşemez (İzin verilen azami basamak farkı: 5).`
      );
    }

    // RULE 2: Direction of challenge
    if (p1Selected.rank < p2Selected.rank) {
      issues.push(
        `Meydan Okuma Yönü Bildirimi: 1. seçilen sporcu #${p1Selected.rank} ${p1Selected.name}, 2. seçilen sporcudan daha üst basamaktadır. DEFİ kurallarına göre meydan okumayı her zaman alt basamaktaki oyuncu (#${lowerPlayer.rank} ${lowerPlayer.name}) yapar.`
      );
    }

    // RULE 3: Excuse / Injury check (Article 10)
    if (p1Selected.isExcused) {
      issues.push(
        `Mazeret İzni Uyarısı: ${p1Selected.name} (${p1Selected.rank}. sıra) şu anda mazeret izinlidir (${p1Selected.excuseReason || 'Mazeretli'}).`
      );
    }
    if (p2Selected.isExcused) {
      issues.push(
        `Mazeret İzni Uyarısı: ${p2Selected.name} (${p2Selected.rank}. sıra) şu anda mazeret izinlidir (${p2Selected.excuseReason || 'Mazeretli'}).`
      );
    }

    // RULE 4: Ongoing active match check
    const p1ActiveMatch = matches.find(
      (m) =>
        m.status === 'scheduled' &&
        (m.challengerId === p1Selected.id || m.defenderId === p1Selected.id)
    );
    if (p1ActiveMatch) {
      issues.push(
        `Aktif Maç Uyarısı: ${p1Selected.name} sporcusunun henüz oynanmamış planlı bir maçı bulunmaktadır (${p1ActiveMatch.matchDate} ${p1ActiveMatch.matchTime || ''} - ${p1ActiveMatch.court}).`
      );
    }

    const p2ActiveMatch = matches.find(
      (m) =>
        m.status === 'scheduled' &&
        (m.challengerId === p2Selected.id || m.defenderId === p2Selected.id)
    );
    if (p2ActiveMatch) {
      issues.push(
        `Aktif Maç Uyarısı: ${p2Selected.name} sporcusunun henüz oynanmamış planlı bir maçı bulunmaktadır (${p2ActiveMatch.matchDate} ${p2ActiveMatch.matchTime || ''} - ${p2ActiveMatch.court}).`
      );
    }

    if (issues.length > 0) {
      return {
        isCompliant: false,
        isSamePlayer: false,
        rankDiff,
        higherPlayer,
        lowerPlayer,
        issues,
        summary: issues[0],
      };
    }

    return {
      isCompliant: true,
      isSamePlayer: false,
      rankDiff,
      higherPlayer,
      lowerPlayer,
      issues: [],
      summary: `DEFİ Kurallarına Uygun Eşleşme (Basamak farkı: ${rankDiff} sıra, Madde 7 sınırları dahilinde)`,
    };
  }, [p1Selected, p2Selected, matches]);

  // Handle single player password save
  const handleSaveRowPassword = (player: Player) => {
    const entered = (rowPasswords[player.id] !== undefined ? rowPasswords[player.id] : player.password).trim();
    if (!entered) {
      showToast('Şifre boş olamaz.', 'error');
      return;
    }

    updatePlayerPassword(player.id, entered);

    // Visual feedback
    setSavedRowSuccess((prev) => ({ ...prev, [player.id]: true }));
    setTimeout(() => {
      setSavedRowSuccess((prev) => ({ ...prev, [player.id]: false }));
    }, 2500);
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addPlayer({
      name: newName.trim(),
      category: newCategory,
      phone: newPhone.trim() || 'ZTDSK Üyesi',
      password: newPassword.trim() || '1234',
      ttfScore: 1500,
      joinedDate: new Date().toISOString().split('T')[0],
    });

    setNewName('');
    setNewPassword(Math.floor(1000 + Math.random() * 9000).toString());
    setShowAddForm(false);
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
        phone: 'ZTDSK Üyesi',
        password: (1000 + categoryPlayers.length + i + 1).toString(),
        ttfScore: 1500,
        joinedDate: new Date().toISOString().split('T')[0],
      });
    });

    setBulkNamesText('');
    showToast(`${lines.length} yeni sporcu listeye eklendi.`, 'success');
  };

  // Actual Match Execution (called directly or after non-compliant modal approval)
  const executeMatchCreation = (isOverride = false) => {
    if (!p1Selected || !p2Selected) return;

    // In DEFİ, the lower-ranked player (higher rank number) challenges the higher-ranked player
    const challenger = p1Selected.rank > p2Selected.rank ? p1Selected : p2Selected;
    const defender = p1Selected.rank > p2Selected.rank ? p2Selected : p1Selected;
    const rankDiff = challenger.rank - defender.rank;

    const notes = isOverride
      ? `Defi Komitesi Özel Kararı (Kural dışı eşleşme onaylandı - #${challenger.rank} ${challenger.name} vs #${defender.rank} ${defender.name}, Basamak farkı: ${rankDiff})`
      : 'Defi Komitesi tarafından resmi olarak eşleştirildi.';

    scheduleMatch({
      category: currentCategory,
      challengerId: challenger.id,
      defenderId: defender.id,
      challengerRankAtMatch: challenger.rank,
      defenderRankAtMatch: defender.rank,
      matchDate: schedDate,
      matchTime: schedTime,
      court: schedCourt,
      notes,
    });

    setSchedP1('');
    setSchedP2('');
    setShowNonCompliantWarningModal(false);
  };

  // Form submit handler with Defi Rules check
  const handleAdminSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedP1 || !schedP2 || schedP1 === schedP2) {
      showToast('Lütfen iki farklı oyuncu seçiniz.', 'error');
      return;
    }

    if (!p1Selected || !p2Selected) return;

    // If non-compliant, ask for confirmation
    if (defiRuleCheck && !defiRuleCheck.isCompliant) {
      setShowNonCompliantWarningModal(true);
      return;
    }

    // Otherwise create immediately
    executeMatchCreation(false);
  };

  // Download backup JSON file
  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ztdsk_defi_yedek_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Lig verileri bilgisayarınıza .JSON yedek dosyası olarak indirildi.', 'success');
  };

  // Restore backup from chosen computer file
  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupJson(content);
        if (success) {
          showToast(`"${file.name}" yedeği bilgisayardan başarıyla geri yüklendi!`, 'success');
        }
      }
    };
    reader.onerror = () => {
      showToast('Dosya okunurken bir hata oluştu.', 'error');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Prominent Admin Bar in ZTDSK Mavi & Beyaz with Yeşil Accents */}
      <div className={`border-2 rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all ${
        isLight
          ? 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 border-blue-400/50 text-white'
          : 'bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border-blue-500/60 text-white'
      }`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Official ZTDSK Crest */}
            <div className="shrink-0 p-1 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-xs">
              <ClubLogo size={52} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  DEFİ LİGİ YÖNETİM PANELİ
                </h1>
                <span className="text-[11px] bg-blue-500/30 text-blue-100 border border-blue-300/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-300" />
                  <span>Komite Yetkisi</span>
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5 font-medium">
                Zonguldak Tenis Deniz Spor Kulübü • Mavi & Beyaz • Defi Komitesi
              </p>
            </div>
          </div>

          {/* Quick summary stats & PDF button */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Resmi PDF Raporu Al</span>
            </button>

            <div className="flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-xs rounded-xl px-3 py-1.5 text-xs text-white">
              <span>Erkek: <strong className="text-blue-200">{menCount}</strong></span>
              <span>•</span>
              <span>Kadın: <strong className="text-rose-200">{womenCount}</strong></span>
              <span>•</span>
              <span>Onaylı Maç: <strong className="text-emerald-300">{completedMatchesCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Category Switcher & SubTabs for Admin */}
        <div className="mt-5 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
          {/* Category Switcher */}
          <div className="flex items-center bg-black/25 p-1 rounded-xl border border-white/15 text-xs">
            <button
              onClick={() => setCurrentCategory('men')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currentCategory === 'men'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-100/80 hover:text-white'
              }`}
            >
              <span>14(+) Erkekler</span>
              <span className="text-[10px] bg-blue-900/80 text-blue-200 px-1.5 py-0.2 rounded-full font-mono">
                {menCount}
              </span>
            </button>
            <button
              onClick={() => setCurrentCategory('women')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currentCategory === 'women'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-blue-100/80 hover:text-white'
              }`}
            >
              <span>14(+) Kadınlar</span>
              <span className="text-[10px] bg-rose-900/80 text-rose-200 px-1.5 py-0.2 rounded-full font-mono">
                {womenCount}
              </span>
            </button>
          </div>

          {/* Main 4 SubTabs */}
          <div className="flex flex-wrap items-center bg-black/25 p-1 rounded-xl border border-white/15 text-xs">
            <button
              onClick={() => setActiveSubTab('passwords')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'passwords'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-blue-100/80 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Oyuncular & Şifreler</span>
            </button>

            <button
              onClick={() => setActiveSubTab('reorder')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'reorder'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-blue-100/80 hover:text-white'
              }`}
            >
              <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Sıralama Düzenle</span>
            </button>

            <button
              onClick={() => setActiveSubTab('matches')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'matches'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-blue-100/80 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Maç Eşleştir & Onayla</span>
            </button>

            <button
              onClick={() => setActiveSubTab('system')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'system'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-blue-100/80 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Yedek & Sıfırla</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: OYUNCULAR & ŞİFRE YÖNETİMİ */}
      {activeSubTab === 'passwords' && (
        <div className="space-y-4">
          <div className={`rounded-3xl p-5 sm:p-6 space-y-4 border shadow-sm transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  <Key className="w-4 h-4 text-blue-600" />
                  <span>{currentCategory === 'men' ? 'Erkekler' : 'Kadınlar'} Şifre & Oyuncu Yönetimi</span>
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Oyuncu şifrelerini doğrudan kutudan değiştirip <strong className="text-blue-600 dark:text-blue-400">"Kaydet"</strong> butonuna basabilirsiniz. Belirlediğiniz şifre kalıcı olarak hafızaya alınır.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const text = getFormattedPasswordListText();
                    navigator.clipboard.writeText(text);
                    showToast('Tüm oyuncuların şifre listesi WhatsApp formatında panoya kopyalandı!', 'success');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Şifre Listesini Kopyala (WhatsApp)</span>
                </button>

                <button
                  onClick={() => setShowBulkPasswordOptions(!showBulkPasswordOptions)}
                  className={`font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                    isLight
                      ? 'bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100'
                      : 'bg-blue-900/60 text-blue-200 border border-blue-700 hover:bg-blue-900'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{showBulkPasswordOptions ? 'Kapat' : 'Tüm Üyelere Şifre Ata'}</span>
                </button>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{showAddForm ? 'Kapat' : 'Yeni Üye Ekle'}</span>
                </button>
              </div>
            </div>

            {/* Bulk Password Generator Card */}
            {showBulkPasswordOptions && (
              <div className={`p-4 rounded-2xl border space-y-3 animate-fade-in text-xs ${
                isLight ? 'bg-blue-50/60 border-blue-200 text-slate-900' : 'bg-slate-950 border-blue-500/40 text-slate-100'
              }`}>
                <div className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Tüm Üyeler İçin Toplu Şifre Oluştur ve Kaydet
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className={`p-3 rounded-xl border space-y-2 ${
                    isLight ? 'bg-white border-blue-200' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Tümüne Ortak Şifre Belirle</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={bulkPinInput}
                        onChange={(e) => setBulkPinInput(e.target.value)}
                        placeholder="Örn: 1234"
                        className={`w-24 rounded-lg px-2.5 py-1 font-mono text-xs border ${
                          isLight
                            ? 'bg-slate-50 border-slate-300 text-slate-950 font-bold'
                            : 'bg-slate-950 border-slate-700 text-white'
                        }`}
                      />
                      <button
                        onClick={() => {
                          if (bulkPinInput.trim()) {
                            generateBulkPasswords('common', bulkPinInput);
                            showToast(`Tüm üyelere "${bulkPinInput}" şifresi atandı ve kaydedildi.`, 'success');
                          }
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                      >
                        Tümüne Ata
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      generateBulkPasswords('rank_pin');
                      showToast('Sıraya göre 4 haneli PIN şifreler (Erkek: 1001.., Kadın: 2001..) atandı ve kaydedildi.', 'success');
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-slate-50 border-blue-200'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800'
                    }`}
                  >
                    <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Sıraya Göre Standart PIN</div>
                    <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Erkekler: 1001-1041, Kadınlar: 2001-2014
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      generateBulkPasswords('random_pin');
                      showToast('Her üyeye rastgele 4 basamaklı benzersiz şifre üretildi ve kaydedildi.', 'success');
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-slate-50 border-blue-200'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800'
                    }`}
                  >
                    <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Rastgele 4 Haneli PIN Üret</div>
                    <div className={`text-[11px] mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      Her üyeye ayrı rastgele 4 haneli şifre
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Add Player Form */}
            {showAddForm && (
              <form onSubmit={handleAddPlayer} className={`border rounded-2xl p-4 sm:p-5 space-y-4 animate-fade-in text-xs ${
                isLight ? 'bg-blue-50/40 border-blue-300 text-slate-900' : 'bg-slate-950 border-blue-500/40 text-white'
              }`}>
                <h4 className="font-bold text-blue-700 dark:text-blue-300 text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Defi Ligine Yeni Oyuncu Kaydet
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Adı Soyadı:</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Örn: Caner Korkmaz"
                      className={`w-full rounded-lg p-2 border ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-950 font-bold focus:border-blue-600'
                          : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Kategori:</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as Category)}
                      className={`w-full rounded-lg p-2 border ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-950 font-bold focus:border-blue-600'
                          : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    >
                      <option value="men">14(+) Tek Erkekler</option>
                      <option value="women">14(+) Tek Kadınlar</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Giriş Şifresi:</label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full rounded-lg p-2 border font-mono font-bold ${
                        isLight
                          ? 'bg-white border-blue-400 text-blue-900'
                          : 'bg-slate-900 border-blue-600 text-blue-300'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Kulüp Statüsü:</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className={`w-full rounded-lg p-2 border ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-950'
                          : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className={`px-4 py-2 rounded-xl font-medium ${
                      isLight ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow cursor-pointer"
                  >
                    Oyuncuyu Kaydet
                  </button>
                </div>
              </form>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Şifresini unutan veya değiştirmek istediğiniz oyuncuyu ara..."
                className={`w-full rounded-xl pl-9 pr-4 py-2.5 text-xs border focus:outline-none transition ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-950 font-medium placeholder-slate-400 focus:border-blue-600'
                    : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Players Table with Direct Password Editing */}
            <div className={`overflow-x-auto rounded-2xl border ${
              isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-950'
            }`}>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b font-semibold uppercase text-[11px] ${
                    isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    <th className="py-3 px-4 w-14 text-center">Sıra</th>
                    <th className="py-3 px-4">Oyuncu Adı</th>
                    <th className="py-3 px-4">Giriş Şifresi (Düzenle & Kaydet)</th>
                    <th className="py-3 px-4 text-center">Mazeret</th>
                    <th className="py-3 px-4 text-right">Sil</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800'}`}>
                  {categoryPlayers
                    .filter((p) => p.name.toLowerCase().includes(adminSearch.toLowerCase()))
                    .map((player) => {
                      const currentVal = rowPasswords[player.id] !== undefined ? rowPasswords[player.id] : player.password;
                      const isModified = currentVal !== player.password;
                      const isSaved = savedRowSuccess[player.id];

                      return (
                        <tr key={player.id} className={`transition ${
                          isLight ? 'hover:bg-blue-50/40' : 'hover:bg-slate-800/40'
                        }`}>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs ${
                              isLight ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'bg-blue-950 text-blue-300 border border-blue-800'
                            }`}>
                              #{player.rank}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {/* Player name: HIGH CONTRAST in daylight mode */}
                            <span className={`font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>
                              {player.name}
                            </span>
                            <span className={`text-[10px] ml-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              ({player.wins}G / {player.losses}M)
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={currentVal}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setRowPasswords((prev) => ({ ...prev, [player.id]: val }));
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveRowPassword(player);
                                  }
                                }}
                                className={`w-28 px-2.5 py-1 rounded-lg text-xs font-mono font-bold border focus:outline-none transition ${
                                  isLight
                                    ? isModified
                                      ? 'bg-amber-50 border-amber-500 text-slate-950 ring-1 ring-amber-400'
                                      : 'bg-slate-50 border-slate-300 text-slate-950 focus:border-blue-600'
                                    : isModified
                                    ? 'bg-slate-950 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                                    : 'bg-slate-950 border-slate-700 text-slate-200 focus:border-blue-500'
                                }`}
                              />

                              <button
                                type="button"
                                onClick={() => handleSaveRowPassword(player)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                  isSaved
                                    ? 'bg-emerald-600 text-white'
                                    : isModified
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                    : isLight
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                }`}
                                title="Şifreyi Kaydet"
                              >
                                {isSaved ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Kaydedildi</span>
                                  </>
                                ) : (
                                  <span>Kaydet</span>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(player.password);
                                  showToast(`${player.name} şifresi (${player.password}) kopyalandı.`, 'info');
                                }}
                                className={`p-1 rounded cursor-pointer ${
                                  isLight ? 'text-slate-500 hover:text-blue-700' : 'text-slate-400 hover:text-white'
                                }`}
                                title="Şifreyi Kopyala"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() =>
                                setPlayerExcuse(
                                  player.id,
                                  !player.isExcused,
                                  !player.isExcused ? 'Yönetici İzni (Madde 10)' : undefined
                                )
                              }
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                                player.isExcused
                                  ? isLight
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-amber-950 text-amber-300 border border-amber-700'
                                  : isLight
                                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {player.isExcused ? 'Mazeretli' : 'Aktif'}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right">
                            {/* Player Delete with Safe Modal */}
                            <button
                              onClick={() => setPlayerToDelete(player)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                              title="Oyuncuyu Ligden Çıkar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      {/* TAB 2: SIRALAMA DÜZENLE & MANUEL SIRALAMA */}
      {activeSubTab === 'reorder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 rounded-3xl p-5 sm:p-6 space-y-4 border shadow-sm transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div>
              <h3 className={`font-bold text-base ${isLight ? 'text-slate-950' : 'text-white'}`}>
                {currentCategory === 'men' ? 'Erkekler' : 'Kadınlar'} Sıralamasını Yeniden Düzenle
              </h3>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Okları kullanarak oyuncuların basamak sırasını değiştirebilirsiniz. Yapılan değişiklik anında kaydedilir.
              </p>
            </div>

            <div className={`divide-y rounded-2xl border max-h-[600px] overflow-y-auto ${
              isLight ? 'bg-white divide-slate-200 border-slate-200' : 'bg-slate-950 divide-slate-800 border-slate-800'
            }`}>
              {categoryPlayers.map((player, index) => (
                <div key={player.id} className={`p-3 flex items-center justify-between transition ${
                  isLight ? 'hover:bg-blue-50/50' : 'hover:bg-slate-900/60'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs font-mono ${
                      isLight ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'bg-slate-800 text-blue-300'
                    }`}>
                      #{player.rank}
                    </span>
                    {/* Player Name: High contrast in daylight mode */}
                    <span className={`font-bold text-xs sm:text-sm ${isLight ? 'text-slate-950' : 'text-white'}`}>
                      {player.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveRank(index, 'up')}
                      disabled={index === 0}
                      className={`p-1.5 rounded-lg transition cursor-pointer disabled:opacity-25 disabled:pointer-events-none ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                      title="Yukarı Taşı"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveRank(index, 'down')}
                      disabled={index === categoryPlayers.length - 1}
                      className={`p-1.5 rounded-lg transition cursor-pointer disabled:opacity-25 disabled:pointer-events-none ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                      title="Aşağı Taşı"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bulk Import */}
          <div className={`rounded-3xl p-5 sm:p-6 space-y-4 border shadow-sm transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <h3 className={`font-bold text-base ${isLight ? 'text-slate-950' : 'text-white'}`}>Toplu İsim Listesi Yükle</h3>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Her satıra bir oyuncu adı gelecek şekilde yapıştırarak mevcut kategoriye toplu üye ekleyebilirsiniz.
            </p>

            <textarea
              rows={8}
              value={bulkNamesText}
              onChange={(e) => setBulkNamesText(e.target.value)}
              placeholder="Ahmet Yılmaz&#10;Mehmet Kaya&#10;Ali Demir"
              className={`w-full rounded-xl p-3 text-xs border focus:outline-none ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-950 font-medium placeholder-slate-400 focus:border-blue-600'
                  : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500'
              }`}
            />

            <button
              onClick={handleBulkImport}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow"
            >
              Listeyi Ekle
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: MAÇ EŞLEŞTİRME & ONAY */}
      {activeSubTab === 'matches' && (
        <div className="space-y-6">
          {/* Match Scheduling Form */}
          <form onSubmit={handleAdminSchedule} className={`rounded-3xl p-5 sm:p-6 space-y-4 border shadow-sm text-xs transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-950' : 'text-white'}`}>
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Yönetici Tarafından Takvime Resmi Maç Eşleştir</span>
              </h3>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                isLight ? 'bg-blue-50 text-blue-900 border-blue-200' : 'bg-blue-950 text-blue-300 border-blue-800'
              }`}>
                Kural 7: En fazla 5 basamak farkı
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-800' : 'text-slate-400'}`}>
                  1. Oyuncu (Meydan Okuyan):
                </label>
                <select
                  value={schedP1}
                  onChange={(e) => setSchedP1(e.target.value)}
                  className={`w-full rounded-lg p-2 border ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-950 font-bold focus:border-blue-600'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                  required
                >
                  <option value="">Oyuncu Seçin</option>
                  {categoryPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.rank} - {p.name} {p.isExcused ? '(Mazeretli)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-800' : 'text-slate-400'}`}>
                  2. Oyuncu (Savunan):
                </label>
                <select
                  value={schedP2}
                  onChange={(e) => setSchedP2(e.target.value)}
                  className={`w-full rounded-lg p-2 border ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-950 font-bold focus:border-blue-600'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                  required
                >
                  <option value="">Oyuncu Seçin</option>
                  {categoryPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.rank} - {p.name} {p.isExcused ? '(Mazeretli)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-800' : 'text-slate-400'}`}>Tarih:</label>
                <input
                  type="date"
                  value={schedDate}
                  onChange={(e) => setSchedDate(e.target.value)}
                  className={`w-full rounded-lg p-2 border ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-950 font-bold focus:border-blue-600'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-800' : 'text-slate-400'}`}>Saat:</label>
                <input
                  type="time"
                  value={schedTime}
                  onChange={(e) => setSchedTime(e.target.value)}
                  className={`w-full rounded-lg p-2 border ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-950 font-bold focus:border-blue-600'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-800' : 'text-slate-400'}`}>Kort (Kulüp Kortları):</label>
                <select
                  value={schedCourt}
                  onChange={(e) => setSchedCourt(e.target.value)}
                  className={`w-full rounded-lg p-2 border ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-950 font-bold focus:border-blue-600'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                >
                  <option value="A Kortu (Sert Kort)">A Kortu (Sert Kort)</option>
                  <option value="B Kortu (Sert Kort)">B Kortu (Sert Kort)</option>
                  <option value="C Kortu (Sert Kort)">C Kortu (Sert Kort)</option>
                </select>
              </div>
            </div>

            {/* LIVE DEFİ RULE COMPLIANCE FEEDBACK BOX */}
            {p1Selected && p2Selected && defiRuleCheck && (
              <div className="pt-1 animate-fade-in">
                {!defiRuleCheck.isCompliant ? (
                  <div className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                    isLight
                      ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-sm'
                      : 'bg-amber-950/60 border-amber-500 text-amber-100 shadow-lg'
                  }`}>
                    <div className="flex items-center gap-2 font-black text-amber-900 dark:text-amber-300 text-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
                      <span>DEFİ KURALI UYARISI: Bu Eşleştirme DEFİ Kurallarına Uygun Değildir!</span>
                    </div>

                    <div className="space-y-1.5 pl-6">
                      {defiRuleCheck.issues.map((issue, idx) => (
                        <div key={idx} className="flex items-start gap-2 font-semibold">
                          <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>

                    <div className={`p-2.5 rounded-xl border text-[11px] font-medium flex items-center gap-2 ${
                      isLight ? 'bg-amber-100/70 border-amber-300 text-amber-900' : 'bg-amber-900/40 border-amber-700 text-amber-200'
                    }`}>
                      <HelpCircle className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400" />
                      <span>
                        <strong>Yönetici Yetkisi:</strong> Yönetici olarak bu maçı planlamanıza <strong>izin verilir</strong>. Butona tıkladığınızda açılacak onay penceresinde yönetici inisiyatifiyle maçı takvime ekleyebilirsiniz.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 font-bold ${
                    isLight
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                      : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                  }`}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{defiRuleCheck.summary}</span>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow flex items-center gap-2 ${
                defiRuleCheck && !defiRuleCheck.isCompliant
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>
                {defiRuleCheck && !defiRuleCheck.isCompliant
                  ? 'Kural Dışı Eşleştirmeyi İncele & Onayla'
                  : 'Maçı Takvime Kaydet'}
              </span>
            </button>
          </form>

          {/* Active & Pending Matches */}
          <div className={`rounded-3xl p-5 sm:p-6 space-y-4 border shadow-sm transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className={`font-bold text-base ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  Lig Maçları ve Skor Durumları ({matches.length})
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Yanlışlıkla oluşturulan eşleştirmeler kırmızı butondan iptal edilerek listeden anında silinebilir.
                </p>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center bg-black/10 dark:bg-black/30 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setAdminMatchCategoryFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    adminMatchCategoryFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isLight ? 'text-slate-700 hover:text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tüm Maçlar ({matches.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAdminMatchCategoryFilter('category')}
                  className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                    adminMatchCategoryFilter === 'category'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isLight ? 'text-slate-700 hover:text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {currentCategory === 'men' ? 'Sadece Erkekler' : 'Sadece Kadınlar'} ({matches.filter((m) => m.category === currentCategory).length})
                </button>
              </div>
            </div>

            {displayedMatches.length === 0 ? (
              <div className={`p-8 text-center text-xs rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                Kayıtlı maç bulunmamaktadır.
              </div>
            ) : (
              <div className="space-y-3">
                {displayedMatches.map((m) => {
                  const p1 = players.find((p) => p.id === m.challengerId);
                  const p2 = players.find((p) => p.id === m.defenderId);

                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs transition ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300'
                          : 'bg-slate-950 border-slate-800 text-white hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className={`flex flex-wrap items-center gap-2 text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          <span>{m.matchDate} {m.matchTime}</span>
                          <span>•</span>
                          <span>{m.court}</span>
                          <span>•</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {m.category === 'men' ? 'Erkekler' : 'Kadınlar'}
                          </span>
                          <span>•</span>
                          <span className={`px-2 py-0.2 rounded font-bold ${
                            m.status === 'confirmed'
                              ? isLight ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-emerald-950 text-emerald-400'
                              : m.status === 'score_submitted'
                              ? isLight ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-amber-950 text-amber-300'
                              : isLight ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-sky-950 text-sky-400'
                          }`}>
                            {m.status === 'confirmed' ? 'Onaylandı' : m.status === 'score_submitted' ? 'Rakip Onayı Bekliyor' : 'Planlandı'}
                          </span>
                        </div>

                        {/* Players Matchup: HIGH CONTRAST */}
                        <div className={`text-sm font-bold mt-1 ${isLight ? 'text-slate-950' : 'text-white'}`}>
                          {p1?.name || 'Oyuncu'} (#{m.challengerRankAtMatch}) vs {p2?.name || 'Oyuncu'} (#{m.defenderRankAtMatch})
                        </div>

                        {m.notes && (
                          <div className={`text-[11px] mt-0.5 italic ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                            "{m.notes}"
                          </div>
                        )}

                        {m.score && (
                          <div className="text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-0.5">
                            Skor: {m.score.scoreText} (Kazanan: {players.find((p) => p.id === m.score?.winnerId)?.name})
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-end md:self-auto shrink-0">
                        {m.status === 'scheduled' && (
                          <button
                            onClick={() => onOpenScoreModal(m)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                          >
                            Skor Gir
                          </button>
                        )}

                        {m.status === 'score_submitted' && (
                          <button
                            onClick={() => confirmScore(m.id)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
                          >
                            Skoru Doğrudan Onayla
                          </button>
                        )}

                        {/* Safe Delete / Cancel Match Button */}
                        <button
                          onClick={() => setMatchToDelete(m)}
                          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                            isLight
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-300'
                              : 'bg-rose-950/60 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-800'
                          }`}
                          title="Maç Eşleştirmesini İptal Et ve Listeden Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eşleştirmeyi İptal Et / Sil</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: YEDEKLEME, GERİ YÜKLEME & GÜVENLİ SIFIRLAMA */}
      {activeSubTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backup & Restore */}
          <div className={`rounded-3xl p-6 space-y-5 border shadow-sm flex flex-col justify-between transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="space-y-3">
              <h3 className={`font-bold text-base flex items-center gap-2 ${isLight ? 'text-slate-950' : 'text-white'}`}>
                <Download className="w-5 h-5 text-blue-600" />
                Lig Verilerini Yedekle & Geri Yükle
              </h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Tüm defi sıralamalarını, oyuncu şifrelerini ve maç geçmişini bilgisayarınıza .JSON formatında indirebilir veya daha önce aldığınız yedeği doğrudan bilgisayardan dosya seçerek geri yükleyebilirsiniz.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleDownloadBackup}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Yedek Al (Bilgisayara JSON İndir)</span>
              </button>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileRestore}
                accept=".json"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                }`}
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Bilgisayardan Dosya Seç ve Geri Yükle</span>
              </button>
            </div>
          </div>

          {/* Safe Factory Reset Card with Double Confirmation */}
          <div className={`rounded-3xl p-6 space-y-5 border shadow-sm flex flex-col justify-between transition-colors ${
            isLight ? 'bg-white border-rose-200 text-slate-900' : 'bg-slate-900 border-rose-900/40 text-white'
          }`}>
            <div className="space-y-3">
              <h3 className="font-bold text-rose-600 dark:text-rose-400 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                Turnuva & Lig Verilerini Sıfırlama
              </h3>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Bu işlem mevcut tüm maçları ve sıralamaları temizler ve sistemi kulübün resmi başlangıç durumuna (41 erkek, 14 kadın sporcu listesi) döndürür.
              </p>
              <div className={`p-3 rounded-xl text-xs border ${
                isLight ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
              }`}>
                ⚠️ Yanlışlıkla basılmasını önlemek amacıyla bu işlem özel onay penceresi gerektirir.
              </div>
            </div>

            <button
              onClick={() => {
                setResetConfirmText('');
                setShowResetModal(true);
              }}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Turnuva Verilerini Sıfırla...</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. DEFİ KURALI DIŞI EŞLEŞTİRME ONAY MODALI */}
      {showNonCompliantWarningModal && defiRuleCheck && p1Selected && p2Selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 border-2 border-amber-500 ${
            isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
          }`}>
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 border border-amber-300 dark:border-amber-700 shadow-sm">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  DEFİ Kurallarına Aykırı Eşleştirme Uyarısı
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Seçtiğiniz maç eşleştirmesi lig talimatnamesi standart kurallarına (Madde 7) uymamaktadır.
                </p>
              </div>
            </div>

            {/* Matchup details */}
            <div className={`p-4 rounded-2xl border space-y-2.5 text-xs ${
              isLight ? 'bg-amber-50/80 border-amber-300' : 'bg-amber-950/40 border-amber-800'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                  1. Seçilen Sporcu:
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {p1Selected.name} (#{p1Selected.rank}. sıra)
                </span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                  2. Seçilen Sporcu:
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {p2Selected.name} (#{p2Selected.rank}. sıra)
                </span>
              </div>

              {defiRuleCheck.rankDiff !== undefined && (
                <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-300 pt-2 border-t border-amber-200 dark:border-amber-800/60">
                  <span>Aralarındaki Basamak Farkı:</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-200/80 dark:bg-amber-900 text-amber-950 dark:text-amber-200 font-mono text-sm font-black">
                    {defiRuleCheck.rankDiff} Basamak (Kural Sınırı: En Fazla 5)
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 space-y-1.5">
                <div className="font-bold text-amber-950 dark:text-amber-200">
                  Tespit Edilen Kural İhlalleri:
                </div>
                {defiRuleCheck.issues.map((issue, idx) => (
                  <div key={idx} className="text-amber-900 dark:text-amber-200 flex items-start gap-1.5 font-medium leading-relaxed">
                    <span className="font-bold text-amber-600 dark:text-amber-400">•</span>
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <strong>Yönetici İnisiyatifi:</strong> DEFİ komite başkanı / yönetici olarak kural dışı da olsa bu maçı özel kararla onaylayıp takvime ekleyebilirsiniz. Maç notunda bu özel komite kararı belirtilecektir.
            </p>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNonCompliantWarningModal(false)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Vazgeç / Eşleştirmeyi İptal Et
              </button>
              <button
                type="button"
                onClick={() => executeMatchCreation(true)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow flex items-center justify-center gap-1.5"
              >
                <Shield className="w-4 h-4" />
                <span>Evet, Yönetici Yetkisiyle Yine de Eşleştir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAÇ SİLME / İPTAL ONAY MODALI */}
      {matchToDelete && (
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
                  Bu maç eşleştirmesi takvimden, fikstürden ve ana sayfa listesinden tamamen silinecektir.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
                {players.find((p) => p.id === matchToDelete.challengerId)?.name || 'Oyuncu'} (#{matchToDelete.challengerRankAtMatch}) vs {players.find((p) => p.id === matchToDelete.defenderId)?.name || 'Oyuncu'} (#{matchToDelete.defenderRankAtMatch})
              </div>
              <div className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                Tarih & Saat: <strong>{matchToDelete.matchDate} {matchToDelete.matchTime}</strong>
              </div>
              <div className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                Kort: <strong>{matchToDelete.court}</strong> • Kategori: <strong>{matchToDelete.category === 'men' ? '14(+) Erkekler' : '14(+) Kadınlar'}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMatchToDelete(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMatch(matchToDelete.id);
                  setMatchToDelete(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow"
              >
                Evet, Eşleştirmeyi İptal Et ve Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. OYUNCU SİLME ONAY MODALI */}
      {playerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border-2 border-rose-500 ${
            isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0 border border-rose-300 dark:border-rose-700">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  Oyuncuyu Ligden Çıkarmak İstiyor Musunuz?
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Bu işlem geri alınamaz. Sıralamadaki diğer sporcuların dereceleri otomatik kaydırılacaktır.
                </p>
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
                {playerToDelete.name}
              </div>
              <div className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                Kategori: <strong>{playerToDelete.category === 'men' ? '14(+) Tek Erkekler' : '14(+) Tek Kadınlar'}</strong> • Sıra: <strong>#{playerToDelete.rank}</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPlayerToDelete(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePlayer(playerToDelete.id);
                  setPlayerToDelete(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow"
              >
                Evet, Oyuncuyu Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TURNUVA SIFIRLAMA ÇİFT ONAY MODALI */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border-2 border-rose-600 ${
            isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-950' : 'text-white'}`}>
                  Turnuvayı Sıfırlamak Üzeresiniz!
                </h3>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Bu işlem geri alınamaz. Tüm özel şifreler, maç sonuçları ve sıralama puanları başlangıç durumuna dönecektir.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className={`block text-xs font-semibold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                Onaylamak için lütfen aşağıdaki kutuya <strong className="text-rose-600 font-mono">SIFIRLA</strong> yazınız:
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder="SIFIRLA"
                className={`w-full rounded-xl p-2.5 text-xs font-mono uppercase border ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-950 font-bold focus:border-rose-500'
                    : 'bg-slate-950 border-slate-700 text-white focus:border-rose-500'
                }`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  isLight ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={resetConfirmText.trim().toUpperCase() !== 'SIFIRLA'}
                onClick={() => {
                  resetToDefaults();
                  setShowResetModal(false);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:pointer-events-none text-white font-bold rounded-xl text-xs transition cursor-pointer shadow"
              >
                Evet, Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
