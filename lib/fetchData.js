// lib/fetchData.js
// Her gün GitHub Actions ile otomatik çalışır. TAMAMEN ÜCRETSİZ kaynaklar:
//   - football-data.org (ücretsiz anahtar) -> fikstür/sonuç + Dünya Kupası + takım formu
//   - Uluslararası futbol RSS (BBC, Sky, Guardian, ESPN) -> Türkçe'ye çevrilir (çoğunluk)
//   - Türkçe futbol RSS (Fotomaç, Sabah) -> yerel haber
//   - Her makaleden HD görsel (og:image) + tam metin (paragraf scrape)
//   - lib/analysis.js ile ücretsiz istatistiksel maç tahmini

const fs = require("fs");
const path = require("path");
try { require("dotenv").config({ path: ".env.local" }); } catch (e) {}
const { translate } = require("./translate");
const { calculateWinProbability, generateTextAnalysis, getFavorite } = require("./analysis");

// ─── RSS Feed'leri — SADECE FUTBOL, çoğunluk yabancı ────────────────────────
const RSS_FEEDS = [
  // Yabancı (ana ağırlık) — futbola özel feed'ler
  { url: "https://feeds.bbci.co.uk/sport/football/rss.xml", source: "BBC Sport", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", lang: "en", weight: 3 },
  { url: "https://www.skysports.com/rss/12040", source: "Sky Sports", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", lang: "en", weight: 3 },
  { url: "https://www.theguardian.com/football/rss", source: "The Guardian", flag: "🗞️", lang: "en", weight: 3 },
  { url: "https://www.espn.com/espn/rss/soccer/news", source: "ESPN FC", flag: "⚽", lang: "en", weight: 3 },
  // Türkçe (destek) — futbol/spor
  { url: "https://www.fotomac.com.tr/rss/anasayfa.xml", source: "Fotomaç", flag: "🇹🇷", lang: "tr", weight: 1 },
  { url: "https://www.sabah.com.tr/rss/spor.xml", source: "Sabah Spor", flag: "🇹🇷", lang: "tr", weight: 1 },
];

// SADECE futbol: bu kelimelerden en az biri geçmeli (TR + EN)
const FOOTBALL_TERMS = [
  "futbol", "football", "soccer", "gol", "goal", "maç", "match", "lig", "league",
  "transfer", "şampiyon", "champion", "kupa", "cup", "fikstür", "fixture", "teknik direktör",
  "coach", "manager", "stadyum", "stadium", "penaltı", "penalty", "forvet", "kaleci",
  "defans", "orta saha", "milli tak", "national team", "premier", "la liga", "bundesliga",
  "serie a", "ligue 1", "uefa", "fifa", "dünya kupası", "world cup", "derbi", "derby",
  // sık geçen kulüpler
  "fenerbahçe", "galatasaray", "beşiktaş", "trabzonspor", "real madrid", "barcelona",
  "arsenal", "chelsea", "liverpool", "manchester", "bayern", "juventus", "inter", "milan", "psg",
];

// Futbol DIŞI (siyaset, savaş, magazin-dışı gündem) — bunlar geçerse ELE
const BLOCK_TERMS = [
  "savaş", "war", "trump", "putin", "seçim", "election", "deprem", "earthquake",
  "borsa", "dolar", "enflasyon", "cinayet", "mahkeme", "bakan", "cumhurbaşkanı",
  "tatil", "hava durumu", "korona", "covid", "rugby", "cricket", "nba", "basketbol",
  "tenis", "tennis", "formula", "f1", "voleybol", "boks", "ufc",
];

function isFootball(text) {
  const t = text.toLowerCase();
  if (BLOCK_TERMS.some((b) => t.includes(b))) return false;
  return FOOTBALL_TERMS.some((f) => t.includes(f));
}

// ─── football-data.org ──────────────────────────────────────────────────────
const FOOTBALL_API_KEY = process.env.FOOTBALL_DATA_API_KEY || "";
const FOOTBALL_API_BASE = "https://api.football-data.org/v4";
const AUTH = { headers: { "X-Auth-Token": FOOTBALL_API_KEY } };

const LEAGUE_IDS = {
  PL: { name: "Premier League", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  PD: { name: "La Liga", flag: "🇪🇸" },
  BL1: { name: "Bundesliga", flag: "🇩🇪" },
  SA: { name: "Serie A", flag: "🇮🇹" },
  FL1: { name: "Ligue 1", flag: "🇫🇷" },
  CL: { name: "Şampiyonlar Ligi", flag: "🏆" },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Mevcut JSON'u oku (analizi tekrar hesaplamamak için) ───────────────────
function loadExisting() {
  try {
    const p = path.join(__dirname, "../public/data/football.json");
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch (e) {}
  return null;
}

// ─── HTML scrape: HD görsel + tam metin ─────────────────────────────────────
async function scrapeArticle(url) {
  try {
    const html = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GoalpostBot/1.0)" },
      signal: AbortSignal.timeout(12000),
    }).then((r) => r.text());

    const og = (prop) => {
      const re1 = new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, "i");
      const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, "i");
      const m = html.match(re1) || html.match(re2);
      return m ? m[1] : null;
    };

    // Tam metin: <p> paragraflarını çıkar (haber gövdesi)
    const paras = [];
    const re = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let m;
    while ((m = re.exec(html)) && paras.length < 16) {
      const t = m[1]
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&rsquo;/g, "'")
        .replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&ldquo;|&rdquo;/g, '"')
        .replace(/\s+/g, " ").trim();
      // reklam/abonelik/cookie cümlelerini atla
      if (t.length > 50 && !/cookie|subscribe|abone|sign up|advertisement|©/i.test(t)) {
        paras.push(t);
      }
    }
    return { image: og("image"), body: paras.slice(0, 10).join("\n\n") };
  } catch (e) {
    return { image: null, body: "" };
  }
}

