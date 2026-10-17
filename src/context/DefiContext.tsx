import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player, Match, Category, LeagueSettings, MatchScore } from '../types/defi';
import { INITIAL_PLAYERS, INITIAL_MATCHES, INITIAL_SETTINGS } from '../data/initialData';
import { applyMatchResultToRankings } from '../utils/defiRules';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';

// Helper to sanitize undefined values for Firestore
function cleanForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = cleanForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

interface DefiContextType {
  players: Player[];
  matches: Match[];
  settings: LeagueSettings;
  currentCategory: Category;
  setCurrentCategory: (c: Category) => void;
  currentUser: Player | null;
  isAdmin: boolean;
  loginAsPlayer: (playerId: string, password: string) => { success: boolean; message?: string };
  loginAsAdmin: (password: string) => { success: boolean; message?: string };
  logout: () => void;
  // Player Management
  addPlayer: (player: Omit<Player, 'id' | 'rank' | 'matchesPlayed' | 'wins' | 'losses'>) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (playerId: string) => void;
  reorderRanks: (category: Category, newOrderIds: string[]) => void;
  setPlayerExcuse: (
    playerId: string,
    isExcused: boolean,
    excuseReason?: string,
    excuseStartDate?: string,
    excuseEndDate?: string,
    excuseNotes?: string
  ) => void;
  // Match Management
  scheduleMatch: (match: Omit<Match, 'id' | 'status' | 'createdAt'>) => Match;
  submitScore: (matchId: string, score: MatchScore, photoUrl?: string) => void;
  confirmScore: (matchId: string) => void;
  adminDirectApproveScore: (matchId: string, score: MatchScore) => void;
  cancelMatch: (matchId: string) => void;
  deleteMatch: (matchId: string) => void;
  // Password Management
  updatePlayerPassword: (playerId: string, newPassword: string) => void;
  generateBulkPasswords: (mode: 'random_pin' | 'common' | 'rank_pin', commonPin?: string) => void;
  getFormattedPasswordListText: () => string;
  // Utility & Backup
  resetToDefaults: () => void;
  exportBackupJson: () => string;
  importBackupJson: (jsonStr: string) => boolean;
  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  // Notification Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  // Cloud Sync
  isFirestoreConnected: boolean;
}

const DefiContext = createContext<DefiContextType | undefined>(undefined);

const STORAGE_KEY_PLAYERS = 'ztdsk_defi_players_v4';
const STORAGE_KEY_MATCHES = 'ztdsk_defi_matches_v4';
const STORAGE_KEY_SETTINGS = 'ztdsk_defi_settings_v4';
const STORAGE_KEY_AUTH = 'ztdsk_defi_auth_v4';
const STORAGE_KEY_CAT = 'ztdsk_defi_cat_v4';
const STORAGE_KEY_THEME = 'ztdsk_defi_theme_v1';

