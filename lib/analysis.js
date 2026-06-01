// lib/analysis.js
// TAMAMEN ÜCRETSİZ istatistiksel maç analizi & tahmin motoru.
// Hiçbir ödemeli API / AI kullanılmaz — sadece football-data.org'un ücretsiz
// verisinden türetilen istatistiklerle ağırlıklı kurallı bir model.
//
// stats şekli (fetchData tarafından sağlanır):
// {
//   home: { form: ["W","D","L","W","W"], gf: 9, ga: 4, played: 5, rank: 3 },
//   away: { form: ["L","L","W","D","L"], gf: 5, ga: 8, played: 5, rank: 11 }
// }
// form: en yeni maç başta; W=galibiyet, D=beraberlik, L=mağlubiyet
// gf/ga: son maçlardaki toplam atılan/yenen gol, played: oynanan maç sayısı
// rank: lig sıralaması (opsiyonel, yoksa null)

function formPoints(form = []) {
  // W=3, D=1, L=0
  return form.reduce((s, r) => s + (r === "W" ? 3 : r === "D" ? 1 : 0), 0);
}

function avg(total, played) {
  return played > 0 ? total / played : 0;
}

// Ana model: 0 toplamlı güç skorlarını olasılığa çevirir
function calculateWinProbability(homeTeam, awayTeam, stats = {}) {
  const h = stats.home || {};
  const a = stats.away || {};

  const hForm = formPoints(h.form);          // 0..15
  const aForm = formPoints(a.form);
  const hGF = avg(h.gf, h.played);           // gol ortalaması
  const hGA = avg(h.ga, h.played);
  const aGF = avg(a.gf, a.played);
  const aGA = avg(a.ga, a.played);

  // Her takım için "güç" puanı
  // form (max ~15) + hücum gücü + savunma gücü
  let hStrength =
    hForm * 1.0 +                 // form ağırlığı
    hGF * 2.0 -                   // attığı gol
    hGA * 1.5;                    // yediği gol (ceza)
  let aStrength =
    aForm * 1.0 +
    aGF * 2.0 -
    aGA * 1.5;

  // Ev sahibi avantajı: +%10'luk etki (güç puanına orantılı ekleme)
  hStrength += 2.0;

  // Lig sıralaması farkı (varsa): küçük rank = iyi
  if (h.rank != null && a.rank != null) {
    const diff = a.rank - h.rank; // ev sahibi daha iyi sıradaysa pozitif
    hStrength += diff * 0.3;
  }

  // Negatifleri tabana çek
  const base = Math.min(hStrength, aStrength, 0);
  let hs = hStrength - base + 1;
  let as = aStrength - base + 1;

  // Beraberlik faktörü: iki güç ne kadar yakınsa beraberlik o kadar olası
  const total = hs + as;
  const closeness = 1 - Math.abs(hs - as) / total; // 0..1
  let drawScore = total * 0.30 * closeness;        // yakınlıkla artan beraberlik

  const grand = hs + as + drawScore;
  let home = Math.round((hs / grand) * 100);
  let draw = Math.round((drawScore / grand) * 100);
  let away = 100 - home - draw;

  // Güvenlik: negatif olmasın
  if (away < 0) { home += away; away = 0; }
  if (home < 0) { home = 0; }
  // Toplamı 100'e sabitle
  const sum = home + draw + away;
  if (sum !== 100) away += 100 - sum;

  return { home, draw, away };
}

