import { Player, Match, LeagueSettings } from '../types/defi';

export const CLUB_COURTS = [
  'A Kortu (Sert Kort)',
  'B Kortu (Sert Kort)',
  'C Kortu (Sert Kort)',
] as const;

export type ClubCourt = (typeof CLUB_COURTS)[number];

export const INITIAL_SETTINGS: LeagueSettings = {
  leagueName: 'ZTDSK Kış Defi Ligi',
  clubName: 'Zonguldak Tenis Deniz Spor Kulübü',
  coordinatorName: 'Vahit Bergin',
  coordinatorPhone: '05325554157',
  adminPassword: '6735',
  startDate: '2026-10-05',
  endDate: '2027-02-21',
  playoffStartDate: '2027-02-22',
  playoffEndDate: '2027-02-28',
  entryFee: '1.500 TL (Kulüp dernek hesabına Bağış)',
  lateJoinDeadline: '2027-02-01',
};

export const OFFICIAL_RULES = [
  {
    number: 1,
    title: 'Lig Takvimi & Tarihler',
    text: 'Defi Ligi Başlangıç Tarihi: 05 Ekim 2026\nDefi Ligi Bitiş Tarihi: 21 Şubat 2027\nPlay-OFF Maçları: 22 – 28 Şubat 2027',
  },
  {
    number: 2,
    title: 'Katılım Koşulları',
    text: 'Defi ligi kulüp içi olarak yapılacağından 14 yaş üzeri tüm sporcular ve üyelerimiz katılabilir.',
  },
  {
    number: 3,
    title: 'Kategoriler',
    text: '14(+) Tek Erkekler ve 14(+) Tek Kadınlar şeklinde 2 farklı kategori şeklinde yapılacaktır.',
  },
  {
    number: 4,
    title: 'Geçici Sıralama Belirleme',
    text: 'Defi başlamadan katılımcılar arasında geçici bir sıralama yapılacaktır. Bu sıralama yapılırken oyuncuların TTF puanları, TTF turnuva performansları, antrenman devamlılık durumları, doğum tarihleri vb. kriterler göz önünde bulundurulacaktır. Geçici sıralamayı DEFİ KOMİTESİ düzenleyecektir.',
  },
  {
    number: 5,
    title: 'Haftalık Teklif Kotası',
    text: 'Geçici sıralama oluşturulup yayınlandıktan sonra her oyuncu haftada 1 kez maç teklif edebilir ve 1 kez maç teklifi alabilir.',
  },
  {
    number: 6,
    title: 'Defi Koordinatörü & İletişim',
    text: 'DEFİ KOORDİNATÖRÜ Vahit Bergin’dir. Katılımcıları içeren ayrı bir WhatsApp grubu kurulacak ve tüm teklifler bu WhatsApp üzerinden koordine edilecektir.',
  },
  {
    number: 7,
    title: 'Meydan Okuma Aralığı & Sıralama Değişimi',
    text: 'Her oyuncu bulunduğu sıralamadan 5 üstüne kadar maç teklifi edebilir, 5 altına kadar bir oyuncudan maç teklifi alabilir.\n\nÖrnek: 10. sıradayım. 5 sıra üzerimdeki oyuncuya kadar teklif edebiliyorum. Diyelim ki 5. sıradaki oyuncuya teklif ettim. Maçı kazanırsam ben 5. sıraya yükseliyorum, bana kaybeden oyuncu bir alt sıraya (5.likten 6.lığa) düşüyor (ve aradaki oyuncular 1 basamak aşağı kayar). Maçı kaybedersem sıralama değişmiyor.',
  },
  {
    number: 8,
    title: 'Rövanş Kuralı',
    text: 'Oyuncu; kaybettiği oyuncuya 2 haftadan önce bir kez daha maç teklifi yapamaz.',
  },
  {
    number: 9,
    title: 'Kort Rezervasyonu & Maç Topu',
    text: 'Maç topunun temini ve maç için 1.5 saatlik kort rezervasyonunun yapılması; maç teklifi yapan oyuncunun (challenger) yükümlülüğündedir.',
  },
  {
    number: 10,
    title: 'Mazeret Durumları',
    text: 'Maç teklif edilen kişi; sınav haftası, şehir dışı iş seyahati, şiddetli sağlık problemi vb. sebeplerden dolayı DEFİ KOMİTESİ’nin de onayıyla ilgili hafta maç oynamayabilir (mazeretli sayılır).',
  },
  {
    number: 11,
    title: 'Sonradan Katılım Kuralı',
    text: 'Defi ligine sonradan katılmak isteyen oyuncular; sıralamadaki 11. ya da aşağıya doğru oyunculardan herhangi birine maç teklif ederek defi ligine katılabilirler.\n\nÖrnek: 13 numaraya maç teklif ediyor. Maçı kazanırsa 13. sıradan lige giriyor, kaybeden 14. sıraya düşüyor. Maçı kaybederse lige en alt sıradan başlıyor.',
  },
  {
    number: 12,
    title: 'Defiden Ayrılma & Son Katılım Tarihi',
    text: 'Her oyuncunun 1 kez defiden çıkıp tekrar defi ligine katılma hakkı bulunmaktadır. Ancak 01 Şubat 2027 tarihinden sonra defi ligine dışarıdan girilemez. Bu tarihten önce defiden çıkan oyuncular da bu tarihten sonra defi ligine katılamaz.',
  },
  {
    number: 13,
    title: 'Fotoğraf Paylaşımı',
    text: 'Her maç bitiminde kortta fotoğraf çekilip defi ligi WhatsApp grubunda, maç sonucu fotoğrafla birlikte kazanan oyuncu tarafından paylaşılacaktır.',
  },
  {
    number: 14,
    title: 'PLAY-OFF Sistemi (İlk 12 Oyuncu)',
    text: 'PLAY OFF maçları ilk 12’ye kalanlar arasında eleme usulü oynanacaktır:\n• 5-6-7-8 numaralı oyuncular ile 9-10-11-12 numaralı oyuncular KURA çekilerek eşleştirilecek.\n• Kazanan 4 oyuncu; 1-2-3-4 numaralı oyuncular ile KURA ile eşleştirilecek.\n• Kazananlar yarı finale yükselecek. Yarı finaller, 3.lük ve FİNAL maçları oynanarak sonbahar-kış defi ligi sona erecektir.\n• Defi ligini ilk 3 sırada bitiren oyunculara çeşitli hediyeler ve kupalar dağıtılacaktır.',
  },
  {
    number: 15,
    title: 'Maç Formatı & Karar Puanı',
    text: 'Tüm maçlar 3 set üzerinden karar puanlı (No-Ad) ve son set (3. set) 10’lu maç tie-break (Super tie-break) şeklinde oynanacaktır.',
  },
  {
    number: 16,
    title: 'Defi Ligi Giriş Ücreti',
    text: 'Kişi başı defi katılım ücreti: 1.500 TL\nÖdemeler kulübün dernek hesabına “Bağış” olarak yapılacaktır.',
  },
  {
    number: 17,
    title: 'Son Başvuru Tarihi',
    text: 'Defi ligine son başvuru tarihi: 04 Ekim 2026 Pazar saat 19:00.',
  },
];