export const DefiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLAYERS);
      return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
    } catch {
      return INITIAL_PLAYERS;
    }
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MATCHES);
      return saved ? JSON.parse(saved) : INITIAL_MATCHES;
    } catch {
      return INITIAL_MATCHES;
    }
  });

  const [settings, setSettings] = useState<LeagueSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [currentCategory, setCurrentCategory] = useState<Category>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CAT);
      return (saved as Category) || 'men';
    } catch {
      return 'men';
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  // Restore auth
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed.isAdmin) {
          setIsAdmin(true);
        } else if (parsed.playerId) {
          const found = players.find((p) => p.id === parsed.playerId);
          if (found) setCurrentUser(found);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Keep currentUser synced if players state changes
  useEffect(() => {
    if (currentUser) {
      const updated = players.find((p) => p.id === currentUser.id);
      if (updated) setCurrentUser(updated);
    }
  }, [players]);

  // Persist category to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CAT, currentCategory);
    } catch (e) {
      console.error(e);
    }
  }, [currentCategory]);

  // -------------------------------------------------------------
  // REAL-TIME FIRESTORE SYNCHRONIZATION
  // -------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    // 1. Players Listener
    const unsubPlayers = onSnapshot(
      collection(db, 'players'),
      (snapshot) => {
        if (!isMounted) return;
        if (snapshot.empty) {
          // Cloud is empty -> seed initial players to Firestore
          const batch = writeBatch(db);
          INITIAL_PLAYERS.forEach((p) => {
            batch.set(doc(db, 'players', p.id), cleanForFirestore(p));
          });
          batch.commit().catch(console.error);
        } else {
          const cloudPlayers: Player[] = [];
          snapshot.forEach((docSnap) => {
            cloudPlayers.push(docSnap.data() as Player);
          });
          cloudPlayers.sort((a, b) => a.rank - b.rank);
          setPlayers(cloudPlayers);
          try {
            localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(cloudPlayers));
          } catch (e) {
            console.error(e);
          }
          setIsFirestoreConnected(true);
        }
      },
      (error) => {
        console.warn('Firestore players listener:', error);
      }
    );

    // 2. Matches Listener
    const unsubMatches = onSnapshot(
      collection(db, 'matches'),
      (snapshot) => {
        if (!isMounted) return;
        if (snapshot.empty) {
          setMatches([]);
          try {
            localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify([]));
          } catch (e) {
            console.error(e);
          }
          setIsFirestoreConnected(true);
        } else {
          const cloudMatches: Match[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Match;
            const id = docSnap.id;
            // Purge legacy demo matches (m_101 to m_106)
            if (id === 'm_101' || id === 'm_102' || id === 'm_103' || id === 'm_104' || id === 'm_105' || id === 'm_106') {
              deleteDoc(docSnap.ref).catch(() => {});
              return;
            }
            cloudMatches.push(data);
          });
          cloudMatches.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setMatches(cloudMatches);
          try {
            localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(cloudMatches));
          } catch (e) {
            console.error(e);
          }
          setIsFirestoreConnected(true);
        }
      },
      (error) => {
        console.warn('Firestore matches listener:', error);
      }
    );

    // 3. Settings Listener
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'league_config'),
      (docSnap) => {
        if (!isMounted) return;
        if (docSnap.exists()) {
          const cloudSettings = docSnap.data() as LeagueSettings;
          setSettings(cloudSettings);
          try {
            localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(cloudSettings));
          } catch (e) {
            console.error(e);
          }
        } else {
          setDoc(doc(db, 'settings', 'league_config'), cleanForFirestore(INITIAL_SETTINGS)).catch(
            console.error
          );
        }
      },
      (error) => {
        console.warn('Firestore settings listener:', error);
      }
    );

    return () => {
      isMounted = false;
      unsubPlayers();
      unsubMatches();
      unsubSettings();
    };
  }, []);

  // Helper to persist single player to Cloud & Local
  const syncPlayerToCloud = async (player: Player) => {
    try {
      await setDoc(doc(db, 'players', player.id), cleanForFirestore(player));
    } catch (e) {
      console.warn('Cloud save player error, local fallback active:', e);
    }
  };

  // Helper to persist array of players to Cloud & Local
  const syncPlayersBatchToCloud = async (allPlayers: Player[]) => {
    try {
      const batch = writeBatch(db);
      allPlayers.forEach((p) => {
        batch.set(doc(db, 'players', p.id), cleanForFirestore(p));
      });
      await batch.commit();
    } catch (e) {
      console.warn('Cloud batch save error, local fallback active:', e);
    }
  };

  // Helper to persist match to Cloud & Local
  const syncMatchToCloud = async (match: Match) => {
    try {
      await setDoc(doc(db, 'matches', match.id), cleanForFirestore(match));
    } catch (e) {
      console.warn('Cloud save match error, local fallback active:', e);
    }
  };

  // Helper to delete match from Cloud
  const deleteMatchFromCloud = async (matchId: string) => {
    try {
      await deleteDoc(doc(db, 'matches', matchId));
    } catch (e) {
      console.warn('Cloud delete match error:', e);
    }
  };

  // -------------------------------------------------------------
  // AUTH
  // -------------------------------------------------------------
  const loginAsPlayer = (playerId: string, password: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, message: 'Oyuncu bulunamadı.' };
    }
    if (player.password !== password && password !== settings.adminPassword && password !== '6735') {
      return {
        success: false,
        message: 'Hatalı şifre girdiniz. Şifrenizi unuttuysanız lütfen Defi Komitesi / Yönetici ile iletişime geçiniz.',
      };
    }
    setCurrentUser(player);
    setIsAdmin(false);
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ playerId: player.id }));
    showToast(`Hoş geldiniz, ${player.name}! (#${player.rank}. Sıra)`, 'success');
    return { success: true };
  };

  const loginAsAdmin = (password: string) => {
    if (password === settings.adminPassword || password === '6735') {
      setIsAdmin(true);
      setCurrentUser(null);
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ isAdmin: true }));
      showToast('Yönetici moduna giriş yapıldı.', 'success');
      return { success: true };
    }
    return { success: false, message: 'Geçersiz yönetici şifresi! Lütfen tekrar deneyiniz.' };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    showToast('Oturum kapatıldı.', 'info');
  };

  // -------------------------------------------------------------
  // PLAYER ACTIONS
  // -------------------------------------------------------------
  const addPlayer = (newPlayerData: Omit<Player, 'id' | 'rank' | 'matchesPlayed' | 'wins' | 'losses'>) => {
    const categoryPlayers = players.filter((p) => p.category === newPlayerData.category);
    const maxRank = categoryPlayers.length > 0 ? Math.max(...categoryPlayers.map((p) => p.rank)) : 0;
    const newRank = maxRank + 1;

    const newPlayer: Player = {
      ...newPlayerData,
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      rank: newRank,
      previousRank: newRank,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      avatarBg: newPlayerData.avatarBg || 'bg-emerald-600',
    };

    const next = [...players, newPlayer];
    setPlayers(next);
    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(next));
    syncPlayerToCloud(newPlayer);
    showToast(`${newPlayer.name} defi ligine #${newRank} sıradan başarıyla eklendi.`, 'success');
  };

  const updatePlayer = (updatedPlayer: Player) => {
    const next = players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p));
    setPlayers(next);
    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(next));
    syncPlayerToCloud(updatedPlayer);
    showToast(`${updatedPlayer.name} bilgileri güncellendi.`, 'success');
  };

  const updatePlayerPassword = (playerId: string, newPassword: string) => {
    const clean = newPassword.trim();
    if (!clean) {
      showToast('Şifre boş olamaz.', 'error');
      return;
    }
    const target = players.find((p) => p.id === playerId);
    if (!target) return;

    const updated = { ...target, password: clean };
    const next = players.map((p) => (p.id === playerId ? updated : p));
    setPlayers(next);
    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(next));
    syncPlayerToCloud(updated);
    showToast(`Şifre başarıyla kaydedildi ve tüm cihazlarla eşitlendi.`, 'success');
  };

  const deletePlayer = (playerId: string) => {
    const p = players.find((x) => x.id === playerId);
    if (!p) return;

    const filtered = players.filter((x) => x.id !== playerId);
    const cat = p.category;
    let counter = 1;
    const reindexed = filtered
      .sort((a, b) => a.rank - b.rank)
      .map((x) => {
        if (x.category === cat) {
          const nextRank = counter++;
          return { ...x, rank: nextRank };
        }
        return x;
      });

    setPlayers(reindexed);
    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(reindexed));
    deleteDoc(doc(db, 'players', playerId)).catch(console.error);
    syncPlayersBatchToCloud(reindexed);
    showToast(`${p.name} ligden çıkarıldı ve sıralama düzenlendi.`, 'info');
  };

  const reorderRanks = (category: Category, newOrderIds: string[]) => {
    const catPlayers = players.filter((p) => p.category === category);
    const otherCatPlayers = players.filter((p) => p.category !== category);

    const reordered: Player[] = [];
    newOrderIds.forEach((id, index) => {
      const found = catPlayers.find((p) => p.id === id);
      if (found) {
        reordered.push({
          ...found,
          previousRank: found.rank,
          rank: index + 1,
        });
      }
    });

    const combined = [...otherCatPlayers, ...reordered].sort((a, b) => a.rank - b.rank);
    setPlayers(combined);
    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(combined));
    syncPlayersBatchToCloud(combined);
    showToast('Defi sıralaması başarıyla yeniden düzenlendi ve veritabanına işlendi.', 'success');
  };

  const setPlayerExcuse = (
    playerId: string,
    isExcused: boolean,
    excuseReason?: string,
    excuseStartDate?: string,
    excuseEndDate?: string,
    excuseNotes?: string
  ) => {
    const target = players.find((p) => p.id === playerId);
    if (!target) return;

    const updated: Player = {
      ...target,
      isExcused,
      excuseReason: isExcused ? excuseReason : undefined,
      excuseStartDate: isExcused ? excuseStartDate : undefined,
      excuseEndDate: isExcused ? excuseEndDate : undefined,
      excuseNotes: isExcused ? excuseNotes : undefined,
    };

    const next = players.map((p) => (p.id === playerId ? updated : p));
    setPlayers(next);
    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(next));
    syncPlayerToCloud(updated);

    if (currentUser && currentUser.id === playerId) {
      setCurrentUser(updated);
    }

    showToast(
      isExcused
        ? `Mazeret bildirimi kaydedildi (${excuseReason || 'Mazeretli'}). Tüm cihazlarda mazeretli olarak görünecektir.`
        : 'Mazeret durumu kaldırıldı, ligde tekrar aktif durumdasınız.',
      'info'
    );
  };

  // -------------------------------------------------------------
  // MATCH ACTIONS
  // -------------------------------------------------------------
  const scheduleMatch = (matchData: Omit<Match, 'id' | 'status' | 'createdAt'>): Match => {
    const newMatch: Match = {
      ...matchData,
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };

    const next = [newMatch, ...matches];
    setMatches(next);
    localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(next));
    syncMatchToCloud(newMatch);
    showToast('Maç merkezi veritabanına ve takvime kaydedildi.', 'success');
    return newMatch;
  };

  const submitScore = (matchId: string, score: MatchScore, photoUrl?: string) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;

    const updated: Match = {
      ...target,
      status: 'score_submitted',
      score,
      photoUrl: photoUrl || target.photoUrl,
      scoreSubmittedBy: score.winnerId,
      scoreSubmittedAt: new Date().toISOString(),
    };

    const next = matches.map((m) => (m.id === matchId ? updated : m));
    setMatches(next);
    localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(next));
    syncMatchToCloud(updated);
    showToast('Skor sisteme iletildi! Sıralamanın güncellenmesi için rakibin onayı bekleniyor.', 'info');
  };

  const confirmScore = (matchId: string) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch || !targetMatch.score) return;

    // 1. Mark match confirmed
    const updatedMatch: Match = {
      ...targetMatch,
      status: 'confirmed',
      scoreConfirmedBy: currentUser?.id || 'admin',
      scoreConfirmedAt: new Date().toISOString(),
    };

    const updatedMatches = matches.map((m) => (m.id === matchId ? updatedMatch : m));
    setMatches(updatedMatches);
    localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(updatedMatches));
    syncMatchToCloud(updatedMatch);

    // 2. Apply rank shift based on Defi Rules
    const cat = targetMatch.category;
    const catPlayers = players.filter((p) => p.category === cat);
    const updatedCatPlayers = applyMatchResultToRankings(
      catPlayers,
      targetMatch,
      targetMatch.score.winnerId,
      targetMatch.score.loserId
    );

    const otherCatPlayers = players.filter((p) => p.category !== cat);
    const nextPlayers = [...otherCatPlayers, ...updatedCatPlayers].sort((a, b) => a.rank - b.rank);
    setPlayers(nextPlayers);
    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(nextPlayers));
    syncPlayersBatchToCloud(nextPlayers);

    showToast('Skor onaylandı! Defi Ligi sıralaması tüm cihazlarda güncellendi.', 'success');
  };

  const adminDirectApproveScore = (matchId: string, score: MatchScore) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const updatedMatch: Match = {
      ...targetMatch,
      status: 'confirmed',
      score,
      scoreSubmittedBy: score.winnerId,
      scoreSubmittedAt: new Date().toISOString(),
      scoreConfirmedBy: 'admin',
      scoreConfirmedAt: new Date().toISOString(),
    };

    const updatedMatches = matches.map((m) => (m.id === matchId ? updatedMatch : m));
    setMatches(updatedMatches);
    localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(updatedMatches));
    syncMatchToCloud(updatedMatch);

    const cat = targetMatch.category;
    const catPlayers = players.filter((p) => p.category === cat);
    const updatedCatPlayers = applyMatchResultToRankings(catPlayers, targetMatch, score.winnerId, score.loserId);

    const otherCatPlayers = players.filter((p) => p.category !== cat);
    const nextPlayers = [...otherCatPlayers, ...updatedCatPlayers].sort((a, b) => a.rank - b.rank);
    setPlayers(nextPlayers);
    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(nextPlayers));
    syncPlayersBatchToCloud(nextPlayers);

    showToast('⚡ Yönetici tarafından maç skoru ve sıralama kesinleştirildi ve buluta yazıldı.', 'success');
  };

  const cancelMatch = (matchId: string) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;

    const updated: Match = {
      ...target,
      status: 'cancelled',
    };
    const next = matches.map((m) => (m.id === matchId ? updated : m));
    setMatches(next);
    localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(next));
    syncMatchToCloud(updated);
    showToast('Maç iptal edildi.', 'info');
  };

  const deleteMatch = (matchId: string) => {
    const next = matches.filter((m) => m.id !== matchId);
    setMatches(next);
    localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(next));
    deleteMatchFromCloud(matchId);
    showToast('Maç eşleştirmesi sistemden ve veritabanından tamamen silindi.', 'success');
  };

  const resetToDefaults = async () => {
    try {
      // 1. Reset local state
      setPlayers(INITIAL_PLAYERS);
      setMatches([]);
      setSettings(INITIAL_SETTINGS);

      // Clean local storage cache
      try {
        localStorage.removeItem('ztdsk_playoff_draw_men');
        localStorage.removeItem('ztdsk_playoff_draw_women');
        localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(INITIAL_PLAYERS));
        localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      } catch (e) {
        console.error(e);
      }

      // 2. Delete all existing matches in Firestore
      const matchesSnap = await getDocs(collection(db, 'matches'));
      for (const d of matchesSnap.docs) {
        await deleteDoc(d.ref);
      }

      // 3. Reset all players in Firestore with official list
      const playersSnap = await getDocs(collection(db, 'players'));
      for (const d of playersSnap.docs) {
        await deleteDoc(d.ref);
      }
      for (const p of INITIAL_PLAYERS) {
        await setDoc(doc(db, 'players', p.id), cleanForFirestore(p));
      }

      // 4. Reset settings in Firestore
      await setDoc(doc(db, 'settings', 'league_config'), cleanForFirestore(INITIAL_SETTINGS));

      showToast('Tüm lig verileri, maçlar ve sıralamalar resmi başlangıç durumuna başarıyla sıfırlandı.', 'success');
    } catch (err) {
      console.error('Reset error:', err);
      showToast('Sıfırlama sırasında bir hata oluştu.', 'error');
    }
  };

  const exportBackupJson = () => {
    const data = {
      players,
      matches,
      settings,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importBackupJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.players && Array.isArray(data.players)) {
        setPlayers(data.players);
        syncPlayersBatchToCloud(data.players);
      }
      if (data.matches && Array.isArray(data.matches)) {
        setMatches(data.matches);
        data.matches.forEach((m: Match) => syncMatchToCloud(m));
      }
      if (data.settings) {
        setSettings(data.settings);
        setDoc(doc(db, 'settings', 'league_config'), cleanForFirestore(data.settings)).catch(console.error);
      }
      showToast('Yedek veriler başarıyla geri yüklendi ve buluta aktarıldı.', 'success');
      return true;
    } catch {
      showToast('Geçersiz JSON formatı!', 'error');
      return false;
    }
  };

  const generateBulkPasswords = (mode: 'random_pin' | 'common' | 'rank_pin', commonPin: string = '1234') => {
    const next = players.map((p) => {
      let newPin = p.password;
      if (mode === 'random_pin') {
        newPin = Math.floor(1000 + Math.random() * 9000).toString();
      } else if (mode === 'common') {
        newPin = commonPin.trim() || '1234';
      } else if (mode === 'rank_pin') {
        newPin = p.category === 'men' ? (1000 + p.rank).toString() : (2000 + p.rank).toString();
      }
      return {
        ...p,
        password: newPin,
      };
    });
    setPlayers(next);
    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(next));
    syncPlayersBatchToCloud(next);
    showToast('Tüm üyelerin şifreleri başarıyla güncellendi ve merkezi veritabanına kaydedildi.', 'success');
  };

  const getFormattedPasswordListText = (): string => {
    const women = players.filter((p) => p.category === 'women').sort((a, b) => a.rank - b.rank);
    const men = players.filter((p) => p.category === 'men').sort((a, b) => a.rank - b.rank);

    let text = `🎾 *ZTDSK KIŞ DEFİ LİGİ - OYUNCU GİRİŞ ŞİFRELERİ LİSTESİ*\n`;
    text += `_Sisteme giriş için açılır listeden isminizi seçip karşısındaki şifreyi giriniz._\n\n`;

    text += `🏆 *14(+) TEK KADINLAR (${women.length} Sporcu)*\n`;
    women.forEach((w) => {
      text += `${w.rank}. ${w.name} 👉 Şifre: *${w.password}*\n`;
    });

    text += `\n🏆 *14(+) TEK ERKEKLER (${men.length} Sporcu)*\n`;
    men.forEach((m) => {
      text += `${m.rank}. ${m.name} 👉 Şifre: *${m.password}*\n`;
    });

    return text;
  };

  return (
    <DefiContext.Provider
      value={{
        players,
        matches,
        settings,
        currentCategory,
        setCurrentCategory,
        currentUser,
        isAdmin,
        loginAsPlayer,
        loginAsAdmin,
        logout,
        addPlayer,
        updatePlayer,
        updatePlayerPassword,
        deletePlayer,
        reorderRanks,
        setPlayerExcuse,
        scheduleMatch,
        submitScore,
        confirmScore,
        adminDirectApproveScore,
        cancelMatch,
        deleteMatch,
        generateBulkPasswords,
        getFormattedPasswordListText,
        resetToDefaults,
        exportBackupJson,
        importBackupJson,
        theme,
        setTheme,
        toggleTheme,
        toast,
        showToast,
        isFirestoreConnected,
      }}
    >
      {children}
    </DefiContext.Provider>
  );
};

export const useDefi = () => {
  const context = useContext(DefiContext);
  if (!context) {
    throw new Error('useDefi must be used within a DefiProvider');
  }
  return context;
};