// FIFA Dünya Sıralaması (2026 tahmini) — football-data.org'daki İngilizce takım adlarıyla.
// WC maçlarında milli takım form verisi ücretsiz API'de olmadığı için sıralama tabanlı kullanılır.
const FIFA_RANKS = {
  "Argentina": 1, "Spain": 2, "France": 3, "England": 4, "Brazil": 5, "Portugal": 6,
  "Netherlands": 7, "Belgium": 8, "Germany": 9, "Croatia": 10, "Italy": 11, "Morocco": 12,
  "Colombia": 13, "Uruguay": 14, "USA": 15, "United States": 16, "Mexico": 17, "Switzerland": 18,
  "Senegal": 19, "Japan": 20, "Denmark": 21, "Iran": 22, "Korea Republic": 23, "South Korea": 23,
  "Australia": 24, "Ukraine": 25, "Turkey": 26, "Türkiye": 26, "Austria": 27, "Canada": 28,
  "Ecuador": 29, "Egypt": 33, "Norway": 31, "Panama": 34, "Algeria": 35, "Sweden": 36,
  "Scotland": 37, "Nigeria": 38, "Ivory Coast": 40, "Cote d'Ivoire": 40, "Paraguay": 41,
  "Tunisia": 42, "Costa Rica": 43, "Saudi Arabia": 58, "South Africa": 59, "Uzbekistan": 57,
  "Qatar": 36, "Czech Republic": 39, "Czechia": 39, "Ghana": 73, "New Zealand": 89,
  "Jordan": 64, "Iraq": 58, "Curaçao": 90, "Cape Verde": 70, "Haiti": 83, "Bosnia-Herzegovina": 74,
  "DR Congo": 60, "Congo DR": 60,
};

function rankOf(teamName) {
  if (!teamName) return null;
  if (FIFA_RANKS[teamName] != null) return FIFA_RANKS[teamName];
  // kısmi eşleşme
  const key = Object.keys(FIFA_RANKS).find((k) => teamName.includes(k) || k.includes(teamName));
  return key ? FIFA_RANKS[key] : null;
}

// Sadece FIFA sıralamasına göre tahmin (form verisi yoksa — örn. WC maçları)
function calculateWinProbabilityByRank(homeName, awayName) {
  const hr = rankOf(homeName);
  const ar = rankOf(awayName);
  if (hr == null || ar == null) return null;
  // Daha düşük rank = daha güçlü. Güç = (100 - rank)
  let hs = (100 - Math.min(hr, 99)) + 8;  // +8 ev sahibi avantajı (~%10)
  let as = (100 - Math.min(ar, 99));
  const total = hs + as;
  const closeness = 1 - Math.abs(hs - as) / total;
  const drawScore = total * 0.34 * closeness;
  const grand = hs + as + drawScore;
  let home = Math.round((hs / grand) * 100);
  let draw = Math.round((drawScore / grand) * 100);
  let away = 100 - home - draw;
  if (away < 0) { home += away; away = 0; }
  const sum = home + draw + away;
  if (sum !== 100) away += 100 - sum;
  return { home, draw, away };
}

function generateRankAnalysis(home, away, prob) {
  const fav = getFavorite(prob);
  if (Math.abs(prob.home - prob.away) <= 7) {
    return `${home} ile ${away} arasında dengeli bir mücadele bekleniyor; beraberlik ihtimali %${prob.draw}.`;
  }
  if (fav === "home") {
    return `FIFA sıralaması ve ev sahibi avantajıyla ${home}, %${prob.home} ihtimalle favori. ${away} sürpriz peşinde olacak.`;
  }
  if (fav === "away") {
    return `Sıralamada üstün olan ${away}, deplasmanda olmasına rağmen %${prob.away} ile öne çıkıyor.`;
  }
  return `Bu maçta beraberlik en olası sonuç görünüyor (%${prob.draw}).`;
}

function getFavorite(prob) {
  const { home, draw, away } = prob;
  if (home >= away && home >= draw) return "home";
  if (away >= home && away >= draw) return "away";
  return "draw";
}

function countWins(form = []) {
  return form.filter((r) => r === "W").length;
}

