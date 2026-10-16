import React, { useState } from 'react';
import { useDefi } from '../context/DefiContext';
import { X, Lock, User, Shield, ChevronDown, CheckCircle2, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPlayerId?: string;
  initialMode?: 'player' | 'admin';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  preselectedPlayerId,
  initialMode = 'player',
}) => {
  const { players, currentCategory, loginAsPlayer, loginAsAdmin } = useDefi();

  const [activeMode, setActiveMode] = useState<'player' | 'admin'>(initialMode);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(preselectedPlayerId || '');
  const [password, setPassword] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('6735');
  const [errorMessage, setErrorMessage] = useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      if (initialMode) setActiveMode(initialMode);
      if (preselectedPlayerId) setSelectedPlayerId(preselectedPlayerId);
      setErrorMessage('');
    }
  }, [isOpen, initialMode, preselectedPlayerId]);

  if (!isOpen) return null;

  const categoryPlayers = players
    .filter((p) => p.category === currentCategory)
    .sort((a, b) => a.rank - b.rank);

  const allSortedPlayers = [...players].sort((a, b) => a.rank - b.rank);

  const handlePlayerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!selectedPlayerId) {
      setErrorMessage('Lütfen açılır listeden isminizi seçiniz.');
      return;
    }
    const res = loginAsPlayer(selectedPlayerId, password);
    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.message || 'Giriş başarısız.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = loginAsAdmin(adminPassword);
    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.message || 'Hatalı yönetici şifresi.');
    }
  };

  const quickLoginAs = (playerId: string) => {
    const res = loginAsPlayer(playerId, '123');
    if (res.success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Sisteme Giriş Yap
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Zonguldak Tenis Deniz Spor Kulübü Defi Portalı
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 p-1.5">
          <button
            onClick={() => {
              setActiveMode('player');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
              activeMode === 'player'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Oyuncu Girişi</span>
          </button>
          <button
            onClick={() => {
              setActiveMode('admin');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
              activeMode === 'admin'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Yönetici Modu (Admin)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          {activeMode === 'player' ? (
            <form onSubmit={handlePlayerLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  İsminizi Seçiniz (Açılır Liste):
                </label>
                <div className="relative">
                  <select
                    value={selectedPlayerId}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                  >
                    <option value="">-- Oyuncu Listesinden Seçiniz --</option>
                    <optgroup label="14(+) Tek Erkekler">
                      {players
                        .filter((p) => p.category === 'men')
                        .sort((a, b) => a.rank - b.rank)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            #{p.rank} - {p.name}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="14(+) Tek Kadınlar">
                      {players
                        .filter((p) => p.category === 'women')
                        .sort((a, b) => a.rank - b.rank)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            #{p.rank} - {p.name}
                          </option>
                        ))}
                    </optgroup>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Oyuncu Şifresi:
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Defi Komitesi Şifresi
                  </span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="4 haneli şifrenizi girin..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  💡 Şifrenizi unuttuysanız Defi Komitesi / Yöneticinizden öğrenebilirsiniz.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-950/60 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Giriş Yap ve Maçlarıma Git</span>
              </button>

              {/* Quick Demo Logins */}
              <div className="pt-3 border-t border-slate-800">
                <div className="text-[11px] text-slate-400 mb-2 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Hızlı Test Girişleri (Tek Tıkla Giriş):
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => quickLoginAs('p_m1')}
                    className="p-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-left transition"
                  >
                    <div className="font-semibold text-emerald-400 truncate">Yiğit Yaman</div>
                    <div className="text-[10px] text-slate-400">Erkekler #1 (Şifre: 1001)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickLoginAs('p_w3')}
                    className="p-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-left transition"
                  >
                    <div className="font-semibold text-rose-400 truncate">Derin Türkçelik</div>
                    <div className="text-[10px] text-amber-300">Kadınlar #3 (Onay Bekliyor)</div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Defi Komitesi / Yönetici Şifresi:
                  </label>
                  <span className="text-[11px] text-amber-400 font-mono font-bold">
                    Şifre: 6735
                  </span>
                </div>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Yönetici şifresi (6735)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl text-xs text-amber-300/90 leading-relaxed">
                Yönetici modu ile:
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-slate-300">
                  <li>Oyuncu ekleyip çıkarabilir, şifreleri değiştirebilirsiniz.</li>
                  <li>Geçerli defi listesini manuel veya toplu güncelleyebilirsiniz.</li>
                  <li>Maç eşleştirip tüm skorları doğrudan onaylayabilirsiniz.</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-amber-950/60 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Shield className="w-4 h-4" />
                <span>Yönetici Olarak Giriş Yap</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