const AVATAR_COLORS = [
  'bg-emerald-600',
  'bg-sky-600',
  'bg-indigo-600',
  'bg-amber-600',
  'bg-purple-600',
  'bg-rose-600',
  'bg-teal-600',
  'bg-cyan-600',
  'bg-orange-600',
  'bg-violet-600',
  'bg-lime-600',
  'bg-fuchsia-600',
  'bg-blue-600',
];

// 41 Men from ZTDSK Kış Defi Ligi Güncel Sıralaması
const MEN_NAMES: string[] = [
  'Yiğit Yaman',
  'Ömer Uzuntarla',
  'Doruk Doğan',
  'Yusuf Aydoğan',
  'Kaan Algan Çavuş',
  'Kayra Gökdemir',
  'Habip Uygun',
  'Hüseyin Kundakçı',
  'Mustafa Kemal Günvar',
  'Çınar Çetintaş',
  'Erkin Erol Şen',
  'Sedar Görmüş',
  'Emre Bozkurt',
  'İlyas Çep',
  'Barbaros Ata Turgut',
  'Rahmi Üder',
  'Erhan Güner',
  'Mesut Emre Acar',
  'Kerem Mert Şenses',
  'Miraç Aksoy',
  'Ali Ünal',
  'Volkan Arslan',
  'Burak Kayhan',
  'Cem Aygün',
  'Laçin Köktürk',
  'Alper Gökmen',
  'Candaş Gencer',
  'Hasan Külah',
  'Oğuzhan Çelik',
  'Batu Aygün',
  'Hayrettin Furat',
  'Çağatay Büyükuysal',
  'Utku Kefeli',
  'Mehmet Genç',
  'Ali Gökdemir',
  'Ertan Türkçelik',
  'Dinçer Acun',
  'Onur Dalay',
  'Volkan Yazıcıoğlu',
  'Yunus Aydoğan',
  'Hikmet Kavaz',
];

