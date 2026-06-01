// pages/api/live-matches.js
// Gerçek zamanlı maç verileri — football-data.org ücretsiz API
// 6 ligi paralel çeker (1-2 saniye), 60 saniyelik CDN + in-memory cache.
// Stale "IN_PLAY" tespiti: 3.5 saatten eski "canlı" maç past'a taşınır.

const LEAGUES = [
  { code: "PL",  name: "Premier League",   flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "PD",  name: "La Liga",          flag: "🇪🇸" },
  { code: "BL1", name: "Bundesliga",       flag: "🇩🇪" },
  { code: "SA",  name: "Serie A",          flag: "🇮🇹" },
  { code: "FL1", name: "Ligue 1",          flag: "🇫🇷" },
  { code: "CL",  name: "Şampiyonlar Ligi", flag: "🏆" },
];

// Serverless-friendly in-memory cache
let _cache   = null;
let _cacheTs = 0;

function resolveTimeframe(status, utcDate) {
  if (status === "FINISHED") return "past";
  if (status === "IN_PLAY" || status === "PAUSED") {
    const elapsed = Date.now() - new Date(utcDate).getTime();
    if (elapsed > 3.5 * 3600 * 1000) return "past"; // stale canlı → bitti
    return "live";
  }
  // SCHEDULED / TIMED ama başlama saati geçmiş ve üzerinden 4 saat geçtiyse → past
  if (status === "SCHEDULED" || status === "TIMED") {
    const elapsed = Date.now() - new Date(utcDate).getTime();
    if (elapsed > 4 * 3600 * 1000) return "past";
  }
  return "upcoming";
}

function mapMatch(m, league) {
  const ft       = m.score?.fullTime || {};
  const ht       = m.score?.halfTime || {};
  const tf       = resolveTimeframe(m.status, m.utcDate);
  const live     = tf === "live";
  const finished = tf === "past";
  return {
    id:         m.id,
    homeId:     m.homeTeam?.id   || null,
    awayId:     m.awayTeam?.id   || null,
    home:       m.homeTeam?.shortName || m.homeTeam?.name || "?",
    away:       m.awayTeam?.shortName || m.awayTeam?.name || "?",
    homeCrest:  m.homeTeam?.crest || null,
    awayCrest:  m.awayTeam?.crest || null,
    date:       m.utcDate,
    status:     m.status,
    timeframe:  tf,
    score:      (finished || live) ? `${ft.home ?? 0}-${ft.away ?? 0}` : null,
    halfTime:   (ht.home != null && ht.away != null) ? `${ht.home}-${ht.away}` : null,
    fullHome:   ft.home, fullAway: ft.away,
    winner:     m.score?.winner || null,
    venue:      m.venue || null,
    referee:    m.referees?.[0]?.name || null,
    stage:      m.stage  || null,
    group:      m.group  || null,
    matchday:   m.matchday || null,
    minute:     m.minute   || null,
    league:     league.code,
    leagueName: league.name,
    leagueFlag: league.flag,
    // Form/analiz alanları yok (bu endpoint sadece skor/durum sağlar)
    homeForm: null, awayForm: null,
    homeGoalAvg: null, awayGoalAvg: null,
    headToHead: null,
  };
}

export default async function handler(req, res) {
  const FOOTBALL_API_KEY = process.env.FOOTBALL_DATA_API_KEY;

  if (!FOOTBALL_API_KEY) {
    // null yerine boş matches: frontend stale static veriyi göstermez
    return res.status(200).json({
      fetchedAt: new Date().toISOString(),
      matches: { live: [], upcoming: [], past: [] },
      error: "API key missing",
    });
  }

  // In-memory cache
  if (_cache && Date.now() - _cacheTs < 60_000) {
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.json(_cache);
  }

  const today = new Date();
  const from  = new Date(today.getTime() - 86_400_000).toISOString().split("T")[0]; // dün
  const to    = new Date(today.getTime() + 3 * 86_400_000).toISOString().split("T")[0]; // 3 gün sonra

  // 6 ligi PARALEL çek — tek seferde ~1-2 saniyede biter
  const results = await Promise.allSettled(
    LEAGUES.map(async (league) => {
      const r = await fetch(
        `https://api.football-data.org/v4/competitions/${league.code}/matches?dateFrom=${from}&dateTo=${to}`,
        { headers: { "X-Auth-Token": FOOTBALL_API_KEY }, signal: AbortSignal.timeout(9000) }
      );
      if (!r.ok) return [];
      const data = await r.json();
      return (data.matches || []).map(m => mapMatch(m, league));
    })
  );

  const allMatches = results
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value);

  const sortAsc  = (a, b) => new Date(a.date) - new Date(b.date);
  const sortDesc = (a, b) => new Date(b.date) - new Date(a.date);

  const output = {
    fetchedAt: new Date().toISOString(),
    matches: {
      live:     allMatches.filter(m => m.timeframe === "live"),
      upcoming: allMatches.filter(m => m.timeframe === "upcoming").sort(sortAsc),
      past:     allMatches.filter(m => m.timeframe === "past").sort(sortDesc),
    },
  };

  _cache   = output;
  _cacheTs = Date.now();

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
  return res.json(output);
}
