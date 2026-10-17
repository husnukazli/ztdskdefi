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

// 41 Men from ZTDSK Kış Defi Ligi Güncel Sıralaması (Resmi Sıralama)
export const MEN_NAMES: string[] = [
  'Yiğit Yaman',
  'Ömer Uzuntarla',
  'Doruk Doğan',
  'Yusuf Aydoğan',
  'Kaan Algan Çavuş',
  'Kayra Gökdemir',
  'Habip Uygun',
  'Sedar Görmüş',
  'Hüseyin Kundakçı',
  'Mustafa Kemal Günvar',
  'Çınar Çetintaş',
  'Erkin Erol Şen',
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
  'Hayrettin Fırat',
  'Candaş Gencer',
  'Hasan Külah',
  'Oğuzhan Çelik',
  'Batu Aygün',
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

// 14 Women from ZTDSK Kış Defi Ligi Güncel Sıralaması (Resmi Sıralama)
export const WOMEN_NAMES: string[] = [
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
    return {
      id: `p_m${rank}`,
      name,
      category: 'men' as const,
      rank,
      previousRank: rank,
      phone: 'ZTDSK Üyesi',
      password: pin,
      isExcused: false,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      ttfScore: 1500,
      joinedDate: '2026-10-05',
      avatarBg: AVATAR_COLORS[index % AVATAR_COLORS.length],
    };
  }),

  // 14(+) Tek Kadınlar (14 Oyuncu) - 4 Haneli Şifreler: 2001 .. 2014
  ...WOMEN_NAMES.map((name, index) => {
    const rank = index + 1;
    const pin = (2000 + rank).toString();
    return {
      id: `p_w${rank}`,
      name,
      category: 'women' as const,
      rank,
      previousRank: rank,
      phone: 'ZTDSK Üyesi',
      password: pin,
      isExcused: false,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      ttfScore: 1500,
      joinedDate: '2026-10-05',
      avatarBg: AVATAR_COLORS[(index + 3) % AVATAR_COLORS.length],
    };
  }),
];

// No initial demo matches - Clean start, admin will enter all played matches manually!
export const INITIAL_MATCHES: Match[] = [];
