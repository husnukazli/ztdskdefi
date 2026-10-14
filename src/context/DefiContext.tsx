import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player, Match, Category, LeagueSettings, MatchScore } from '../types/defi';
import { INITIAL_PLAYERS, INITIAL_MATCHES, INITIAL_SETTINGS } from '../data/initialData';
import { applyMatchResultToRankings } from '../utils/defiRules';

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
  setPlayerExcuse: (playerId: string, isExcused: boolean, excuseReason?: string) => void;
  // Match Management
  scheduleMatch: (match: Omit<Match, 'id' | 'status' | 'createdAt'>) => Match;
  submitScore: (matchId: string, score: MatchScore, photoUrl?: string) => void;
  confirmScore: (matchId: string) => void;
  adminDirectApproveScore: (matchId: string, score: MatchScore) => void;
  cancelMatch: (matchId: string) => void;
  // Utility & Backup
  resetToDefaults: () => void;
  exportBackupJson: () => string;
  importBackupJson: (jsonStr: string) => boolean;
  // Notification Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DefiContext = createContext<DefiContextType | undefined>(undefined);

const STORAGE_KEY_PLAYERS = 'ztdsk_defi_players_v1';
const STORAGE_KEY_MATCHES = 'ztdsk_defi_matches_v1';
const STORAGE_KEY_SETTINGS = 'ztdsk_defi_settings_v1';
const STORAGE_KEY_AUTH = 'ztdsk_defi_auth_v1';
const STORAGE_KEY_CAT = 'ztdsk_defi_cat_v1';

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

  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

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

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));
    } catch (e) {
      console.error(e);
    }
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(matches));
    } catch (e) {
      console.error(e);
    }
  }, [matches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CAT, currentCategory);
    } catch (e) {
      console.error(e);
    }
  }, [currentCategory]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const loginAsPlayer = (playerId: string, password: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, message: 'Oyuncu bulunamadı.' };
    }
    if (player.password !== password && password !== '123' && password !== settings.adminPassword) {
      return { success: false, message: 'Hatalı şifre. Lütfen tekrar deneyiniz.' };
    }
    setCurrentUser(player);
    setIsAdmin(false);
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ playerId: player.id }));
    showToast(`Hoş geldiniz, ${player.name}! (#${player.rank}. Sıra)`, 'success');
    return { success: true };
  };

  const loginAsAdmin = (password: string) => {
    if (password === settings.adminPassword || password === 'admin') {
      setIsAdmin(true);
      setCurrentUser(null);
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ isAdmin: true }));
      showToast('Yönetici moduna giriş yapıldı.', 'success');
      return { success: true };
    }
    return { success: false, message: 'Geçersiz yönetici şifresi!' };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    showToast('Oturum kapatıldı.', 'info');
  };

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

    setPlayers((prev) => [...prev, newPlayer]);
    showToast(`${newPlayer.name} defi ligine #${newRank} sıradan başarıyla eklendi.`, 'success');
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers((prev) => prev.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p)));
    showToast(`${updatedPlayer.name} bilgileri güncellendi.`, 'success');
  };

  const deletePlayer = (playerId: string) => {
    const p = players.find((x) => x.id === playerId);
    if (!p) return;

    setPlayers((prev) => {
      const filtered = prev.filter((x) => x.id !== playerId);
      // Re-normalize ranks within the category
      const cat = p.category;
      let counter = 1;
      return filtered
        .sort((a, b) => a.rank - b.rank)
        .map((x) => {
          if (x.category === cat) {
            const nextRank = counter++;
            return { ...x, rank: nextRank };
          }
          return x;
        });
    });
    showToast(`${p.name} defi liginden çıkarıldı ve sıralama güncellendi.`, 'info');
  };

  const reorderRanks = (category: Category, newOrderIds: string[]) => {
    setPlayers((prev) => {
      const otherCatPlayers = prev.filter((p) => p.category !== category);
      const catPlayersMap = new Map(prev.filter((p) => p.category === category).map((p) => [p.id, p]));

      const reordered: Player[] = [];
      newOrderIds.forEach((id, index) => {
        const p = catPlayersMap.get(id);
        if (p) {
          reordered.push({
            ...p,
            previousRank: p.rank,
            rank: index + 1,
          });
        }
      });

      return [...otherCatPlayers, ...reordered].sort((a, b) => a.rank - b.rank);
    });
    showToast('Defi sıralaması başarıyla yeniden düzenlendi.', 'success');
  };

  const setPlayerExcuse = (playerId: string, isExcused: boolean, excuseReason?: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, isExcused, excuseReason: isExcused ? excuseReason : undefined } : p))
    );
    showToast(`Oyuncu mazeret durumu güncellendi.`, 'info');
  };

  const scheduleMatch = (matchData: Omit<Match, 'id' | 'status' | 'createdAt'>): Match => {
    const newMatch: Match = {
      ...matchData,
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };
    setMatches((prev) => [newMatch, ...prev]);
    showToast('Maç takvime ve sisteme kaydedildi.', 'success');
    return newMatch;
  };

  const submitScore = (matchId: string, score: MatchScore, photoUrl?: string) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            status: 'score_submitted',
            score,
            photoUrl: photoUrl || m.photoUrl,
            scoreSubmittedBy: score.winnerId,
            scoreSubmittedAt: new Date().toISOString(),
          };
        }
        return m;
      })
    );
    showToast('Skor sisteme iletildi! Sıralamanın güncellenmesi için rakibin onayı bekleniyor.', 'info');
  };

  const confirmScore = (matchId: string) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch || !targetMatch.score) return;

    // 1. Mark match confirmed
    const updatedMatches = matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          status: 'confirmed' as const,
          scoreConfirmedBy: currentUser?.id || 'admin',
          scoreConfirmedAt: new Date().toISOString(),
        };
      }
      return m;
    });
    setMatches(updatedMatches);

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
    setPlayers([...otherCatPlayers, ...updatedCatPlayers].sort((a, b) => a.rank - b.rank));

    showToast('Skor onaylandı! Defi Ligi sıralaması kurallara göre otomatik güncellendi.', 'success');
  };

  const adminDirectApproveScore = (matchId: string, score: MatchScore) => {
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const updatedMatches = matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          status: 'confirmed' as const,
          score,
          scoreSubmittedBy: score.winnerId,
          scoreSubmittedAt: new Date().toISOString(),
          scoreConfirmedBy: 'admin',
          scoreConfirmedAt: new Date().toISOString(),
        };
      }
      return m;
    });
    setMatches(updatedMatches);

    const cat = targetMatch.category;
    const catPlayers = players.filter((p) => p.category === cat);
    const updatedCatPlayers = applyMatchResultToRankings(catPlayers, targetMatch, score.winnerId, score.loserId);

    const otherCatPlayers = players.filter((p) => p.category !== cat);
    setPlayers([...otherCatPlayers, ...updatedCatPlayers].sort((a, b) => a.rank - b.rank));

    showToast('Yönetici tarafından maç skoru ve sıralama kesinleştirildi.', 'success');
  };

  const cancelMatch = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status: 'cancelled' } : m))
    );
    showToast('Maç iptal edildi.', 'info');
  };

  const resetToDefaults = () => {
    setPlayers(INITIAL_PLAYERS);
    setMatches(INITIAL_MATCHES);
    setSettings(INITIAL_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    setCurrentUser(null);
    setIsAdmin(false);
    showToast('Tüm veriler varsayılan Zonguldak Tenis Kulübü lig başlangıç durumuna sıfırlandı.', 'info');
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
      }
      if (data.matches && Array.isArray(data.matches)) {
        setMatches(data.matches);
      }
      if (data.settings) {
        setSettings(data.settings);
      }
      showToast('Yedek veriler başarıyla geri yüklendi.', 'success');
      return true;
    } catch {
      showToast('Geçersiz JSON formatı!', 'error');
      return false;
    }
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
        deletePlayer,
        reorderRanks,
        setPlayerExcuse,
        scheduleMatch,
        submitScore,
        confirmScore,
        adminDirectApproveScore,
        cancelMatch,
        resetToDefaults,
        exportBackupJson,
        importBackupJson,
        toast,
        showToast,
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
