import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, X, Copy, Check, Smartphone } from 'lucide-react';
import { ClubLogo } from './ClubLogo';

interface AppQRCodeProps {
  variant?: 'compact' | 'card' | 'button_only';
  onOpenModal?: () => void;
}

export const AppQRCode: React.FC<AppQRCodeProps> = ({ variant = 'card', onOpenModal }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ztdsk-defi.web.app';

  useEffect(() => {
    QRCode.toDataURL(currentUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#090d16',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [currentUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const openModal = () => {
    if (onOpenModal) {
      onOpenModal();
    } else {
      setIsModalOpen(true);
    }
  };

  if (variant === 'button_only') {
    return (
      <>
        <button
          type="button"
          onClick={openModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-500/40 transition cursor-pointer shadow-xs"
          title="Mobil Giriş Karekodunu Göster"
        >
          <QrCode className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Karekod (Mobil Giriş)</span>
          <span className="sm:hidden">Karekod</span>
        </button>

        {isModalOpen && (
          <QRCodeModal
            qrDataUrl={qrDataUrl}
            currentUrl={currentUrl}
            copied={copied}
            onCopy={handleCopyLink}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-950 border border-blue-900/60 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-4">
          {/* QR Thumbnail */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="w-20 h-20 bg-white p-1.5 rounded-2xl shadow-md border-2 border-emerald-500/50 cursor-pointer shrink-0 hover:scale-105 transition-transform flex items-center justify-center group relative"
            title="Büyütmek için tıklayın"
          >
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Mobil Giriş Karekodu" className="w-full h-full object-contain" />
            ) : (
              <QrCode className="w-8 h-8 text-slate-800 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-blue-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[9px] font-black bg-slate-950/90 text-emerald-300 px-1 py-0.5 rounded">BÜYÜT</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                Mobil Hızlı Erişim
              </span>
              <span className="text-slate-400 text-xs hidden md:inline">• Telefonunuzdan Tek Tıkla Bağlanın</span>
            </div>
            <h4 className="font-bold text-sm sm:text-base text-white">
              Kameranızı Karekoda Doğrultup Giriş Yapın
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Korttayken veya mobil cihazınızdayken kamera ile karekodu taratarak ZTDSK Defi Ligi portalını anında açabilir, maç teklif edebilir ve maç skorlarını kaydedebilirsiniz.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Kopyalandı!' : 'Linki Kopyala'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/60 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <QrCode className="w-4 h-4" />
            <span>Karekodu Büyüt</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <QRCodeModal
          qrDataUrl={qrDataUrl}
          currentUrl={currentUrl}
          copied={copied}
          onCopy={handleCopyLink}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

interface ModalProps {
  qrDataUrl: string;
  currentUrl: string;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}

const QRCodeModal: React.FC<ModalProps> = ({
  qrDataUrl,
  currentUrl,
  copied,
  onCopy,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-center space-y-4">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-xl transition cursor-pointer bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center pt-2">
          <ClubLogo size={52} />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
            ZTDSK Kış Defi Ligi
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">
            Mobil Giriş Karekodu
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Telefonunuzun kamerası ile aşağıdaki karekodu okutunuz:
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-3xl shadow-xl inline-block border-4 border-emerald-500 mx-auto">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="ZTDSK Defi Ligi Karekod"
              className="w-56 h-56 object-contain block mx-auto"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400">
              Yükleniyor...
            </div>
          )}
        </div>

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-[11px] text-slate-300 space-y-1 text-left">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nasıl Kullanılır?</span>
          </div>
          <ol className="list-decimal list-inside space-y-0.5 text-slate-400">
            <li>Cep telefonunuzun standart kamerasını açın.</li>
            <li>Kamerayı karekoda doğrultun.</li>
            <li>Ekranda beliren bağlantıya dokunarak defi portalına girin.</li>
          </ol>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCopy}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Bağlantı Kopyalandı!' : 'Linki Kopyala'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 transition cursor-pointer"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
