// lib/translate.js — anahtarsız ücretsiz çeviri (Google gtx endpoint)
// Sadece build sırasında (fetchData) kullanılır.

const _cache = new Map();

// HTML entity'leri ve özel karakterleri temizle
function cleanText(text) {
  if (!text) return "";
  return text
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—").replace(/&hellip;/g, "...").replace(/&bull;/g, "•")
    .replace(/&#\d+;/g, " ").replace(/&[a-z]+;/gi, " ")
    .replace(/<[^>]+>/g, " ")          // HTML etiketleri temizle
    .replace(/\s{2,}/g, " ").trim();
}

// Metni cümle sınırlarında böl (makul chunk boyutu)
function splitSentences(text, maxLen = 1200) {
  const sentences = text.match(/[^.!?]+[.!?]+["']?\s*/g) || [text];
  const chunks = [];
  let current = "";
  for (const s of sentences) {
    if ((current + s).length > maxLen && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

async function translateChunk(text, from = "auto", to = "tr", retries = 2) {
  const cleaned = cleanText(text);
  if (!cleaned) return text;
  const key = `${from}|${to}|${cleaned.slice(0, 100)}`;
  if (_cache.has(key)) return _cache.get(key);

  for (let i = 0; i <= retries; i++) {
    try {
      const url =
        `https://translate.googleapis.com/translate_a/single?client=gtx` +
        `&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(cleaned)}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const out = (data[0] || []).map((seg) => (seg && seg[0]) || "").join("").trim();

      // Kalite kontrolü: çeviri orijinalin en az %30'u uzunluğunda olmalı
      if (!out || out.length < cleaned.length * 0.3) {
        if (i < retries) { await new Promise(r => setTimeout(r, 600 * (i + 1))); continue; }
        _cache.set(key, cleaned);
        return cleaned;
      }
      _cache.set(key, out);
      return out;
    } catch (err) {
      if (i < retries) await new Promise(r => setTimeout(r, 600 * (i + 1)));
    }
  }
  _cache.set(key, cleaned);
  return cleaned;
}

// Ana fonksiyon: uzun metni cümle sınırlarında bölerek çevir
async function translate(text, from = "auto", to = "tr") {
  const cleaned = cleanText(text);
  if (!cleaned || cleaned.length < 10) return text;
  if (cleaned.length <= 1200) return translateChunk(cleaned, from, to);

  const chunks = splitSentences(cleaned);
  const out = [];
  for (const chunk of chunks) {
    const translated = await translateChunk(chunk, from, to);
    out.push(translated);
    await new Promise(r => setTimeout(r, 200));
  }
  return out.join(" ");
}

module.exports = { translate, cleanText };
