// lib/worldCupData.js
// 2026 FIFA Dünya Kupası — statik veriler (FIFA, ESPN kamuya açık bilgiler)
// iso = flagcdn.com için ISO ülke kodu (https://flagcdn.com/w80/<iso>.png)

export const WC_INFO = {
  startDate: "2026-06-11",
  endDate: "2026-07-19",
  hosts: ["ABD", "Kanada", "Meksika"],
  totalTeams: 48,
  totalMatches: 104,
  openingMatch: "Meksika vs. Güney Afrika",
  openingVenue: "Estadio Azteca, Mexico City",
  finalVenue: "MetLife Stadium, New Jersey",
};

export const WC_GROUPS = [
  { name: "Grup A", teams: [
    { name: "Meksika", iso: "mx", host: true },
    { name: "Güney Afrika", iso: "za" },
    { name: "Güney Kore", iso: "kr" },
    { name: "Çekya", iso: "cz" },
  ]},
  { name: "Grup B", teams: [
    { name: "Kanada", iso: "ca", host: true },
    { name: "Bosna-Hersek", iso: "ba" },
    { name: "Katar", iso: "qa" },
    { name: "İsviçre", iso: "ch" },
  ]},
  { name: "Grup C", teams: [
    { name: "Brezilya", iso: "br", star: true },
    { name: "Fas", iso: "ma" },
    { name: "Haiti", iso: "ht" },
    { name: "İskoçya", iso: "gb-sct" },
  ]},
  { name: "Grup D", teams: [
    { name: "ABD", iso: "us", host: true },
    { name: "Paraguay", iso: "py" },
    { name: "Avustralya", iso: "au" },
    { name: "Türkiye", iso: "tr", highlight: true },
  ]},
  { name: "Grup E", teams: [
    { name: "Almanya", iso: "de", star: true },
    { name: "Curaçao", iso: "cw" },
    { name: "Fildişi Sahili", iso: "ci" },
    { name: "Ekvador", iso: "ec" },
  ]},
  { name: "Grup F", teams: [
    { name: "Hollanda", iso: "nl", star: true },
    { name: "Japonya", iso: "jp" },
    { name: "İsveç", iso: "se" },
    { name: "Tunus", iso: "tn" },
  ]},
  { name: "Grup G", teams: [
    { name: "Belçika", iso: "be" },
    { name: "Mısır", iso: "eg" },
    { name: "İran", iso: "ir" },
    { name: "Yeni Zelanda", iso: "nz" },
  ]},
  { name: "Grup H", teams: [
    { name: "İspanya", iso: "es", star: true },
    { name: "Yeşil Burun", iso: "cv" },
    { name: "Suudi Arabistan", iso: "sa" },
    { name: "Uruguay", iso: "uy" },
  ]},
  { name: "Grup I", teams: [
    { name: "Fransa", iso: "fr", star: true },
    { name: "Senegal", iso: "sn" },
    { name: "Irak", iso: "iq" },
    { name: "Norveç", iso: "no" },
  ]},
  { name: "Grup J", teams: [
    { name: "Arjantin", iso: "ar", star: true },
    { name: "Cezayir", iso: "dz" },
    { name: "Avusturya", iso: "at" },
    { name: "Ürdün", iso: "jo" },
  ]},
  { name: "Grup K", teams: [
    { name: "Portekiz", iso: "pt", star: true },
    { name: "Kongo DR", iso: "cd" },
    { name: "Özbekistan", iso: "uz" },
    { name: "Kolombiya", iso: "co" },
  ]},
  { name: "Grup L", teams: [
    { name: "İngiltere", iso: "gb-eng", star: true },
    { name: "Hırvatistan", iso: "hr" },
    { name: "Gana", iso: "gh" },
    { name: "Panama", iso: "pa" },
  ]},
];