// ─── RSS çek ────────────────────────────────────────────────────────────────
async function fetchRSS(feed) {
  try {
    const Parser = require("rss-parser");
    const parser = new Parser({
      customFields: { item: [["media:content", "mediaContent", { keepArray: true }], ["enclosure", "enc"]] },
      timeout: 15000,
    });
    const result = await parser.parseURL(feed.url);
    return result.items.slice(0, feed.weight >= 3 ? 16 : 8).map((item) => ({
      title: (item.title || "").trim(),
      summary: (item.contentSnippet || item.content || "").replace(/\s+/g, " ").slice(0, 500).trim(),
      link: item.link || "",
      date: item.pubDate || item.isoDate || "",
      source: feed.source,
      flag: feed.flag,
      lang: feed.lang,
      feedImage: (item.enc && item.enc.url) ||
        (item.mediaContent && item.mediaContent[0] && item.mediaContent[0].$ && item.mediaContent[0].$.url) || null,
    }));
  } catch (err) {
    console.warn(`RSS başarısız ${feed.source}:`, err.message);
    return [];
  }
}

// ─── Takım son maç formu (analiz için) ──────────────────────────────────────
const _teamFormCache = new Map();
async function fetchTeamForm(teamId) {
  if (!teamId || !FOOTBALL_API_KEY) return null;
  if (_teamFormCache.has(teamId)) return _teamFormCache.get(teamId);
  try {
    const res = await fetch(`${FOOTBALL_API_BASE}/teams/${teamId}/matches?status=FINISHED&limit=5`, AUTH);
    if (!res.ok) { _teamFormCache.set(teamId, null); return null; }
    const data = await res.json();
    const matches = (data.matches || []).slice(-5).reverse(); // en yeni başta
    const form = [], stat = { form: [], gf: 0, ga: 0, played: 0, rank: null };
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
  } catch (e) {
    _teamFormCache.set(teamId, null);
    return null;
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
    home: m.homeTeam?.shortName || m.homeTeam?.name || "?",
    away: m.awayTeam?.shortName || m.awayTeam?.name || "?",
    homeCrest: m.homeTeam?.crest || null,
    awayCrest: m.awayTeam?.crest || null,
    date: m.utcDate,
    status: m.status,
    timeframe,
    score: finished ? `${ft.home}-${ft.away}` : live ? `${ft.home ?? 0}-${ft.away ?? 0}` : null,
    halfTime: (ht.home != null && ht.away != null) ? `${ht.home}-${ht.away}` : null,
    fullHome: ft.home, fullAway: ft.away,
    halfHome: ht.home, halfAway: ht.away,
    winner: m.score?.winner || null,
    venue: m.venue || null,
    referee: (m.referees && m.referees[0] && m.referees[0].name) || null,
    stage: m.stage || null,
    group: m.group || null,
    matchday: m.matchday || null,
    league: leagueCode,
    leagueName: LEAGUE_IDS[leagueCode]?.name || (leagueCode === "WC" ? "Dünya Kupası" : leagueCode),
    leagueFlag: LEAGUE_IDS[leagueCode]?.flag || "🌍",
  };
}

