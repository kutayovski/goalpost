// lib/imageResolver.js
// Haber başlığı/özetinden kişi veya takım adı çıkarıp ALAKALI gerçek görsel bulur.
// - Kişi/menajer  -> TheSportsDB gerçek fotoğrafı (anahtarsız, ücretsiz)
// - Takım         -> football-data.org crest (logo)
// - Bulunamazsa   -> kategoriye uygun SABİT görsel (rastgele DEĞİL)

const SPORTSDB = "https://www.thesportsdb.com/api/v1/json/3";

// Başlıkta aranacak bilinen kişiler. Anahtar = metinde aranan kalıp (küçük harf),
// değer = TheSportsDB'de aranacak tam ad.
const KNOWN_PEOPLE = {
  // Menajerler
  "slot": "Arne Slot",
  "arteta": "Mikel Arteta",
  "guardiola": "Pep Guardiola",
  "ancelotti": "Carlo Ancelotti",
  "montella": "Vincenzo Montella",
  "iraola": "Andoni Iraola",
  "xabi alonso": "Xabi Alonso",
  "flick": "Hansi Flick",
  "inzaghi": "Simone Inzaghi",
  "conte": "Antonio Conte",
  "mourinho": "Jose Mourinho",
  "klopp": "Jurgen Klopp",
  "amorim": "Ruben Amorim",
  "tuchel": "Thomas Tuchel",
  // Yıldız oyuncular
  "mbappe": "Kylian Mbappe",
  "mbappé": "Kylian Mbappe",
  "haaland": "Erling Haaland",
  "vinicius": "Vinicius Junior",
  "bellingham": "Jude Bellingham",
  "rodri": "Rodri",
  "saka": "Bukayo Saka",
  "salah": "Mohamed Salah",
  "kane": "Harry Kane",
  "lewandowski": "Robert Lewandowski",
  "yamal": "Lamine Yamal",
  "pedri": "Pedri",
  "gavi": "Gavi",
  "musiala": "Jamal Musiala",
  "wirtz": "Florian Wirtz",
  "odegaard": "Martin Odegaard",
  "ødegaard": "Martin Odegaard",
  "foden": "Phil Foden",
  "palmer": "Cole Palmer",
  "griezmann": "Antoine Griezmann",
  "modric": "Luka Modric",
  "messi": "Lionel Messi",
  "ronaldo": "Cristiano Ronaldo",
  "neymar": "Neymar",
  "havertz": "Kai Havertz",
  "gabriel": "Gabriel Magalhaes",
  "hojlund": "Rasmus Hojlund",
  // Türk milli takım oyuncuları
  "arda guler": "Arda Guler",
  "arda güler": "Arda Guler",
  "calhanoglu": "Hakan Calhanoglu",
  "çalhanoğlu": "Hakan Calhanoglu",
  "kenan yildiz": "Kenan Yildiz",
  "kenan yıldız": "Kenan Yildiz",
  "kerem akturkoglu": "Kerem Akturkoglu",
  "ferdi kadioglu": "Ferdi Kadioglu",
  "orkun kokcu": "Orkun Kokcu",
  "ugurcan": "Ugurcan Cakir",
  // ── Çorum FK kadrosu ──────────────────────────────────────────────────────
  "ahmet ilhan": "Ahmet İlhan Özek",
  "özek": "Ahmet İlhan Özek",
  "arda hilmi": "Arda Hilmi Şengül",
  "şengül": "Arda Hilmi Şengül",
  "emir şener": "Emir Şener",
  "sefa yılmaz": "Sefa Yılmaz",
  "ali bıçakcı": "Ali Bıçakcı",
  "bıçakcı": "Ali Bıçakcı",
  "enis destan": "Enis Destan",
  "destan": "Enis Destan",
  "ajeti": "Ardian Ajeti",
  "ardian ajeti": "Ardian Ajeti",
  "musa araz": "Musa Araz",
  "umut güneş": "Umut Güneş",
  "taylan antalyalı": "Taylan Antalyalı",
  "antalyalı": "Taylan Antalyalı",
  "ali akman": "Ali Akman",
  "akman": "Ali Akman",
  "samet akaydın": "Samet Akaydın",
  "orhan": "Orhan Eskişehirli",
  // ── Çorum FK teknik ekip / yönetim ────────────────────────────────────────
  "savaş balçık": "Savaş Balçık",
  "balçık": "Savaş Balçık",
};

// Kategoriye uygun SABİT yedek görseller (images.unsplash.com — kalıcı, rastgele değil)
const FALLBACKS = {
  general: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80",
  transfer: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&q=80",
  magazine: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&q=80",
  worldcup: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&q=80",
  default: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
};

const _playerCache = new Map();

async function lookupPlayerPhoto(query) {
  if (_playerCache.has(query)) return _playerCache.get(query);
  try {
    const res = await fetch(
      `${SPORTSDB}/searchplayers.php?p=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    const p = data.player && data.player[0];
    const photo = p ? p.strThumb || p.strCutout || null : null;
    const result = photo
      ? { image: photo, credit: `${p.strPlayer} · TheSportsDB` }
      : null;
    _playerCache.set(query, result);
    return result;
  } catch (err) {
    _playerCache.set(query, null);
    return null;
  }
}

// Metinde bilinen bir kişi adı geçiyor mu?
function detectPerson(text) {
  const lower = text.toLowerCase();
  // En uzun anahtarı önce dene (ör. "arda guler" > "guler")
  const keys = Object.keys(KNOWN_PEOPLE).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (lower.includes(key)) return KNOWN_PEOPLE[key];
  }
  return null;
}

// Metinde takım adı geçiyor mu? teamCrestMap: { "arsenal": "https://crest..svg", ... }
function detectTeamCrest(text, teamCrestMap) {
  if (!teamCrestMap) return null;
  const lower = text.toLowerCase();
  const names = Object.keys(teamCrestMap).sort((a, b) => b.length - a.length);
  for (const name of names) {
    if (name.length >= 4 && lower.includes(name)) {
      return { image: teamCrestMap[name], credit: "football-data.org" };
    }
  }
  return null;
}

// Ana fonksiyon: başlık+özet -> { image, credit }
async function resolveImage(title, summary, { category = "general", teamCrestMap } = {}) {
  const text = `${title || ""} ${summary || ""}`;

  // 1) Kişi (en alakalı: gerçek oyuncu/menajer fotoğrafı)
  const person = detectPerson(text);
  if (person) {
    const photo = await lookupPlayerPhoto(person);
    if (photo) return photo;
  }

  // 2) Takım (logo/crest)
  const team = detectTeamCrest(text, teamCrestMap);
  if (team) return team;

  // 3) Kategoriye uygun sabit yedek
  return { image: FALLBACKS[category] || FALLBACKS.default, credit: "" };
}

module.exports = { resolveImage, lookupPlayerPhoto, KNOWN_PEOPLE };