// Kurallı, verilere göre değişen doğal Türkçe analiz
function generateTextAnalysis(home, away, prob, stats = {}) {
  const h = stats.home || {};
  const a = stats.away || {};
  const fav = getFavorite(prob);
  const hWins = countWins(h.form);
  const aWins = countWins(a.form);
  const hForm = formPoints(h.form);
  const aForm = formPoints(a.form);
  const hGFavg = avg(h.gf, h.played);
  const aGFavg = avg(a.gf, a.played);
  const aGAavg = avg(a.ga, a.played);
  const margin = Math.abs(prob.home - prob.away);

  const parts = [];

  // 1) Ana favori cümlesi
  if (fav === "draw" || margin <= 6) {
    parts.push(
      `İki takım da benzer formda; bu maçta beraberlik ihtimali öne çıkıyor (%${prob.draw}).`
    );
  } else if (fav === "home") {
    if (hWins >= 3) {
      parts.push(
        `Ev sahibi ${home}, son ${h.form?.length || 5} maçta ${hWins} galibiyetle formda ve %${prob.home} ile favori görünüyor.`
      );
    } else {
      parts.push(
        `Ev sahibi avantajını kullanan ${home}, %${prob.home} ihtimalle bu maçın favorisi.`
      );
    }
  } else {
    if (aWins >= 3) {
      parts.push(
        `Deplasmandaki ${away}, son ${a.form?.length || 5} maçta ${aWins} galibiyetle çıkışta; %${prob.away} ile favori.`
      );
    } else {
      parts.push(
        `${away}, deplasmanda olmasına rağmen %${prob.away} ile bir adım önde.`
      );
    }
  }

  // 2) Gol/savunma renk cümlesi (verilere göre)
  if (aGFavg >= 1.6 && aGAavg >= 1.4) {
    parts.push(`${away} gol ortalaması yüksek (${aGFavg.toFixed(1)}) ancak savunmada zorlanıyor.`);
  } else if (hGFavg >= 1.8) {
    parts.push(`${home} hücumda etkili; maç başına ${hGFavg.toFixed(1)} gol buluyor.`);
  } else if (hForm <= 4 && fav !== "home") {
    parts.push(`${home} son haftalarda form kaybında, bu da işini zorlaştırıyor.`);
  } else if (aForm <= 4 && fav !== "away") {
    parts.push(`${away} deplasmanda son maçlarda istikrarsız bir görüntü veriyor.`);
  }

  return parts.join(" ");
}

// ─── Frontend: match nesnesi alarak çalışan yeni API ──────────────────────────
// FixtureRow'da calculateWinProbabilityFromMatch(match) ve generateAnalysisText(match, prob) olarak kullanılır.

function calculateWinProbabilityFromMatch(match) {
  const homeForm    = match.homeForm    || [];
  const awayForm    = match.awayForm    || [];
  const homeGoalAvg = parseFloat(match.homeGoalAvg || 1);
  const awayGoalAvg = parseFloat(match.awayGoalAvg || 1);
  const h2h         = match.headToHead;

  // Son maç daha ağırlıklı form puanı
  const weightedForm = (form) =>
    form.reduce((acc, r, idx) => {
      const w = 1 + (form.length - 1 - idx) * 0.15;
      return acc + (r === "W" ? 3 : r === "D" ? 1 : 0) * w;
    }, 0);

  let hs = weightedForm(homeForm) * 2.5 + homeGoalAvg * 6;
  let as = weightedForm(awayForm) * 2.5 + awayGoalAvg * 6;

  hs *= 1.15; // ev sahibi avantajı

  if (h2h) {
    hs += (h2h.homeWins || 0) * 2.5;
    as += (h2h.awayWins || 0) * 2.5;
  }

  const base  = Math.min(hs, as, 0);
  const hNorm = hs - base + 1;
  const aNorm = as - base + 1;
  const total = hNorm + aNorm;
  const closeness  = 1 - Math.abs(hNorm - aNorm) / total;
  const drawScore  = total * 0.28 * closeness;
  const grand      = hNorm + aNorm + drawScore;

  let home = Math.round((hNorm / grand) * 100);
  let draw = Math.round((drawScore / grand) * 100);
  let away = 100 - home - draw;

  // [15, 70] aralığına kilitle ve toplamı 100'e sabitle
  home = Math.max(15, Math.min(70, home));
  away = Math.max(15, Math.min(70, away));
  draw = Math.max(10, Math.min(40, draw));
  const sum = home + draw + away;
  away = 100 - home - draw + (away - (sum - 100));
  away = Math.max(10, away);
  draw = 100 - home - away;
  draw = Math.max(10, draw);
  home = 100 - draw - away;

  return { home, draw, away };
}