async function fetchLeagueMatches(leagueCode) {
  if (!FOOTBALL_API_KEY) return [];
  const out = [];
  try {
    const today = new Date();
    const from = new Date(today.getTime() - 14 * 86400000).toISOString().split("T")[0];
    const to = new Date(today.getTime() + 21 * 86400000).toISOString().split("T")[0];
    const res = await fetch(
      `${FOOTBALL_API_BASE}/competitions/${leagueCode}/matches?dateFrom=${from}&dateTo=${to}`, AUTH
    );
    const data = res.ok ? await res.json() : { matches: [] };
    let matches = data.matches || [];
    if (matches.length === 0) {
      await sleep(6500);
      const r2 = await fetch(`${FOOTBALL_API_BASE}/competitions/${leagueCode}/matches`, AUTH);
      const d2 = r2.ok ? await r2.json() : { matches: [] };
      matches = (d2.matches || []).filter((m) => m.status === "FINISHED").slice(-8);
    }
    for (const m of matches) {
      const tf = m.status === "FINISHED" ? "past" : (m.status === "IN_PLAY" || m.status === "PAUSED") ? "live" : "upcoming";
      out.push(mapMatch(m, leagueCode, tf));
    }
  } catch (err) {
    console.warn(`Maç çekme başarısız ${leagueCode}:`, err.message);
  }
  return out;
}

async function fetchWorldCup() {
  if (!FOOTBALL_API_KEY) return { teams: [], matches: [] };
  try {
    const tRes = await fetch(`${FOOTBALL_API_BASE}/competitions/WC/teams`, AUTH);
    const tData = tRes.ok ? await tRes.json() : { teams: [] };
    const teams = (tData.teams || []).map((t) => ({ id: t.id, name: t.name, tla: t.tla, crest: t.crest || null }));
    await sleep(6500);
    const mRes = await fetch(`${FOOTBALL_API_BASE}/competitions/WC/matches`, AUTH);
    const mData = mRes.ok ? await mRes.json() : { matches: [] };
    const matches = (mData.matches || []).map((m) =>
      mapMatch(m, "WC", m.status === "FINISHED" ? "past" : "upcoming"));
    return { teams, matches };
  } catch (err) {
    console.warn("WC çekme başarısız:", err.message);
    return { teams: [], matches: [] };
  }
}