// Öne çıkan ülkeler için detay. squad = ilk 11 (diziliş sırasıyla: GK, DEF, MID, FWD),
// formation = taktik diziliş, stars = fotoğraflı yıldızlar (query = Wikipedia başlığı),
// recent = son maç sonuçları. Oyuncu fotoğrafları Wikipedia'dan canlı çekilir.
export const COUNTRY_DETAILS = {
  "Türkiye": {
    fifaRank: 26, prevApps: 6, best: "3.lük (2002)", coach: "Vincenzo Montella",
    formation: "4-2-3-1",
    squad: ["Mert Günok", "Zeki Çelik", "Merih Demiral", "Abdülkerim Bardakcı", "Ferdi Kadıoğlu",
      "Hakan Çalhanoğlu", "İsmail Yüksek", "Arda Güler", "Kenan Yıldız", "Kerem Aktürkoğlu", "Barış Alper Yılmaz"],
    stars: [
      { name: "Arda Güler", query: "Arda Güler", role: "Real Madrid" },
      { name: "Hakan Çalhanoğlu", query: "Hakan Çalhanoğlu", role: "Inter" },
      { name: "Kenan Yıldız", query: "Kenan Yıldız", role: "Juventus" },
    ],
    recent: ["TUR 3-1 İZL", "GAL 0-0 TUR", "TUR 2-2 ÇEK", "TUR 6-1 BUL"],
  },
  "Brezilya": {
    fifaRank: 5, prevApps: 22, best: "Şampiyon (5 kez)", coach: "Carlo Ancelotti",
    formation: "4-3-3",
    squad: ["Alisson", "Danilo", "Marquinhos", "Éder Militão", "Wendell",
      "Bruno Guimarães", "Casemiro", "Raphinha", "Rodrygo", "Vinicius Junior", "Endrick"],
    stars: [
      { name: "Vinicius Jr.", query: "Vinícius Júnior", role: "Real Madrid" },
      { name: "Rodrygo", query: "Rodrygo", role: "Real Madrid" },
      { name: "Raphinha", query: "Raphinha", role: "Barcelona" },
    ],
    recent: ["BRE 4-1 ŞİL", "PER 0-2 BRE", "BRE 1-0 URU", "ARJ 1-0 BRE"],
  },
  "Arjantin": {
    fifaRank: 1, prevApps: 18, best: "Şampiyon (3 kez)", coach: "Lionel Scaloni",
    formation: "4-4-2",
    squad: ["Emiliano Martínez", "Nahuel Molina", "Cristian Romero", "Lisandro Martínez", "Nicolás Tagliafico",
      "Rodrigo De Paul", "Enzo Fernández", "Alexis Mac Allister", "Ángel Di María", "Lionel Messi", "Julián Álvarez"],
    stars: [
      { name: "Lionel Messi", query: "Lionel Messi", role: "Inter Miami" },
      { name: "Julián Álvarez", query: "Julián Álvarez", role: "Atlético Madrid" },
      { name: "Enzo Fernández", query: "Enzo Fernández", role: "Chelsea" },
    ],
    recent: ["ARJ 1-0 BRE", "ARJ 3-0 BOL", "ŞİL 0-0 ARJ", "ARJ 6-0 PER"],
  },
  "Fransa": {
    fifaRank: 2, prevApps: 16, best: "Şampiyon (2 kez)", coach: "Didier Deschamps",
    formation: "4-3-3",
    squad: ["Mike Maignan", "Jules Koundé", "Dayot Upamecano", "William Saliba", "Theo Hernández",
      "Aurélien Tchouaméni", "Eduardo Camavinga", "Antoine Griezmann", "Ousmane Dembélé", "Kylian Mbappé", "Bradley Barcola"],
    stars: [
      { name: "Kylian Mbappé", query: "Kylian Mbappé", role: "Real Madrid" },
      { name: "Ousmane Dembélé", query: "Ousmane Dembélé", role: "PSG" },
      { name: "Aurélien Tchouaméni", query: "Aurélien Tchouaméni", role: "Real Madrid" },
    ],
    recent: ["FRA 3-1 İTA", "BEL 1-2 FRA", "FRA 4-1 İSR", "FRA 2-0 İZL"],
  },
  "İspanya": {
    fifaRank: 3, prevApps: 16, best: "Şampiyon (2010)", coach: "Luis de la Fuente",
    formation: "4-3-3",
    squad: ["Unai Simón", "Dani Carvajal", "Robin Le Normand", "Aymeric Laporte", "Marc Cucurella",
      "Rodri", "Fabián Ruiz", "Pedri", "Lamine Yamal", "Álvaro Morata", "Nico Williams"],
    stars: [
      { name: "Lamine Yamal", query: "Lamine Yamal", role: "Barcelona" },
      { name: "Rodri", query: "Rodri (footballer, born 1996)", role: "Manchester City" },
      { name: "Pedri", query: "Pedri", role: "Barcelona" },
    ],
    recent: ["İSP 2-1 İNG", "İSP 5-1 FRA", "İSP 4-0 GÜR", "HOL 1-2 İSP"],
  },
  "İngiltere": {
    fifaRank: 4, prevApps: 16, best: "Şampiyon (1966)", coach: "Thomas Tuchel",
    formation: "4-2-3-1",
    squad: ["Jordan Pickford", "Kyle Walker", "John Stones", "Marc Guéhi", "Luke Shaw",
      "Declan Rice", "Jude Bellingham", "Bukayo Saka", "Cole Palmer", "Phil Foden", "Harry Kane"],
    stars: [
      { name: "Jude Bellingham", query: "Jude Bellingham", role: "Real Madrid" },
      { name: "Harry Kane", query: "Harry Kane", role: "Bayern Münih" },
      { name: "Bukayo Saka", query: "Bukayo Saka", role: "Arsenal" },
    ],
    recent: ["İNG 2-0 FİN", "İNG 3-1 İRL", "İSP 2-1 İNG", "İNG 5-0 SIR"],
  },
  "Almanya": {
    fifaRank: 9, prevApps: 20, best: "Şampiyon (4 kez)", coach: "Julian Nagelsmann",
    formation: "4-2-3-1",
    squad: ["Marc-André ter Stegen", "Joshua Kimmich", "Antonio Rüdiger", "Jonathan Tah", "David Raum",
      "Robert Andrich", "Aleksandar Pavlović", "Jamal Musiala", "Florian Wirtz", "Kai Havertz", "Niclas Füllkrug"],
    stars: [
      { name: "Jamal Musiala", query: "Jamal Musiala", role: "Bayern Münih" },
      { name: "Florian Wirtz", query: "Florian Wirtz", role: "Bayer Leverkusen" },
      { name: "Kai Havertz", query: "Kai Havertz", role: "Arsenal" },
    ],
    recent: ["ALM 1-0 HOL", "MAC 0-2 ALM", "ALM 7-0 BOS", "ALM 1-1 İTA"],
  },
  "Portekiz": {
    fifaRank: 6, prevApps: 8, best: "Avrupa Şampiyonu (2016)", coach: "Roberto Martínez",
    formation: "4-3-3",
    squad: ["Diogo Costa", "João Cancelo", "Rúben Dias", "Pepe", "Nuno Mendes",
      "João Palhinha", "Vitinha", "Bruno Fernandes", "Bernardo Silva", "Cristiano Ronaldo", "Rafael Leão"],
    stars: [
      { name: "Cristiano Ronaldo", query: "Cristiano Ronaldo", role: "Al Nassr" },
      { name: "Bruno Fernandes", query: "Bruno Fernandes", role: "Manchester United" },
      { name: "Rafael Leão", query: "Rafael Leão", role: "Milan" },
    ],
    recent: ["POR 2-1 İSP", "POL 1-3 POR", "POR 5-0 HIR", "POR 2-0 İSK"],
  },
  "Hollanda": {
    fifaRank: 7, prevApps: 11, best: "Finalist (3 kez)", coach: "Ronald Koeman",
    formation: "4-3-3",
    squad: ["Bart Verbruggen", "Denzel Dumfries", "Virgil van Dijk", "Stefan de Vrij", "Nathan Aké",
      "Frenkie de Jong", "Tijjani Reijnders", "Xavi Simons", "Cody Gakpo", "Memphis Depay", "Donyell Malen"],
    stars: [
      { name: "Virgil van Dijk", query: "Virgil van Dijk", role: "Liverpool" },
      { name: "Frenkie de Jong", query: "Frenkie de Jong", role: "Barcelona" },
      { name: "Cody Gakpo", query: "Cody Gakpo", role: "Liverpool" },
    ],
    recent: ["HOL 2-2 ALM", "HOL 4-0 MAC", "HOL 1-2 İSP", "BOS 1-2 HOL"],
  },
};