// 14 Women from ZTDSK Kış Defi Ligi Güncel Sıralaması
const WOMEN_NAMES: string[] = [
  'Hülya Tosun',
  'Zeynep Talia Şahin',
  'Derin Türkçelik',
  'Özlem Yıldız',
  'Sevilay Yıldırım',
  'Merve Yerlikaya',
  'Gülüşan Alkılıç',
  'Nihal Pişkin',
  'Sabiha Köktürk',
  'Deniz Uncu',
  'Sema Karaçoban',
  'Özlem Bahadır',
  'Burcu Kurnaz',
  'Dilvin Gökçe',
];

export const INITIAL_PLAYERS: Player[] = [
  // 14(+) Tek Erkekler (41 Oyuncu) - 4 Haneli Şifreler: 1001 .. 1041
  ...MEN_NAMES.map((name, index) => {
    const rank = index + 1;
    const pin = (1000 + rank).toString();
    const isExcusedDemo = rank === 7;
    return {
      id: `p_m${rank}`,
      name,
      category: 'men' as const,
      rank,
      previousRank: rank,
      phone: 'ZTDSK Üyesi',
      password: pin,
      isExcused: isExcusedDemo,
      excuseReason: isExcusedDemo ? 'Şehir Dışı / İş Seyahati (Madde 10)' : undefined,
      excuseStartDate: isExcusedDemo ? '2026-10-12' : undefined,
      excuseEndDate: isExcusedDemo ? '2026-10-22' : undefined,
      excuseNotes: isExcusedDemo ? 'DEFİ Komitesi onayıyla 10 gün iş seyahati izni.' : undefined,
      matchesPlayed: rank <= 4 ? 3 : rank <= 12 ? 2 : rank <= 20 ? 1 : 0,
      wins: rank === 1 ? 3 : rank <= 4 ? 2 : rank <= 12 ? 1 : 0,
      losses: rank === 1 ? 0 : rank <= 4 ? 1 : rank <= 12 ? 1 : 0,
      ttfScore: Math.max(1200, 2400 - (rank - 1) * 25),
      joinedDate: '2026-10-05',
      avatarBg: AVATAR_COLORS[index % AVATAR_COLORS.length],
    };
  }),

  // 14(+) Tek Kadınlar (14 Oyuncu) - 4 Haneli Şifreler: 2001 .. 2014
  ...WOMEN_NAMES.map((name, index) => {
    const rank = index + 1;
    const pin = (2000 + rank).toString();
    const isExcusedDemo = rank === 5;
    return {
      id: `p_w${rank}`,
      name,
      category: 'women' as const,
      rank,
      previousRank: rank,
      phone: 'ZTDSK Üyesi',
      password: pin,
      isExcused: isExcusedDemo,
      excuseReason: isExcusedDemo ? 'Sakatlık / Tedavi Süreci (Madde 10)' : undefined,
      excuseStartDate: isExcusedDemo ? '2026-10-10' : undefined,
      excuseEndDate: isExcusedDemo ? '2026-10-24' : undefined,
      excuseNotes: isExcusedDemo ? 'Bilek sakatlığı nedeniyle fizik tedavi görmektedir.' : undefined,
      matchesPlayed: rank <= 4 ? 3 : rank <= 8 ? 2 : 1,
      wins: rank === 1 ? 3 : rank <= 4 ? 2 : 1,
      losses: rank === 1 ? 0 : 1,
      ttfScore: Math.max(1300, 2300 - (rank - 1) * 35),
      joinedDate: '2026-10-05',
      avatarBg: AVATAR_COLORS[(index + 3) % AVATAR_COLORS.length],
    };
  }),
];

