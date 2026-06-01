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

module.exports = {
  calculateWinProbability,
  generateTextAnalysis,
  getFavorite,
  formPoints,
};
