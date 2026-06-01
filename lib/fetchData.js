// lib/fetchData.js
// Her gün GitHub Actions ile otomatik çalışır. TAMAMEN ÜCRETSİZ kaynaklar:
//   - football-data.org (ücretsiz anahtar) -> fikstür/sonuç + Dünya Kupası + takım formu
//   - Uluslararası futbol RSS (BBC, Sky, Guardian, ESPN)
//   - Türkçe futbol RSS (Fotomaç, Milliyet, Hürriyet, Sabah)
//   - lib/analysis.js ile ücretsiz istatistiksel maç tahmini
// Haber içeriği: RSS'in kendi content/contentEncoded alanından alınır.
// Görseller: og:image ile HD scrape (sadece resim için, bot engeline takılmaz).

const fs = require("fs");
const path = require("path");
try { require("dotenv").config({ path: ".env.local" }); } catch (e) {}
const { translate, cleanText } = require("./translate");
const { calculateWinProbability, generateTextAnalysis, getFavorite,
  calculateWinProbabilityByRank, generateRankAnalysis } = require("./analysis");

// ─── RSS Feed'leri — genel futbol ────────────────────────────────────────────
const RSS_FEEDS = [
  // === TÜRK KAYNAKLARI ===
  { url: "https://www.fotomac.com.tr/rss/anasayfa.xml",     source: "Fotomaç",     flag: "🇹🇷", lang: "tr", cat: "tr" },
  { url: "https://www.milliyet.com.tr/rss/rssNew/skorerSporRss.xml", source: "Milliyet", flag: "🇹🇷", lang: "tr", cat: "tr" },
  { url: "https://www.hurriyet.com.tr/rss/spor",            source: "Hürriyet",    flag: "🇹🇷", lang: "tr", cat: "tr" },
  { url: "https://www.sabah.com.tr/rss/spor.xml",           source: "Sabah Spor",  flag: "🇹🇷", lang: "tr", cat: "tr" },
  // === YABANCI KAYNAKLAR ===
  { url: "https://feeds.bbci.co.uk/sport/football/rss.xml", source: "BBC Sport",   flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", lang: "en", cat: "en" },
  { url: "https://www.skysports.com/rss/12040",             source: "Sky Sports",  flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", lang: "en", cat: "en" },
  { url: "https://www.theguardian.com/football/rss",        source: "The Guardian",flag: "🗞️",  lang: "en", cat: "en" },
  { url: "https://www.espn.com/espn/rss/soccer/news",       source: "ESPN FC",     flag: "⚽",  lang: "en", cat: "en" },
];

// ─── Çorum FK — Google News RSS (ÜCRETSİZ, kapsamlı) ─────────────────────────
// Her türden Çorum FK haberi: resmi açıklamalar, transfer dedikoduları, maç haberleri
const CORUM_NEWS_FEEDS = [
  {
    url: "https://news.google.com/rss/search?q=%C3%87orum+FK&hl=tr&gl=TR&ceid=TR:tr",
    label: "Çorum FK — Genel", limit: 30,
  },
  {
    url: "https://news.google.com/rss/search?q=%C3%87orum+FK+transfer+dedikodu&hl=tr&gl=TR&ceid=TR:tr",
    label: "Çorum FK — Transfer", limit: 20,
  },
  {
    url: "https://news.google.com/rss/search?q=%C3%87orum+FK+kadro+oyuncu&hl=tr&gl=TR&ceid=TR:tr",
    label: "Çorum FK — Kadro", limit: 15,
  },
  {
    url: "https://news.google.com/rss/search?q=Corumspor+S%C3%BCper+Lig+2026&hl=tr&gl=TR&ceid=TR:tr",
    label: "Çorum FK — Süper Lig", limit: 15,
  },
];

// Google News başlığından kaynağı çıkar ("Haber başlığı - Kaynak" formatı)
function parseGoogleNewsTitle(title) {
  const m = title.match(/^(.*?)\s*[-–—]\s*([^-–—]{2,40})\s*$/);
  if (m) return { cleanTitle: m[1].trim(), source: m[2].trim() };
  return { cleanTitle: title, source: "Google News" };
}

// Google News görselini çekmeye çalış (article'ın önizleme resmi)
async function fetchCorumImage(googleUrl, title) {
  try {
    const html = await fetch(googleUrl, {
      headers: { "User-Agent": "Twitterbot/1.0" },
      signal: AbortSignal.timeout(6000),
    }).then(r => r.text());
    const og = html.match(/property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
               html.match(/content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (og && og[1] && !og[1].includes("google")) return og[1];
  } catch (e) {}
  // Çorum FK themed fallback (kulübün renkleri: kırmızı-siyah)
  return null;
}

async function fetchCorumFKNews() {
  const Parser = require("rss-parser");
  const parser = new Parser({ timeout: 20000 });
  const seen = new Set();
  const all = [];

  for (const feed of CORUM_NEWS_FEEDS) {
    try {
      const r = await parser.parseURL(feed.url);
      for (const item of r.items.slice(0, feed.limit)) {
        const { cleanTitle, source } = parseGoogleNewsTitle(item.title || "");
        const key = cleanTitle.slice(0, 50).toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        const summary = (item.contentSnippet || item.content || "").replace(/\s+/g, " ").trim().slice(0, 500);
        const link    = item.link || "";

        all.push({
          title:     cleanTitle,
          summary,
          link,
          date:      item.pubDate || item.isoDate || new Date().toISOString(),
          source,
          flag:      "🔴⚫",
          lang:      "tr",
          category:  "corumsporhaber",
          feedImage: null,  // Google News doesn't give direct images in RSS
        });
      }
      await sleep(400);
    } catch (e) {
      console.warn(`Çorum RSS başarısız (${feed.label}):`, e.message);
    }
  }

  // Tarihe göre sırala, en yeni önde
  all.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Görselleri toplu çek (ilk 20 için)
  console.log(`  Çorum FK: ${all.length} haber bulundu, görseller çekiliyor...`);
  for (let i = 0; i < Math.min(all.length, 20); i++) {
    const img = await fetchCorumImage(all[i].link, all[i].title);
    if (img) all[i].feedImage = img;
    await sleep(150);
  }

  return all;
}

// ─── Futbol filtresi ────────────────────────────────────────────────────────
const FOOTBALL_TERMS = [
  "futbol","football","soccer","gol","goal","maç","match","lig","league",
  "transfer","şampiyon","champion","kupa","cup","teknik direktör","coach","manager",
  "penaltı","penalty","forvet","kaleci","milli tak","national team",
  "premier","la liga","bundesliga","serie a","ligue 1","uefa","fifa",
  "dünya kupası","world cup","derbi","derby","süper lig","superlig",
  "çorum","fenerbahçe","galatasaray","beşiktaş","trabzonspor",
  "real madrid","barcelona","arsenal","chelsea","liverpool","manchester","bayern",
  "juventus","inter","milan","psg","atletico",
];

const BLOCK_TERMS = [
  "savaş","war","trump","putin","seçim","election","deprem","earthquake",
  "borsa","dolar","enflasyon","cinayet","mahkeme","hava durumu",
  "korona","covid","rugby","cricket","nba","basketbol","tenis","tennis",
  "formula","f1","voleybol","boks","ufc","mma",
  // Kadın futbolunu çıkar (erkek futboluna odaklan)
  "women's","women super league","wsl","nwsl","women's football",
  "lionesses","london city lionesses","barcelona femeni",
  "kadın milli","kadin milli","womens football",
];

function isFootball(text) {
  const t = text.toLowerCase();
  if (BLOCK_TERMS.some(b => t.includes(b))) return false;
  return FOOTBALL_TERMS.some(f => t.includes(f));
}

// Özel kategoriler
const CORUM_KW    = ["çorum","corum fk","corumspor","çorumspor","çorum fk"];
const MILLI_KW    = ["milli tak","a milli","türkiye milli","montella","national team turkey"];
const SUPERLIG_KW = ["süper lig","superlig","tff","trendyol süper","3. lig","tff 1","tff 2","süperlig"];
const TRANSFER_KW = ["transfer","sign","deal","loan","bid","imza","bonservis","anlaş","sözleşme","kiralık","anlaştı"];
const WC_KW       = ["world cup","dünya kupası","fifa 2026","wc 2026"];
const MAGAZINE_KW = ["record","viral","legend","rekor","efsane","wonder","iconic","historic"];

function detectCategory(text) {
  const t = text.toLowerCase();
  if (CORUM_KW.some(k => t.includes(k)))    return "corumsporhaber";
  if (MILLI_KW.some(k => t.includes(k)))    return "milli";
  if (WC_KW.some(k => t.includes(k)))       return "worldcup";
  if (SUPERLIG_KW.some(k => t.includes(k))) return "superlig";
  if (TRANSFER_KW.some(k => t.includes(k))) return "transfer";
  if (MAGAZINE_KW.some(k => t.includes(k))) return "magazine";
  return "general";
}

// ─── football-data.org ──────────────────────────────────────────────────────
const FOOTBALL_API_KEY = process.env.FOOTBALL_DATA_API_KEY || "";
const FOOTBALL_API_BASE = "https://api.football-data.org/v4";
const AUTH = { headers: { "X-Auth-Token": FOOTBALL_API_KEY } };
const LEAGUE_IDS = {
  PL:  { name: "Premier League",     flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  PD:  { name: "La Liga",            flag: "🇪🇸" },
  BL1: { name: "Bundesliga",         flag: "🇩🇪" },
  SA:  { name: "Serie A",            flag: "🇮🇹" },
  FL1: { name: "Ligue 1",            flag: "🇫🇷" },
  CL:  { name: "Şampiyonlar Ligi",   flag: "🏆" },
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

function loadExisting() {
  try {
    const p = path.join(__dirname, "../public/data/football.json");
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch (e) {}
  return null;
}

// Çorum FK rozeti (Wikipedia'dan doğrulandı)
const CORUM_BADGE = "https://upload.wikimedia.org/wikipedia/tr/3/37/%C3%87orum_FK.png";

// Google News generic placeholder tespiti — bunlar gerçek haber görseli değil
function isGenericPlaceholder(url) {
  if (!url) return true;
  return (
    url.includes("lh3.googleusercontent.com") ||
    url.includes("news.google.com") ||
    url.includes("placeholder") ||
    url.includes("default")
  );
}

// Wikipedia'dan kişi/takım fotoğrafı çek (ücretsiz, CORS açık)
async function fetchWikiImage(query) {
  try {
    const res = await fetch(
      `https://tr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
      { headers: { "User-Agent": "GoalpostBot/1.0" }, signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.type === "disambiguation") return null;
    return data.thumbnail?.source || data.originalimage?.source || null;
  } catch (e) { return null; }
}

// Haber başlığından Çorum FK'ya özgü kişiyi bul ve fotoğrafını çek
// Çorum FK oyuncuları — Wiki + TheSportsDB arama terimleri
const CORUM_PEOPLE = [
  // { keys: başlıkta aranacak, wiki: TR Wikipedia, sdb: TheSportsDB arama }
  { keys: ["ajeti","ardian"], wiki: null, sdb: "Ajeti" },
  { keys: ["ali akman","akman"], wiki: "Ali Akman", sdb: "Ali Akman" },
  { keys: ["taylan antalyalı","antalyalı"], wiki: "Taylan Antalyalı", sdb: "Taylan Antalyali" },
  { keys: ["arda hilmi","şengül"], wiki: "Arda Hilmi Şengül", sdb: "Arda Sengul" },
  { keys: ["ahmet ilhan","özek"], wiki: "Ahmet İlhan Özek", sdb: "Ahmet Ozek" },
  { keys: ["savaş balçık","balçık"], wiki: null, sdb: null },
  { keys: ["ali bıçakcı","bıçakcı"], wiki: "Ali Bıçakcı", sdb: "Ali Bicakci" },
  { keys: ["enis destan","destan"], wiki: "Enis Destan", sdb: "Enis Destan" },
  { keys: ["musa araz"], wiki: null, sdb: "Musa Araz" },
  { keys: ["sefa yılmaz"], wiki: "Sefa Yılmaz", sdb: "Sefa Yilmaz" },
  { keys: ["emir şener"], wiki: null, sdb: "Emir Sener" },
];

// TheSportsDB'den oyuncu fotoğrafı (anahtarsız, ücretsiz)
async function fetchSportsDBImage(query) {
  if (!query) return null;
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(query)}`,
      { signal: AbortSignal.timeout(6000) }
    );
    const data = await res.json();
    const p = data.player && data.player[0];
    return p ? (p.strCutout || p.strThumb || null) : null;
  } catch (e) { return null; }
}

const _corumImgCache = new Map();
async function resolveCorumImage(title) {
  const t = title.toLowerCase();
  for (const p of CORUM_PEOPLE) {
    if (p.keys.some(k => t.includes(k))) {
      const cacheKey = p.sdb || p.wiki || p.keys[0];
      if (_corumImgCache.has(cacheKey)) return _corumImgCache.get(cacheKey);

      let img = null;
      // Önce TheSportsDB dene (daha güncel fotoğraflar)
      if (p.sdb) img = await fetchSportsDBImage(p.sdb);
      // Yoksa Wikipedia dene
      if (!img && p.wiki) img = await fetchWikiImage(p.wiki);

      _corumImgCache.set(cacheKey, img);
      return img;
    }
  }
  return null;
}

// ─── OG Image scrape (SADECE resim için — bot engeli yoktur) ─────────────────
async function fetchOgImage(url) {
  if (!url) return null;
  try {
    const html = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Twitterbot/1.0)" },
      signal: AbortSignal.timeout(8000),
    }).then(r => r.text());
    const re1 = /property=["']og:image["'][^>]+content=["']([^"']+)["']/i;
    const re2 = /content=["']([^"']+)["'][^>]+property=["']og:image["']/i;
    const m = html.match(re1) || html.match(re2);
    return m ? m[1] : null;
  } catch (e) { return null; }
}

// ─── RSS: içerik mümkün olan en temiz formdan çıkar ─────────────────────────
function extractContent(item, lang) {
  // contentSnippet = RSS parser tarafından zaten temizlenmiş özet (HER ZAMAN TEMİZ)
  // Türkçe kaynaklar için contentEncoded > content > snippet
  // Yabancı kaynaklar (BBC vb.) için SADECE contentSnippet — content alanı navigasyon içeriyor

  const snippet = (item.contentSnippet || "").replace(/\s+/g, " ").trim();

  if (lang === "tr") {
    // Türkçe kaynaklar: önce encoded content dene
    const enc = item["content:encoded"] || item.contentEncoded || "";
    const cleaned = cleanText(enc);
    if (cleaned.length > snippet.length + 50 && cleaned.length < 3000) return cleaned;
  }

  // Yabancı kaynaklar: sadece snippet (temiz, kısa ama doğru)
  return snippet;
}

// ─── RSS çek ────────────────────────────────────────────────────────────────
async function fetchRSS(feed) {
  try {
    const Parser = require("rss-parser");
    const parser = new Parser({
      customFields: {
        item: [
          ["media:content", "mediaContent", { keepArray: true }],
          ["content:encoded", "contentEncoded"],
          ["enclosure", "enc"],
        ]
      },
      timeout: 15000,
    });
    const result = await parser.parseURL(feed.url);
    return result.items.slice(0, 14).map(item => ({
      title:     (item.title || "").replace(/\s+/g, " ").trim(),
      summary:   extractContent(item, feed.lang).slice(0, 1800),
      link:      item.link || "",
      date:      item.pubDate || item.isoDate || "",
      source:    feed.source,
      flag:      feed.flag,
      lang:      feed.lang,
      cat:       feed.cat,
      feedImage: (item.enc && item.enc.url) ||
                 (item.mediaContent && item.mediaContent[0] && item.mediaContent[0].$ && item.mediaContent[0].$.url) || null,
    }));
  } catch (err) {
    console.warn(`RSS başarısız ${feed.source}:`, err.message);
    return [];
  }
}

// ─── Maç eşleme ─────────────────────────────────────────────────────────────
function mapMatch(m, leagueCode, timeframe) {
  const ft = m.score?.fullTime || {};
  const ht = m.score?.halfTime || {};
  const finished = m.status === "FINISHED";
  const live = m.status === "IN_PLAY" || m.status === "PAUSED";
  return {
    id: m.id,
    homeId: m.homeTeam?.id || null,
    awayId: m.awayTeam?.id || null,
    home:      m.homeTeam?.shortName || m.homeTeam?.name || "?",
    away:      m.awayTeam?.shortName || m.awayTeam?.name || "?",
    homeCrest: m.homeTeam?.crest || null,
    awayCrest: m.awayTeam?.crest || null,
    date:      m.utcDate,
    status:    m.status,
    timeframe,
    score:     finished ? `${ft.home}-${ft.away}` : live ? `${ft.home ?? 0}-${ft.away ?? 0}` : null,
    halfTime:  (ht.home != null && ht.away != null) ? `${ht.home}-${ht.away}` : null,
    fullHome: ft.home, fullAway: ft.away,
    halfHome: ht.home, halfAway: ht.away,
    winner:   m.score?.winner || null,
    venue:    m.venue || null,
    referee:  (m.referees && m.referees[0] && m.referees[0].name) || null,
    stage:    m.stage || null,
    group:    m.group || null,
    matchday: m.matchday || null,
    league:   leagueCode,
    leagueName: LEAGUE_IDS[leagueCode]?.name || (leagueCode === "WC" ? "Dünya Kupası" : leagueCode),
    leagueFlag: LEAGUE_IDS[leagueCode]?.flag || "🌍",
  };
}

async function fetchLeagueMatches(leagueCode) {
  if (!FOOTBALL_API_KEY) return [];
  try {
    const today = new Date();
    const from = new Date(today.getTime() - 14 * 86400000).toISOString().split("T")[0];
    const to   = new Date(today.getTime() + 21 * 86400000).toISOString().split("T")[0];
    const res  = await fetch(`${FOOTBALL_API_BASE}/competitions/${leagueCode}/matches?dateFrom=${from}&dateTo=${to}`, AUTH);
    const data = res.ok ? await res.json() : { matches: [] };
    let matches = data.matches || [];
    if (matches.length === 0) {
      await sleep(6500);
      const r2   = await fetch(`${FOOTBALL_API_BASE}/competitions/${leagueCode}/matches`, AUTH);
      const d2   = r2.ok ? await r2.json() : { matches: [] };
      matches = (d2.matches || []).filter(m => m.status === "FINISHED").slice(-8);
    }
    return matches.map(m => {
      const tf = m.status === "FINISHED" ? "past" :
                (m.status === "IN_PLAY" || m.status === "PAUSED") ? "live" : "upcoming";
      return mapMatch(m, leagueCode, tf);
    });
  } catch (err) {
    console.warn(`Maç çekme başarısız ${leagueCode}:`, err.message);
    return [];
  }
}

async function fetchWorldCup() {
  if (!FOOTBALL_API_KEY) return { teams: [], matches: [] };
  try {
    const tRes = await fetch(`${FOOTBALL_API_BASE}/competitions/WC/teams`, AUTH);
    const tData = tRes.ok ? await tRes.json() : { teams: [] };
    const teams = (tData.teams || []).map(t => ({ id: t.id, name: t.name, tla: t.tla, crest: t.crest || null }));
    await sleep(6500);
    const mRes = await fetch(`${FOOTBALL_API_BASE}/competitions/WC/matches`, AUTH);
    const mData = mRes.ok ? await mRes.json() : { matches: [] };
    const matches = (mData.matches || []).map(m =>
      mapMatch(m, "WC", m.status === "FINISHED" ? "past" : "upcoming"));
    return { teams, matches };
  } catch (err) {
    console.warn("WC çekme başarısız:", err.message);
    return { teams: [], matches: [] };
  }
}

// ─── Takım formu ─────────────────────────────────────────────────────────────
const _teamFormCache = new Map();
async function fetchTeamForm(teamId) {
  if (!teamId || !FOOTBALL_API_KEY) return null;
  if (_teamFormCache.has(teamId)) return _teamFormCache.get(teamId);
  try {
    const res = await fetch(`${FOOTBALL_API_BASE}/teams/${teamId}/matches?status=FINISHED&limit=5`, AUTH);
    if (!res.ok) { _teamFormCache.set(teamId, null); return null; }
    const data = await res.json();
    const matches = (data.matches || []).slice(-5).reverse();
    const stat = { form: [], gf: 0, ga: 0, played: 0, rank: null };
    for (const m of matches) {
      const isHome = m.homeTeam.id === teamId;
      const gf = isHome ? m.score.fullTime.home : m.score.fullTime.away;
      const ga = isHome ? m.score.fullTime.away : m.score.fullTime.home;
      if (gf == null || ga == null) continue;
      stat.gf += gf; stat.ga += ga; stat.played++;
      stat.form.push(gf > ga ? "W" : gf === ga ? "D" : "L");
    }
    _teamFormCache.set(teamId, stat);
    return stat;
  } catch (e) { _teamFormCache.set(teamId, null); return null; }
}

async function attachAnalysis(match, existingById) {
  if (match.timeframe === "past") return match;
  const prev = existingById[match.id];
  if (prev && prev.analysis) { match.analysis = prev.analysis; return match; }
  const homeStat = await fetchTeamForm(match.homeId); await sleep(6100);
  const awayStat = await fetchTeamForm(match.awayId); await sleep(6100);
  if (!homeStat && !awayStat) return match;
  const stats = {
    home: homeStat || { form: [], gf: 0, ga: 0, played: 0 },
    away: awayStat || { form: [], gf: 0, ga: 0, played: 0 },
  };
  const winProbability = calculateWinProbability(match.home, match.away, stats);
  match.analysis = {
    winProbability,
    favorite: getFavorite(winProbability),
    text: generateTextAnalysis(match.home, match.away, winProbability, stats),
    homeForm: stats.home.form,
    awayForm: stats.away.form,
  };
  return match;
}

// Kategori fallback görselleri
const CAT_FALLBACKS = {
  corumsporhaber: CORUM_BADGE,
  milli:   "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=85",
  superlig:"https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=85",
  transfer:"https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=1200&q=85",
  worldcup:"https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=85",
  general: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=85",
};

// ─── Haberleri zenginleştir: görsel + çeviri ─────────────────────────────────
async function enrichNews(item) {
  // 1) HD görsel
  let image = item.feedImage;

  // Google News placeholder veya yoksa → daha iyi görsel bul
  if (isGenericPlaceholder(image)) image = null;

  if (!image) {
    if (item.category === "corumsporhaber") {
      // Çorum FK: önce başlıkta kişi ara → Wikipedia foto
      const personImg = await resolveCorumImage(item.title || "");
      if (personImg) {
        image = personImg;
      } else {
        // OG image dene (Google News dışı kaynaklar için)
        if (item.link && !item.link.includes("news.google.com")) {
          const ogImg = await fetchOgImage(item.link);
          if (ogImg && !isGenericPlaceholder(ogImg)) image = ogImg;
        }
        // Hâlâ yoksa rozet
        if (!image) image = CORUM_BADGE;
      }
      await sleep(120);
    } else {
      // Diğer kategoriler: OG image dene
      if (item.link) {
        const ogImg = await fetchOgImage(item.link);
        if (ogImg && !isGenericPlaceholder(ogImg)) image = ogImg;
        await sleep(100);
      }
    }
  }

  if (!image) {
    image = CAT_FALLBACKS[item.category] || CAT_FALLBACKS.general;
  }

  // 2) Çeviri (yabancı kaynaklar için)
  let title   = item.title;
  let summary = item.summary;
  if (item.lang === "en" && title) {
    title   = await translate(title, "en", "tr");
    await sleep(150);
    if (summary) summary = await translate(summary.slice(0, 1200), "en", "tr");
    await sleep(150);
  }

  return { ...item, title, summary, image };
}

// ─── Ana akış ────────────────────────────────────────────────────────────────
async function main() {
  console.log("📡 Veri çekiliyor...");
  if (!FOOTBALL_API_KEY) console.warn("⚠️  FOOTBALL_DATA_API_KEY yok — maç verileri boş gelecek.");
  const existing = loadExisting();
  const existingById = {};
  if (existing) {
    for (const grp of ["past", "live", "upcoming"]) {
      for (const m of (existing.matches?.[grp] || [])) existingById[m.id] = m;
    }
  }

  // 1a) Çorum FK — Google News'ten kapsamlı çekim (paralel olarak başlat)
  console.log("🔴⚫ Çorum FK haberleri çekiliyor (Google News)...");
  const corumRawPromise = fetchCorumFKNews();

  // 1b) Genel RSS çek
  const rawNews = [];
  for (const feed of RSS_FEEDS) {
    rawNews.push(...(await fetchRSS(feed)));
    await sleep(300);
  }

  // 2) Futbol filtresi + kategori tespiti (genel RSS'den)
  const footballNews = rawNews
    .filter(n => isFootball(n.title + " " + n.summary))
    .map(n => ({ ...n, category: detectCategory(n.title + " " + n.summary) }));

  footballNews.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 3) Kategorilere dağıt (genel RSS)
  const buckets = {
    corumsporhaber: [], milli: [], superlig: [], transfer: [],
    worldcup: [], magazine: [], general: [],
  };
  for (const item of footballNews) {
    buckets[item.category]?.push(item);
  }

  // 3b) Çorum FK haberleri hazır mı?
  const corumRaw = await corumRawPromise;
  console.log(`  Çorum FK (Google News): ${corumRaw.length} benzersiz haber`);
  // Google News Çorum haberlerini bucket'a ekle (öne geçir)
  buckets.corumsporhaber = [...corumRaw, ...buckets.corumsporhaber];

  // 4) Her kategoriden seç ve zenginleştir
  const LIMITS = {
    corumsporhaber: 30, // Çorum FK için daha geniş limit
    milli: 12, superlig: 14,
    transfer: 12, worldcup: 12, magazine: 8, general: 16,
  };
  const news = {};
  for (const [cat, items] of Object.entries(buckets)) {
    // Tekrarlı başlıkları çıkar
    const seen = new Set();
    const deduped = items.filter(n => {
      const k = n.title.slice(0, 40).toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
    console.log(`  ${cat}: ${deduped.length} haber (zenginleştiriliyor)`);
    news[cat] = [];
    for (const item of deduped.slice(0, LIMITS[cat])) {
      const enriched = await enrichNews(item);
      news[cat].push(enriched);
    }
  }

  // 5) Lig maçları
  const allMatches = [];
  for (const code of Object.keys(LEAGUE_IDS)) {
    allMatches.push(...(await fetchLeagueMatches(code)));
    await sleep(6500);
  }

  // 6) Lig maçlarına analiz
  const ANALYSIS_CAP = 18;
  let analyzedCount = 0;
  for (const m of allMatches) {
    if (m.timeframe === "past") continue;
    const cached = existingById[m.id]?.analysis;
    if (cached) { m.analysis = cached; continue; }
    if (analyzedCount >= ANALYSIS_CAP) continue;
    await attachAnalysis(m, existingById);
    if (m.analysis) analyzedCount++;
  }

  // 7) Dünya Kupası
  await sleep(6500);
  const wc = await fetchWorldCup();

  // WC maçlarına rank-bazlı analiz
  for (const m of wc.matches) {
    if (m.timeframe === "past") continue;
    const prob = calculateWinProbabilityByRank(m.home, m.away);
    if (!prob) continue;
    m.analysis = {
      winProbability: prob,
      favorite: getFavorite(prob),
      text: generateRankAnalysis(m.home, m.away, prob),
      basis: "fifa-rank",
    };
  }

  // 8) Kaydet
  const outputDir = path.join(__dirname, "../public/data");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const sortAsc  = (a, b) => new Date(a.date) - new Date(b.date);
  const sortDesc = (a, b) => new Date(b.date) - new Date(a.date);

  const payload = {
    updatedAt: new Date().toISOString(),
    news,
    matches: {
      live:     allMatches.filter(m => m.timeframe === "live"),
      upcoming: allMatches.filter(m => m.timeframe === "upcoming").sort(sortAsc),
      past:     allMatches.filter(m => m.timeframe === "past").sort(sortDesc),
    },
    worldCup: {
      teams: wc.teams,
      matches: {
        upcoming: wc.matches.filter(m => m.timeframe === "upcoming").sort(sortAsc),
        past:     wc.matches.filter(m => m.timeframe === "past").sort(sortDesc),
      },
    },
  };

  fs.writeFileSync(path.join(outputDir, "football.json"), JSON.stringify(payload, null, 2));
  const total = Object.values(news).reduce((s, a) => s + a.length, 0);
  console.log(`✅ Kaydedildi — ${total} haber (${Object.entries(news).map(([k,v])=>k+':'+v.length).join(', ')})`);
  console.log(`   ${allMatches.length} lig maçı (${analyzedCount} analizli), ${wc.matches.length} WC maçı`);
}

main().catch(console.error);
