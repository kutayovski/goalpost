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

// Öne çıkan ülkeler için detay (FIFA sıralaması, geçmiş, yıldız, muhtemel kadro)
// Kadrolar 2026 için tahmini/aday isimlerdir; oyuncu fotoğrafları TheSportsDB'den çekilir.
export const COUNTRY_DETAILS = {
  "Türkiye": {
    fifaRank: 26, prevApps: 6, best: "3.lük (2002)", coach: "Vincenzo Montella",
    star: "Arda Güler",
    squad: ["Mert Günok", "Uğurcan Çakır", "Ferdi Kadıoğlu", "Merih Demiral", "Abdülkerim Bardakcı",
      "Kaan Ayhan", "Hakan Çalhanoğlu", "Orkun Kökçü", "İsmail Yüksek", "Arda Güler",
      "Kenan Yıldız", "Kerem Aktürkoğlu", "Barış Alper Yılmaz", "Yusuf Yazıcı", "Cenk Tosun"],
  },
  "Brezilya": {
    fifaRank: 5, prevApps: 22, best: "Şampiyon (5 kez)", coach: "Carlo Ancelotti",
    star: "Vinicius Junior",
    squad: ["Alisson", "Éder Militão", "Marquinhos", "Danilo", "Vinicius Junior",
      "Rodrygo", "Raphinha", "Bruno Guimarães", "Casemiro", "Endrick", "Neymar"],
  },
  "Arjantin": {
    fifaRank: 1, prevApps: 18, best: "Şampiyon (3 kez)", coach: "Lionel Scaloni",
    star: "Lionel Messi",
    squad: ["Emiliano Martínez", "Cristian Romero", "Lisandro Martínez", "Nicolás Otamendi",
      "Rodrigo De Paul", "Enzo Fernández", "Alexis Mac Allister", "Lionel Messi",
      "Julián Álvarez", "Lautaro Martínez", "Ángel Di María"],
  },
  "Fransa": {
    fifaRank: 2, prevApps: 16, best: "Şampiyon (2 kez)", coach: "Didier Deschamps",
    star: "Kylian Mbappé",
    squad: ["Mike Maignan", "Jules Koundé", "William Saliba", "Dayot Upamecano", "Theo Hernández",
      "Aurélien Tchouaméni", "Eduardo Camavinga", "Antoine Griezmann", "Kylian Mbappé",
      "Ousmane Dembélé", "Bradley Barcola"],
  },
  "İspanya": {
    fifaRank: 3, prevApps: 16, best: "Şampiyon (2010)", coach: "Luis de la Fuente",
    star: "Lamine Yamal",
    squad: ["Unai Simón", "Dani Carvajal", "Robin Le Normand", "Aymeric Laporte", "Marc Cucurella",
      "Rodri", "Pedri", "Fabián Ruiz", "Lamine Yamal", "Nico Williams", "Álvaro Morata"],
  },
  "İngiltere": {
    fifaRank: 4, prevApps: 16, best: "Şampiyon (1966)", coach: "Thomas Tuchel",
    star: "Jude Bellingham",
    squad: ["Jordan Pickford", "Kyle Walker", "John Stones", "Marc Guéhi", "Luke Shaw",
      "Declan Rice", "Jude Bellingham", "Bukayo Saka", "Phil Foden", "Cole Palmer", "Harry Kane"],
  },
  "Almanya": {
    fifaRank: 9, prevApps: 20, best: "Şampiyon (4 kez)", coach: "Julian Nagelsmann",
    star: "Jamal Musiala",
    squad: ["Marc-André ter Stegen", "Joshua Kimmich", "Antonio Rüdiger", "Jonathan Tah",
      "David Raum", "Toni Kroos", "İlkay Gündoğan", "Jamal Musiala", "Florian Wirtz",
      "Kai Havertz", "Niclas Füllkrug"],
  },
  "Portekiz": {
    fifaRank: 6, prevApps: 8, best: "Avrupa Şampiyonu (2016)", coach: "Roberto Martínez",
    star: "Cristiano Ronaldo",
    squad: ["Diogo Costa", "João Cancelo", "Rúben Dias", "Pepe", "Nuno Mendes",
      "João Palhinha", "Bruno Fernandes", "Bernardo Silva", "Rafael Leão",
      "Cristiano Ronaldo", "Gonçalo Ramos"],
  },
  "Hollanda": {
    fifaRank: 7, prevApps: 11, best: "Finalist (3 kez)", coach: "Ronald Koeman",
    star: "Virgil van Dijk",
    squad: ["Bart Verbruggen", "Denzel Dumfries", "Virgil van Dijk", "Nathan Aké", "Nathan Aké",
      "Frenkie de Jong", "Tijjani Reijnders", "Xavi Simons", "Cody Gakpo",
      "Memphis Depay", "Donyell Malen"],
  },
};

// Türkiye Milli Takımı — "Bizim Çocuklar" detaylı analiz
export const TURKEY = {
  iso: "tr",
  coach: "Vincenzo Montella",
  coachQuery: "Vincenzo Montella",
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
    { name: "Arda Güler", query: "Arda Guler", role: "10 numara · Real Madrid",
      note: "Takımın yaratıcı beyni. Sol ayağı ve duran toplarıyla fark yaratıyor." },
    { name: "Hakan Çalhanoğlu", query: "Hakan Calhanoglu", role: "Kaptan · Inter",
      note: "Orta sahanın patronu. Tecrübesi ve liderliğiyle takımı ayakta tutuyor." },
    { name: "Kenan Yıldız", query: "Kenan Yildiz", role: "Kanat · Juventus",
      note: "Genç yeteneğin yükselen yıldızı. Dripling ve bitiriciliğiyle dikkat çekiyor." },
    { name: "Kerem Aktürkoğlu", query: "Kerem Akturkoglu", role: "Kanat · Benfica",
      note: "Hız ve gol katkısıyla hücumun en keskin silahlarından." },
  ],
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
