// lib/translate.js — anahtarsız ücretsiz çeviri (Google translate gtx endpoint)
// Sadece build sırasında (fetchData) kullanılır.

const _cache = new Map();

async function translateChunk(text, from = "auto", to = "tr") {
  if (!text || !text.trim()) return text;
  const key = `${from}|${to}|${text}`;
  if (_cache.has(key)) return _cache.get(key);
  try {
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx` +
      `&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const out = (data[0] || []).map((seg) => seg[0]).join("");
    _cache.set(key, out || text);
    return out || text;
  } catch (err) {
    return text; // hata olursa orijinali döndür
  }
}

// Uzun metni ~1500 karakterlik parçalara böl (URL limiti)
async function translate(text, from = "auto", to = "tr") {
  if (!text || !text.trim()) return text;
  if (text.length <= 1400) return translateChunk(text, from, to);
  const parts = text.match(/[\s\S]{1,1400}(?=\s|$)/g) || [text];
  const out = [];
  for (const p of parts) {
    out.push(await translateChunk(p, from, to));
    await new Promise((r) => setTimeout(r, 150));
  }
  return out.join("");
}

module.exports = { translate };