export const INITIAL_MATCHES: Match[] = [
  // 1. Confirmed Match - Men: Yiğit Yaman (#1) vs Ömer Uzuntarla (#2)
  {
    id: 'm_101',
    category: 'men',
    challengerId: 'p_m2', // Ömer Uzuntarla
    defenderId: 'p_m1', // Yiğit Yaman
    challengerRankAtMatch: 2,
    defenderRankAtMatch: 1,
    matchDate: '2026-10-08',
    matchTime: '18:00',
    court: 'Merkez Kort',
    status: 'confirmed',
    score: {
      sets: [
        { player1Games: 6, player2Games: 4 },
        { player1Games: 3, player2Games: 6 },
        { player1Games: 10, player2Games: 7 },
      ],
      winnerId: 'p_m1', // Yiğit Yaman won, rank 1 preserved
      loserId: 'p_m2',
      scoreText: '4-6, 6-3, [10-7]',
    },
    scoreSubmittedBy: 'p_m1',
    scoreSubmittedAt: '2026-10-08T20:15:00Z',
    scoreConfirmedBy: 'p_m2',
    scoreConfirmedAt: '2026-10-08T20:45:00Z',
    notes: 'ZTDSK 1 numaralı kortta nefes kesen maç. Yiğit Yaman 1. sıradaki yerini korudu.',
    photoUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=600&q=80',
    createdAt: '2026-10-06T11:00:00Z',
  },

  // 2. Confirmed Match - Women: Hülya Tosun (#1) vs Zeynep Talia Şahin (#2)
  {
    id: 'm_102',
    category: 'women',
    challengerId: 'p_w2', // Zeynep Talia Şahin
    defenderId: 'p_w1', // Hülya Tosun
    challengerRankAtMatch: 2,
    defenderRankAtMatch: 1,
    matchDate: '2026-10-10',
    matchTime: '17:30',
    court: 'Kort 1 (Toprak)',
    status: 'confirmed',
    score: {
      sets: [
        { player1Games: 6, player2Games: 4 },
        { player1Games: 6, player2Games: 3 },
      ],
      winnerId: 'p_w1',
      loserId: 'p_w2',
      scoreText: '6-4, 6-3',
    },
    scoreSubmittedBy: 'p_w1',
    scoreSubmittedAt: '2026-10-10T19:30:00Z',
    scoreConfirmedBy: 'p_w2',
    scoreConfirmedAt: '2026-10-10T20:00:00Z',
    notes: 'Kadınlar zirve mücadelesinde Hülya Tosun galip geldi.',
    createdAt: '2026-10-07T14:20:00Z',
  },

  // 3. TODAY'S MATCH 1 (GÜNÜN MAÇI - 2026-10-14): Kayra Gökdemir (#6) vs Kaan Algan Çavuş (#5)
  {
    id: 'm_103',
    category: 'men',
    challengerId: 'p_m6', // Kayra Gökdemir
    defenderId: 'p_m5', // Kaan Algan Çavuş
    challengerRankAtMatch: 6,
    defenderRankAtMatch: 5,
    matchDate: '2026-10-14',
    matchTime: '18:30',
    court: 'Merkez Kort',
    status: 'scheduled',
    notes: '5 sıra kuralı dahilinde maç teklifi. Wilson US Open topları hazır.',
    createdAt: '2026-10-12T09:30:00Z',
  },

  // 4. TODAY'S MATCH 2 (GÜNÜN MAÇI - 2026-10-14): Özlem Yıldız (#4) vs Derin Türkçelik (#3)
  // Status: score_submitted -> awaiting loser Derin Türkçelik's confirmation!
  {
    id: 'm_104',
    category: 'women',
    challengerId: 'p_w4', // Özlem Yıldız
    defenderId: 'p_w3', // Derin Türkçelik
    challengerRankAtMatch: 4,
    defenderRankAtMatch: 3,
    matchDate: '2026-10-14',
    matchTime: '15:00',
    court: 'Kort 2 (Sert Zemin)',
    status: 'score_submitted',
    score: {
      sets: [
        { player1Games: 6, player2Games: 4 },
        { player1Games: 2, player2Games: 6 },
        { player1Games: 10, player2Games: 8 },
      ],
      winnerId: 'p_w4',
      loserId: 'p_w3',
      scoreText: '6-4, 2-6, [10-8]',
    },
    scoreSubmittedBy: 'p_w4',
    scoreSubmittedAt: '2026-10-14T17:10:00Z',
    notes: 'Özlem Yıldız skoru girdi. Derin Türkçelik’in onaylaması bekleniyor.',
    createdAt: '2026-10-11T16:00:00Z',
  },

  // 5. UPCOMING MATCH (Takvimde Gelecek Maç): Hüseyin Kundakçı (#8) vs Habip Uygun (#7)
  {
    id: 'm_105',
    category: 'men',
    challengerId: 'p_m8', // Hüseyin Kundakçı
    defenderId: 'p_m7', // Habip Uygun
    challengerRankAtMatch: 8,
    defenderRankAtMatch: 7,
    matchDate: '2026-10-16',
    matchTime: '17:00',
    court: 'A Kortu (Sert Kort)',
    status: 'scheduled',
    notes: 'Hüseyin Kundakçı kort rezervasyonunu yaptı.',
    createdAt: '2026-10-13T12:00:00Z',
  },

  // 6. UPCOMING MATCH (Takvimde Gelecek Maç - Women): Merve Yerlikaya (#6) vs Sevilay Yıldırım (#5)
  {
    id: 'm_106',
    category: 'women',
    challengerId: 'p_w6', // Merve Yerlikaya
    defenderId: 'p_w5', // Sevilay Yıldırım
    challengerRankAtMatch: 6,
    defenderRankAtMatch: 5,
    matchDate: '2026-10-17',
    matchTime: '16:30',
    court: 'B Kortu (Sert Kort)',
    status: 'scheduled',
    notes: 'Kadınlar Play-Off ilk 12 sıralama maçı.',
    createdAt: '2026-10-13T14:15:00Z',
  },
];
