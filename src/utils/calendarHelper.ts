import { Match, Player } from '../types/defi';

/**
 * Creates Google Calendar URL and ICS file generator for a match
 * Schedules 1 hour before the match time as requested by user.
 */
export function getCalendarEventDetails(
  match: Match,
  player1Name: string,
  player2Name: string
) {
  // Parse date and time
  const dateStr = match.matchDate; // YYYY-MM-DD
  const timeStr = match.matchTime || '18:00'; // HH:MM

  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  // Match start time
  const matchDate = new Date(year, month - 1, day, hours, minutes);

  // 1 hour before match time (for prep / reminder)
  const eventStartDate = new Date(matchDate.getTime() - 60 * 60 * 1000);

  // Event end time (1.5 hours after match start = 2.5 hours total)
  const eventEndDate = new Date(matchDate.getTime() + 90 * 60 * 1000);

  const title = `ZTDSK Defi Maçı: ${player1Name} vs ${player2Name}`;
  const courtName = match.court || 'A Kortu (Sert Kort)';
  const location = `Zonguldak Tenis Deniz Spor Kulübü - ${courtName}`;
  const details = `Zonguldak Tenis Deniz Spor Kulübü Defi Ligi Maçı.\n` +
    `Maç Başlama Saati: ${timeStr}\n` +
    `Kategori: ${match.category === 'men' ? '14(+) Tek Erkekler' : '14(+) Tek Kadınlar'}\n` +
    `Kort: ${courtName}\n` +
    `1. Oyuncu: ${player1Name}\n` +
    `2. Oyuncu: ${player2Name}\n` +
    `Not: Takvim kaydı hazırlık ve ısınma için maçtan 1 saat öncesine (${eventStartDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}) ayarlanmıştır.`;

  // Format dates for Google Calendar URL (YYYYMMDDTHHmmSS)
  const formatUtcDate = (d: Date): string => {
    const pad = (n: number): string => (n < 10 ? '0' + n : n.toString());
    return (
      d.getFullYear().toString() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      'T' +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      '00'
    );
  };

  const startFormatted = formatUtcDate(eventStartDate);
  const endFormatted = formatUtcDate(eventEndDate);

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(
    details
  )}&location=${encodeURIComponent(location)}`;

  return {
    title,
    location,
    details,
    eventStartDate,
    eventEndDate,
    googleCalendarUrl,
    prepTimeStr: eventStartDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Downloads an .ics calendar file for Apple Calendar / Outlook / Mobile
 */
export function downloadIcsFile(
  match: Match,
  player1Name: string,
  player2Name: string
) {
  const { title, location, details, eventStartDate, eventEndDate } = getCalendarEventDetails(
    match,
    player1Name,
    player2Name
  );

  const formatIcsDate = (d: Date): string => {
    const pad = (n: number): string => (n < 10 ? '0' + n : n.toString());
    return (
      d.getFullYear().toString() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      'T' +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      '00'
    );
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ZTDSK//Defi Ligi//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:ztdsk_match_${match.id}@tenisdeniz.org`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(eventStartDate)}`,
    `DTEND:${formatIcsDate(eventEndDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:ZTDSK Defi Maçı Hatırlatması',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ztdsk_defi_maci_${match.matchDate}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