// Türkiye Milli Takımı — "Bizim Çocuklar" detaylı analiz
export const TURKEY = {
  iso: "tr",
  coach: "Vincenzo Montella",
  coachQuery: "Vincenzo Montella",
  formation: "4-2-3-1",
  fifaRank: 26,
  group: "Grup D",
  groupRivals: ["ABD 🇺🇸", "Paraguay 🇵🇾", "Avustralya 🇦🇺"],
  best: "3.lük — 2002 Dünya Kupası",
  apps: 6,
  intro:
    "A Milli Takımımız, 2002'deki tarihi 3.lükten sonra 24 yıl aradan sonra ilk kez bir Dünya Kupası'nda. " +
    "Montella yönetiminde genç ve yetenekli bir nesil sahaya çıkıyor. EURO 2024'teki çeyrek final " +
    "performansının ardından beklentiler yüksek.",
  fixtures: [
    { date: "15 Haziran 2026", opp: "Paraguay 🇵🇾", venue: "Levi's Stadium, San Francisco" },
    { date: "20 Haziran 2026", opp: "Avustralya 🇦🇺", venue: "NRG Stadium, Houston" },
    { date: "25 Haziran 2026", opp: "ABD 🇺🇸", venue: "Mercedes-Benz Stadium, Atlanta" },
  ],
  stars: [
    { name: "Arda Güler", query: "Arda Güler", role: "10 numara · Real Madrid",
      note: "Takımın yaratıcı beyni. Sol ayağı ve duran toplarıyla fark yaratıyor." },
    { name: "Hakan Çalhanoğlu", query: "Hakan Çalhanoğlu", role: "Kaptan · Inter",
      note: "Orta sahanın patronu. Tecrübesi ve liderliğiyle takımı ayakta tutuyor." },
    { name: "Kenan Yıldız", query: "Kenan Yıldız", role: "Kanat · Juventus",
      note: "Genç yeteneğin yükselen yıldızı. Dripling ve bitiriciliğiyle dikkat çekiyor." },
    { name: "Kerem Aktürkoğlu", query: "Kerem Aktürkoğlu", role: "Kanat · Benfica",
      note: "Hız ve gol katkısıyla hücumun en keskin silahlarından." },
  ],
  recent: ["TUR 3-1 İZL", "GAL 0-0 TUR", "TUR 2-2 ÇEK", "TUR 6-1 BUL", "TUR 0-3 POR"],
  swot: {
    strengths: ["Genç ve teknik orta saha", "Çalhanoğlu'nun liderliği", "Yüksek moral (EURO 2024 çeyrek final)"],
    weaknesses: ["Santrfor istikrarı", "Savunma tecrübesi", "Büyük turnuva baskısı"],
  },
  squad: {
    "Kaleciler": ["Mert Günok", "Uğurcan Çakır", "Altay Bayındır"],
    "Defans": ["Ferdi Kadıoğlu", "Merih Demiral", "Abdülkerim Bardakcı", "Kaan Ayhan", "Zeki Çelik", "Samet Akaydin"],
    "Orta Saha": ["Hakan Çalhanoğlu", "Orkun Kökçü", "İsmail Yüksek", "Arda Güler", "Yusuf Yazıcı", "Salih Özcan"],
    "Forvet": ["Kenan Yıldız", "Kerem Aktürkoğlu", "Barış Alper Yılmaz", "Cenk Tosun", "İrfan Can Kahveci"],
  },
};