function generateAnalysisText(match, prob) {
  const { home, away } = match;
  const homeForm    = match.homeForm    || [];
  const awayForm    = match.awayForm    || [];
  const homeGoalAvg = parseFloat(match.homeGoalAvg || 0);
  const awayGoalAvg = parseFloat(match.awayGoalAvg || 0);
  const h2h         = match.headToHead;
  const fav         = getFavorite(prob);
  const homeWins    = homeForm.filter(f => f === "W").length;
  const awayWins    = awayForm.filter(f => f === "W").length;
  const margin      = Math.abs(prob.home - prob.away);
  const parts       = [];

  // 1) Form
  if (homeWins >= 4)
    parts.push(`${home}, son ${homeForm.length} maçta ${homeWins} galibiyet alarak mükemmel formda.`);
  else if (awayWins >= 4)
    parts.push(`${away}, son ${awayForm.length} maçta ${awayWins} galibiyetle son derece istikrarlı.`);
  else if (homeWins >= 3)
    parts.push(`${home} son ${homeForm.length} maçta ${homeWins} galibiyetle formunu koruyor.`);
  else if (awayWins >= 3)
    parts.push(`${away}, deplasmana son ${awayForm.length} maçta ${awayWins} galibiyetle güçlü geliyor.`);
  else if (homeWins <= 1 && homeForm.length >= 4)
    parts.push(`${home} son haftalarda form kaybı yaşıyor (${homeForm.length} maçta ${homeWins} galibiyet).`);
  else if (awayWins <= 1 && awayForm.length >= 4)
    parts.push(`${away} son ${awayForm.length} maçta yalnızca ${awayWins} galibiyet aldı.`);

  // 2) Gol
  if (homeGoalAvg >= 2.0 && awayGoalAvg >= 2.0)
    parts.push(`Her iki takım da gollü: ${home} ${homeGoalAvg.toFixed(1)}, ${away} ${awayGoalAvg.toFixed(1)} gol/maç — yüksek tempolu bir karşılaşma bekleniyor.`);
  else if (homeGoalAvg >= 2.0)
    parts.push(`${home} hücumda etkili, maç başına ${homeGoalAvg.toFixed(1)} gol buluyor.`);
  else if (awayGoalAvg >= 2.0)
    parts.push(`${away}, ${awayGoalAvg.toFixed(1)} gol ortalamasıyla tehlikeli bir hücum gücüne sahip.`);
  else if (homeGoalAvg > 0 && awayGoalAvg > 0 && homeGoalAvg < 1.0 && awayGoalAvg < 1.0)
    parts.push(`Her iki takımın gol ortalaması düşük — çekişmeli, az gollü bir maç olabilir.`);

  // 3) H2H
  if (h2h && h2h.total >= 3) {
    parts.push(
      `Son ${h2h.total} karşılaşmada: ${home} ${h2h.homeWins}G — ${h2h.draws}B — ${h2h.awayWins}G ${away}.`
    );
  }

  // 4) Tahmin
  if (margin <= 6)
    parts.push(`Dengeli güçler; beraberlik %${prob.draw} ile güçlü bir ihtimal.`);
  else if (fav === "home")
    parts.push(`Ev sahibi avantajı ve form verileri ${home}'i %${prob.home} oranında favori yapıyor.`);
  else
    parts.push(`${away}, deplasmanda olmasına rağmen %${prob.away} oranıyla maçın favorisi.`);

  return parts.length ? parts.join(" ") : `${home} - ${away} maçı için analiz verisi hazırlanıyor.`;
}

module.exports = {
  calculateWinProbability,
  generateTextAnalysis,
  getFavorite,
  formPoints,
  calculateWinProbabilityByRank,
  generateRankAnalysis,
  rankOf,
  // Yeni frontend API
  calculateWinProbabilityFromMatch,
  generateAnalysisText,
};
