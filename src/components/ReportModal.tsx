import React, { useRef } from 'react';
import { useDefi } from '../context/DefiContext';
import { Printer, X, Download, FileText, CheckCircle2 } from 'lucide-react';
import { ClubLogo } from './ClubLogo';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const { players, matches, settings, showToast } = useDefi();
  const printableAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const womenPlayers = players
    .filter((p) => p.category === 'women')
    .sort((a, b) => a.rank - b.rank);

  const menPlayers = players
    .filter((p) => p.category === 'men')
    .sort((a, b) => a.rank - b.rank);

  // Chronological confirmed/completed matches
  const completedMatches = matches
    .filter((m) => m.status === 'confirmed' && m.score)
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());

  const todayStr = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Generates standalone official monochrome HTML document for printing or downloading
  const generateOfficialHtml = () => {
    return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>ZTDSK Defi Ligi Resmi Raporu - ${todayStr}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 12mm 15mm 12mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
      color: #000000;
      background: #ffffff;
      margin: 0;
      padding: 16px;
      font-size: 10pt;
      line-height: 1.3;
    }
    .official-header {
      border-bottom: 2px solid #000000;
      padding-bottom: 8px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .club-title {
      font-size: 10pt;
      font-weight: bold;
      color: #222222;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-title {
      font-size: 15pt;
      font-weight: 900;
      margin: 4px 0 2px 0;
      color: #000000;
      letter-spacing: 0.5px;
    }
    .doc-subtitle {
      font-size: 9pt;
      color: #444444;
    }
    .meta-box {
      text-align: right;
      font-size: 8.5pt;
      color: #222222;
      line-height: 1.4;
    }
    .meta-box strong {
      color: #000000;
    }
    .section-header {
      font-size: 10pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 16px 0 6px 0;
      padding-bottom: 2px;
      border-bottom: 1.5px solid #000000;
      display: flex;
      justify-content: space-between;
      color: #000000;
    }
    .section-count {
      font-size: 8.5pt;
      font-weight: normal;
      color: #444444;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 9pt;
    }
    th, td {
      border: 1px solid #444444;
      padding: 4px 6px;
      text-align: left;
    }
    th {
      background-color: #f0f0f0;
      color: #000000;
      font-weight: bold;
      font-size: 8.5pt;
      text-transform: uppercase;
    }
    .text-center {
      text-align: center;
    }
    .col-rank {
      width: 40px;
      text-align: center;
      font-weight: bold;
    }
    .col-num {
      width: 55px;
      text-align: center;
    }
    .col-date {
      width: 95px;
      font-family: monospace;
      font-size: 8.5pt;
    }
    .col-score {
      text-align: center;
      font-weight: bold;
      font-family: monospace;
      width: 100px;
    }
    .footer-sign {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1.5px solid #000000;
      display: flex;
      justify-content: space-between;
      font-size: 8.5pt;
      color: #111111;
      page-break-inside: avoid;
    }
    .sign-box {
      text-align: right;
    }
    .sign-box strong {
      display: block;
      font-size: 9.5pt;
      color: #000000;
    }
    .print-btn-bar {
      margin-bottom: 16px;
      padding: 10px;
      background: #e5e7eb;
      border-radius: 6px;
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .btn {
      padding: 6px 14px;
      background: #000000;
      color: #ffffff;
      border: none;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
      font-size: 10pt;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="no-print print-btn-bar">
    <button class="btn" onclick="window.print()">🖨️ Yazdır / PDF Olarak Kaydet</button>
    <span style="font-size: 9pt; color: #444;">(Yazıcı hedefinden "PDF Olarak Kaydet" seçeneğini seçebilirsiniz)</span>
  </div>

  <div class="official-header">
    <div>
      <div class="club-title">${settings.clubName} (Kuruluş 1951)</div>
      <div class="doc-title">DEFİ LİGİ RESMİ DURUM RAPORU</div>
      <div class="doc-subtitle">14(+) Tek Kadınlar & 14(+) Tek Erkekler Güncel Sıralama ve Oynanan Maçlar</div>
    </div>
    <div class="meta-box">
      <div>Rapor Tarihi: <strong>${todayStr}</strong></div>
      <div>Defi Koordinatörü: <strong>${settings.coordinatorName}</strong></div>
      <div>Lig Sezonu: <strong>${settings.startDate} / ${settings.endDate}</strong></div>
    </div>
  </div>

  <!-- SECTION 1: KADINLAR SIRALAMASI -->
  <div class="section-header">
    <span>14(+) TEK KADINLAR GÜNCEL DEFİ SIRALAMASI</span>
    <span class="section-count">${womenPlayers.length} Sporcu</span>
  </div>
  <table>
    <thead>
      <tr>
        <th class="col-rank">Sıra</th>
        <th>Sporcu Adı Soyadı</th>
        <th class="col-num">Maç</th>
        <th class="col-num">Galibiyet</th>
        <th class="col-num">Mağlubiyet</th>
      </tr>
    </thead>
    <tbody>
      ${womenPlayers
        .map(
          (p) => `<tr>
            <td class="col-rank">${p.rank}</td>
            <td><strong>${p.name}</strong>${p.isExcused ? ' <em>(Mazeretli)</em>' : ''}</td>
            <td class="col-num">${p.matchesPlayed}</td>
            <td class="col-num">${p.wins}</td>
            <td class="col-num">${p.losses}</td>
          </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <!-- SECTION 2: ERKEKLER SIRALAMASI -->
  <div class="section-header">
    <span>14(+) TEK ERKEKLER GÜNCEL DEFİ SIRALAMASI</span>
    <span class="section-count">${menPlayers.length} Sporcu</span>
  </div>
  <table>
    <thead>
      <tr>
        <th class="col-rank">Sıra</th>
        <th>Sporcu Adı Soyadı</th>
        <th class="col-num">Maç</th>
        <th class="col-num">Galibiyet</th>
        <th class="col-num">Mağlubiyet</th>
      </tr>
    </thead>
    <tbody>
      ${menPlayers
        .map(
          (p) => `<tr>
            <td class="col-rank">${p.rank}</td>
            <td><strong>${p.name}</strong>${p.isExcused ? ' <em>(Mazeretli)</em>' : ''}</td>
            <td class="col-num">${p.matchesPlayed}</td>
            <td class="col-num">${p.wins}</td>
            <td class="col-num">${p.losses}</td>
          </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <!-- SECTION 3: OYNANMIŞ MAÇLAR LİSTESİ -->
  <div class="section-header">
    <span>ŞU ANA KADAR OYNANMIŞ MAÇLAR LİSTESİ (TARİH SIRASINA GÖRE)</span>
    <span class="section-count">${completedMatches.length} Karşılaşma</span>
  </div>
  ${
    completedMatches.length === 0
      ? '<p style="font-size: 8.5pt; color: #555; font-style: italic;">Henüz tamamlanmış maç kaydı bulunmamaktadır.</p>'
      : `<table>
    <thead>
      <tr>
        <th class="col-date">Tarih</th>
        <th style="width: 70px;">Kategori</th>
        <th style="width: 100px;">Kort</th>
        <th>1. Oyuncu (Teklif Eden)</th>
        <th>2. Oyuncu (Savunan)</th>
        <th class="col-score">Skor</th>
        <th>Galip</th>
      </tr>
    </thead>
    <tbody>
      ${completedMatches
        .map((m) => {
          const p1 = players.find((p) => p.id === m.challengerId);
          const p2 = players.find((p) => p.id === m.defenderId);
          const winner = players.find((p) => p.id === m.score?.winnerId);
          return `<tr>
            <td class="col-date">${m.matchDate} ${m.matchTime || ''}</td>
            <td>${m.category === 'men' ? 'Erkekler' : 'Kadınlar'}</td>
            <td>${m.court || 'A Kortu (Sert)'}</td>
            <td>${p1?.name || 'Oyuncu'} (#${m.challengerRankAtMatch})</td>
            <td>${p2?.name || 'Oyuncu'} (#${m.defenderRankAtMatch})</td>
            <td class="col-score">${m.score?.scoreText || '-'}</td>
            <td><strong>${winner?.name || '-'}</strong></td>
          </tr>`;
        })
        .join('')}
    </tbody>
  </table>`
  }

  <div class="footer-sign">
    <div>
      <strong>Zonguldak Tenis Deniz Spor Kulübü Derneği</strong><br>
      Fener Mevkii, Zonguldak<br>
      Kulüp Tescil No: 67-001-002
    </div>
    <div class="sign-box">
      <strong>Defi Koordinatörü</strong>
      ${settings.coordinatorName}<br>
      <em>Resmi Kayıt ve Tasdik Belgesi</em>
    </div>
  </div>
</body>
</html>`;
  };

  // Robust print method that opens a clean official window and triggers print
  const handlePrint = () => {
    const html = generateOfficialHtml();

    try {
      // 1. Try opening dedicated print window
      const printWin = window.open('', '_blank', 'width=900,height=800');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(html);
        printWin.document.close();

        // Trigger print after rendering
        setTimeout(() => {
          printWin.focus();
          printWin.print();
        }, 300);

        showToast('Yazdırma penceresi açıldı. PDF olarak kaydedebilirsiniz.', 'success');
        return;
      }
    } catch {
      // Popup might be blocked
    }

    // 2. Fallback: invisible iframe print
    try {
      let printFrame = document.getElementById('ztdsk-print-frame') as HTMLIFrameElement;
      if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'ztdsk-print-frame';
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        document.body.appendChild(printFrame);
      }

      const frameDoc = printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(html);
        frameDoc.close();

        setTimeout(() => {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        }, 250);

        showToast('Yazdırma penceresi açıldı.', 'success');
        return;
      }
    } catch {
      // If blocked, fallback to downloading html
    }

    // 3. Fallback: download HTML file directly so user can open in browser and print
    handleDownloadHtml();
  };

  // Direct download of the official HTML report
  const handleDownloadHtml = () => {
    const html = generateOfficialHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZTDSK_Defi_Resmi_Rapor_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Resmi rapor belgesi indirildi. Açıp Ctrl+P ile yazdırabilirsiniz.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white text-slate-900 border border-slate-300 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col my-auto max-h-[94vh]">
        {/* Top Control Bar - Clean & Professional */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-100/90 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">ZTDSK Defi Ligi Resmi Raporu</h2>
              <p className="text-[11px] text-slate-600">
                Resmi belge formatı (Sıralamalar ve Oynanan Maçlar)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Resmi belgeyi bilgisayara indir"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Belgeyi İndir</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>PDF Olarak Yazdır</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg transition"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Preview (Clean, Formal, Black & White) */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex-1">
          <div
            ref={printableAreaRef}
            className="bg-white text-black p-6 sm:p-10 shadow-md border border-slate-300 font-sans max-w-3xl mx-auto space-y-6 text-xs sm:text-sm"
          >
            {/* Header */}
            <div className="border-b-2 border-black pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
              <div className="flex items-center gap-3">
                <ClubLogo size={52} />
                <div>
                  <div className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                    {settings.clubName} (Kuruluş 1951)
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-black uppercase mt-0.5">
                    DEFİ LİGİ RESMİ DURUM RAPORU
                  </h1>
                  <p className="text-[11px] text-slate-600">
                    14(+) Tek Kadınlar & 14(+) Tek Erkekler Güncel Sıralama ve Oynanan Maçlar
                  </p>
                </div>
              </div>

              <div className="text-[11px] sm:text-right text-slate-800 leading-tight">
                <div>Rapor Tarihi: <strong>{todayStr}</strong></div>
                <div>Defi Koordinatörü: <strong>{settings.coordinatorName}</strong></div>
                <div>Sezon: <strong>{settings.startDate} / {settings.endDate}</strong></div>
              </div>
            </div>

            {/* TABLO 1: KADINLAR SIRALAMASI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-black pb-1 font-bold text-black text-xs uppercase">
                <span>14(+) TEK KADINLAR GÜNCEL DEFİ SIRALAMASI</span>
                <span className="text-[11px] text-slate-600">{womenPlayers.length} Sporcu</span>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border border-slate-400 text-black font-bold">
                    <th className="p-2 border border-slate-300 text-center w-12">Sıra</th>
                    <th className="p-2 border border-slate-300">Sporcu Adı Soyadı</th>
                    <th className="p-2 border border-slate-300 text-center w-24">Oynanan Maç</th>
                    <th className="p-2 border border-slate-300 text-center w-20">Galibiyet</th>
                    <th className="p-2 border border-slate-300 text-center w-20">Mağlubiyet</th>
                  </tr>
                </thead>
                <tbody>
                  {womenPlayers.map((player) => (
                    <tr key={player.id} className="border border-slate-300">
                      <td className="p-2 border border-slate-300 text-center font-bold text-black">
                        #{player.rank}
                      </td>
                      <td className="p-2 border border-slate-300 font-semibold text-black">
                        {player.name}
                        {player.isExcused && (
                          <span className="ml-1 text-[10px] text-slate-600 font-normal">
                            (Mazeretli)
                          </span>
                        )}
                      </td>
                      <td className="p-2 border border-slate-300 text-center text-slate-800">
                        {player.matchesPlayed}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-bold text-black">
                        {player.wins}
                      </td>
                      <td className="p-2 border border-slate-300 text-center text-slate-700">
                        {player.losses}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TABLO 2: ERKEKLER SIRALAMASI */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between border-b border-black pb-1 font-bold text-black text-xs uppercase">
                <span>14(+) TEK ERKEKLER GÜNCEL DEFİ SIRALAMASI</span>
                <span className="text-[11px] text-slate-600">{menPlayers.length} Sporcu</span>
              </div>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border border-slate-400 text-black font-bold">
                    <th className="p-2 border border-slate-300 text-center w-12">Sıra</th>
                    <th className="p-2 border border-slate-300">Sporcu Adı Soyadı</th>
                    <th className="p-2 border border-slate-300 text-center w-24">Oynanan Maç</th>
                    <th className="p-2 border border-slate-300 text-center w-20">Galibiyet</th>
                    <th className="p-2 border border-slate-300 text-center w-20">Mağlubiyet</th>
                  </tr>
                </thead>
                <tbody>
                  {menPlayers.map((player) => (
                    <tr key={player.id} className="border border-slate-300">
                      <td className="p-2 border border-slate-300 text-center font-bold text-black">
                        #{player.rank}
                      </td>
                      <td className="p-2 border border-slate-300 font-semibold text-black">
                        {player.name}
                        {player.isExcused && (
                          <span className="ml-1 text-[10px] text-slate-600 font-normal">
                            (Mazeretli)
                          </span>
                        )}
                      </td>
                      <td className="p-2 border border-slate-300 text-center text-slate-800">
                        {player.matchesPlayed}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-bold text-black">
                        {player.wins}
                      </td>
                      <td className="p-2 border border-slate-300 text-center text-slate-700">
                        {player.losses}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TABLO 3: ŞU ANA KADAR OYNANMIŞ MAÇLAR */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between border-b border-black pb-1 font-bold text-black text-xs uppercase">
                <span>ŞU ANA KADAR OYNANMIŞ MAÇLAR LİSTESİ (TARİH SIRASINA GÖRE)</span>
                <span className="text-[11px] text-slate-600">{completedMatches.length} Karşılaşma</span>
              </div>

              {completedMatches.length === 0 ? (
                <div className="p-3 text-center text-slate-500 italic text-xs border border-slate-300">
                  Henüz onaylanmış maç kaydı bulunmamaktadır.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border border-slate-400 text-black font-bold">
                      <th className="p-2 border border-slate-300">Tarih</th>
                      <th className="p-2 border border-slate-300">Kategori</th>
                      <th className="p-2 border border-slate-300">Kort</th>
                      <th className="p-2 border border-slate-300">1. Oyuncu</th>
                      <th className="p-2 border border-slate-300">2. Oyuncu</th>
                      <th className="p-2 border border-slate-300 text-center">Set Skorları</th>
                      <th className="p-2 border border-slate-300">Galip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedMatches.map((m) => {
                      const p1 = players.find((p) => p.id === m.challengerId);
                      const p2 = players.find((p) => p.id === m.defenderId);
                      const winner = players.find((p) => p.id === m.score?.winnerId);

                      return (
                        <tr key={m.id} className="border border-slate-300">
                          <td className="p-2 border border-slate-300 font-mono text-[11px]">
                            {m.matchDate} {m.matchTime || ''}
                          </td>
                          <td className="p-2 border border-slate-300 text-[11px]">
                            {m.category === 'men' ? 'Erkekler' : 'Kadınlar'}
                          </td>
                          <td className="p-2 border border-slate-300 text-[11px]">
                            {m.court || 'A Kortu (Sert Kort)'}
                          </td>
                          <td className="p-2 border border-slate-300">
                            {p1?.name} (#{m.challengerRankAtMatch})
                          </td>
                          <td className="p-2 border border-slate-300">
                            {p2?.name} (#{m.defenderRankAtMatch})
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                            {m.score?.scoreText}
                          </td>
                          <td className="p-2 border border-slate-300 font-bold text-black">
                            {winner?.name}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Formal Footer Sign-Off */}
            <div className="pt-6 border-t border-black flex justify-between items-end text-[11px] text-slate-800">
              <div>
                <p className="font-bold text-black">Zonguldak Tenis Deniz Spor Kulübü Derneği</p>
                <p>Fener Mevkii, Zonguldak</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-black">Defi Koordinatörü</p>
                <p className="font-semibold">{settings.coordinatorName}</p>
                <p className="text-[10px] text-slate-600">Resmi Kayıt ve Onay Belgesi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-600 hidden sm:inline">
            📄 Resmi lig raporu belgesidir. Yazdır butonuna basarak doğrudan PDF olarak kaydedebilirsiniz.
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Kapat
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>PDF Olarak Yazdır / Kaydet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