export const WC_KEY_MATCHES = [
  { date: "11 Haziran 2026", home: "Meksika 🇲🇽", away: "Güney Afrika 🇿🇦", venue: "Estadio Azteca", note: "Açılış Maçı" },
  { date: "12 Haziran 2026", home: "ABD 🇺🇸", away: "Paraguay 🇵🇾", venue: "SoFi Stadium, LA", note: "Ev sahibi açılışı" },
  { date: "13 Haziran 2026", home: "Brezilya 🇧🇷", away: "Fas 🇲🇦", venue: "MetLife Stadium", note: "Dev maç" },
  { date: "15 Haziran 2026", home: "Türkiye 🇹🇷", away: "Paraguay 🇵🇾", venue: "San Francisco", note: "Türkiye ilk maçı" },
  { date: "16 Haziran 2026", home: "Arjantin 🇦🇷", away: "Cezayir 🇩🇿", venue: "Dallas", note: "Savunma başlıyor" },
  { date: "17 Haziran 2026", home: "Fransa 🇫🇷", away: "Senegal 🇸🇳", venue: "Boston", note: "Les Bleus açılışı" },
  { date: "19 Temmuz 2026", home: "?", away: "?", venue: "MetLife Stadium, NJ", note: "🏆 FİNAL" },
];