// Maça analiz ekle (sadece upcoming/live; geçmiş maçlar zaten oynanmış)
async function attachAnalysis(match, existingById) {
  if (match.timeframe === "past") return match; // geçmişe tahmin gereksiz
  const prev = existingById[match.id];
  if (prev && prev.analysis) { match.analysis = prev.analysis; return match; } // tekrar hesaplama

  const homeStat = await fetchTeamForm(match.homeId);
  await sleep(6100); // rate limit
  const awayStat = await fetchTeamForm(match.awayId);
  await sleep(6100);

  if (!homeStat && !awayStat) return match;
  const stats = { home: homeStat || { form: [], gf: 0, ga: 0, played: 0 }, away: awayStat || { form: [], gf: 0, ga: 0, played: 0 } };
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

// ─── Ana akış ───────────────────────────────────────────────────────────────
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

  // 1) Haberler — SADECE FUTBOL filtresi
  const rawNews = [];
  for (const feed of RSS_FEEDS) {
    rawNews.push(...(await fetchRSS(feed)));
    await sleep(300);
  }
  const footballNews = rawNews.filter((n) => isFootball(n.title + " " + n.summary));
  footballNews.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 2) Lig maçları
  const allMatches = [];
  for (const code of Object.keys(LEAGUE_IDS)) {
    allMatches.push(...(await fetchLeagueMatches(code)));
    await sleep(6500);
  }

  // 3) Dünya Kupası
  await sleep(6500);
  const wc = await fetchWorldCup();

  // 4) Maçlara analiz ekle (sadece upcoming + live). Rate-limit için üst sınır:
  //    her maç 2 API çağrısı × 6.1s. Önce zaten analizli olanlar (cache) gelir.
  const ANALYSIS_CAP = 18;
  let analyzedCount = 0;
  for (const m of allMatches) {
    if (m.timeframe === "past") continue;
    const cached = existingById[m.id]?.analysis;
    if (cached) { m.analysis = cached; continue; }   // ücretsiz: tekrar hesaplama yok
    if (analyzedCount >= ANALYSIS_CAP) continue;      // bütçeyi aşma
    await attachAnalysis(m, existingById);
    if (m.analysis) analyzedCount++;
  }

  // 5) Kategorilere ayır
  const transferKw = ["transfer", "sign", "deal", "loan", "bid", "imza", "bonservis", "anlaş", "sözleşme", "kiralık"];
  const wcKw = ["world cup", "dünya kupası", "milli tak", "a milli", "national team"];
  const magazineKw = ["record", "viral", "legend", "rekor", "efsane", "wonder", "stunning"];

  const general = [], transfer = [], magazine = [], worldcup = [];
  for (const item of footballNews) {
    const text = (item.title + " " + item.summary).toLowerCase();
    if (wcKw.some((k) => text.includes(k))) worldcup.push(item);
    else if (transferKw.some((k) => text.includes(k))) transfer.push(item);
    else if (magazineKw.some((k) => text.includes(k))) magazine.push(item);
    else general.push(item);
  }

  // 6) Her habere HD görsel + TAM metin + Türkçe çeviri
  async function enrich(list, limit) {
    const out = [];
    for (const item of list.slice(0, limit)) {
      let image = item.feedImage;
      let body = item.summary;
      if (item.link) {
        const sc = await scrapeArticle(item.link);
        if (sc.image) image = sc.image;
        if (sc.body && sc.body.length > body.length) body = sc.body;
        await sleep(120);
      }
      let title = item.title;
      if (item.lang && item.lang !== "tr") {
        title = await translate(item.title, item.lang, "tr");
        if (body) body = await translate(body, item.lang, "tr");
        await sleep(150);
      }
      out.push({
        title, summary: body, source: item.source, flag: item.flag,
        date: item.date, link: item.link,
        image: image || "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=85",
      });
    }
    return out;
  }

  const news = {
    general: await enrich(general, 16),
    transfer: await enrich(transfer, 12),
    magazine: await enrich(magazine, 8),
    worldcup: await enrich(worldcup, 12),
  };

  // 7) Kaydet
  const outputDir = path.join(__dirname, "../public/data");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const sortAsc = (a, b) => new Date(a.date) - new Date(b.date);
  const sortDesc = (a, b) => new Date(b.date) - new Date(a.date);

  const payload = {
    updatedAt: new Date().toISOString(),
    news,
    matches: {
      live: allMatches.filter((m) => m.timeframe === "live"),
      upcoming: allMatches.filter((m) => m.timeframe === "upcoming").sort(sortAsc),
      past: allMatches.filter((m) => m.timeframe === "past").sort(sortDesc),
    },
    worldCup: {
      teams: wc.teams,
      matches: {
        upcoming: wc.matches.filter((m) => m.timeframe === "upcoming").sort(sortAsc),
        past: wc.matches.filter((m) => m.timeframe === "past").sort(sortDesc),
      },
    },
  };

  fs.writeFileSync(path.join(outputDir, "football.json"), JSON.stringify(payload, null, 2));
  const newsCount = Object.values(news).reduce((s, a) => s + a.length, 0);
  const analyzed = allMatches.filter((m) => m.analysis).length;
  console.log(
    `✅ Kaydedildi — ${newsCount} futbol haberi, ${allMatches.length} lig maçı ` +
    `(${analyzed} analizli), ${wc.matches.length} WC maçı, ${wc.teams.length} WC takımı`
  );
}

main().catch(console.error);
