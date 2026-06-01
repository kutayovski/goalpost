// pages/api/live-news.js
// Her 5 dakikada RSS çeker + OG görsel scrape eder.
// Çorum FK → logo, diğerleri → article'ın kendi og:image'ı.

import Parser from 'rss-parser';

const parser = new Parser({ timeout: 8000 });

const CORUM_BADGE = 'https://upload.wikimedia.org/wikipedia/tr/3/37/%C3%87orum_FK.png';

const LIVE_FEEDS = [
  { url: 'https://news.google.com/rss/search?q=%C3%87orum+FK&hl=tr&gl=TR&ceid=TR:tr',
    source: 'Google News', flag: '🔴⚫', forceCat: 'corumsporhaber', limit: 15 },
  { url: 'https://news.google.com/rss/search?q=%C3%87orum+FK+transfer&hl=tr&gl=TR&ceid=TR:tr',
    source: 'Transfer', flag: '🔴⚫', forceCat: 'corumsporhaber', limit: 8 },
  { url: 'https://www.fotomac.com.tr/rss/anasayfa.xml',
    source: 'Fotomaç', flag: '🇹🇷', limit: 10 },
  { url: 'https://www.hurriyet.com.tr/rss/spor',
    source: 'Hürriyet', flag: '🇹🇷', limit: 10 },
  { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
    source: 'BBC Sport', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', limit: 8 },
];

const BLOCK_KW = [
  "women's","lionesses","wsl","nwsl","swpl","fawsl","cricket","rugby","tenis","nba",
  "boks","formula","f1","volleyball","short video","kısa video","uygulamasında tanışın",
  "app store","google play","download","indir","podcast","subscribe","abone ol",
];
const FOOTBALL_KW = ["futbol","football","soccer","gol","goal","maç","match","transfer","çorum","fenerbahçe","galatasaray","beşiktaş","trabzon","süper lig","lig","kupa","cup","champion","milli","premier","bundesliga","serie a","la liga"];

function isFootball(t) {
  const text = (t || '').toLowerCase();
  if (BLOCK_KW.some(k => text.includes(k))) return false;
  return FOOTBALL_KW.some(k => text.includes(k));
}

const _CORUM_KW    = ["çorum","corum fk","corumspor","çorumspor"];
const _MILLI_KW    = ["milli tak","a milli","türkiye milli","montella","national team turkey","milli maç","milli kadro","milli oyuncu"];
const _WC_KW       = ["dünya kupası","world cup","fifa 2026","wc 2026"];
const _TRANSFER_KW = ["transfer","imza","bonservis","sözleşme","kiralık","anlaştı","satın","bedel"];
const _SUPERLIG_KW = ["süper lig","superlig","tff","trendyol süper","3. lig","tff 1","tff 2"];

function detectLiveCat(text) {
  const t = (text || '').toLowerCase();
  if (_CORUM_KW.some(k => t.includes(k)))    return 'corumsporhaber';
  if (_MILLI_KW.some(k => t.includes(k)))    return 'milli';
  if (_WC_KW.some(k => t.includes(k)))       return 'worldcup';
  if (_TRANSFER_KW.some(k => t.includes(k))) return 'transfer';
  if (_SUPERLIG_KW.some(k => t.includes(k))) return 'superlig';
  return 'general';
}

// OG görsel scrape — sadece direkt makale URL'leri için (Google News redirect değil)
async function fetchOgImage(url) {
  if (!url || url.includes('news.google.com')) return null;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Twitterbot/1.0)' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
           || html.match(/content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const src = m?.[1];
    if (!src || src.includes('placeholder') || src.includes('default')) return null;
    return src;
  } catch { return null; }
}

// RSS item'ından görsel çıkar (media:content, enclosure vb.)
function extractRssImage(item) {
  // media:content
  const mc = item['media:content'];
  if (mc) {
    if (typeof mc === 'string') return mc;
    if (mc.$ && mc.$.url) return mc.$.url;
    if (Array.isArray(mc) && mc[0]?.$?.url) return mc[0].$.url;
  }
  // enclosure
  if (item.enclosure?.url && item.enclosure.url.match(/\.(jpg|jpeg|png|webp)/i)) {
    return item.enclosure.url;
  }
  return null;
}

let _cache = null;
let _cacheTime = 0;
const CACHE_MS = 5 * 60 * 1000;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

  const now = Date.now();
  if (_cache && now - _cacheTime < CACHE_MS) {
    return res.json({ items: _cache, fresh: false, updatedAt: new Date(_cacheTime).toISOString() });
  }

  // ── RSS paralel çekimi ───────────────────────────────────────────────────────
  const results = await Promise.allSettled(
    LIVE_FEEDS.map(feed =>
      parser.parseURL(feed.url)
        .then(r => ({ feed, items: r.items }))
        .catch(() => ({ feed, items: [] }))
    )
  );

  const rawItems = [];
  const seen = new Set();

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    const { feed, items: feedItems } = result.value;

    for (const item of feedItems.slice(0, feed.limit)) {
      if (!item.title) continue;

      const cleanTitle = item.title
        .replace(/\s*[-–—]\s*[\w\s\.]{2,30}$/, '')
        .trim();

      if (!isFootball(cleanTitle)) continue;

      const key = cleanTitle.slice(0, 40).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const cat = feed.forceCat || detectLiveCat(cleanTitle);
      const rssImg = extractRssImage(item);

      rawItems.push({
        title:    cleanTitle,
        link:     item.link || '',
        date:     item.pubDate || item.isoDate || new Date().toISOString(),
        source:   feed.source,
        flag:     feed.flag,
        cat,
        category: cat,
        summary:  (item.contentSnippet || '').replace(/\s+/g, ' ').slice(0, 300),
        isLive:   true,
        _rssImg:  rssImg, // geçici alan — image resolve için
      });
    }
  }

  rawItems.sort((a, b) => new Date(b.date) - new Date(a.date));
  const top50 = rawItems.slice(0, 50);

  // ── Görsel zenginleştirme (paralel) ─────────────────────────────────────────
  const enriched = await Promise.allSettled(
    top50.map(async (item) => {
      // Çorum FK → her zaman logo
      if (item.cat === 'corumsporhaber') {
        const { _rssImg, ...rest } = item;
        return { ...rest, image: CORUM_BADGE };
      }

      // RSS'te görsel varsa direkt kullan
      if (item._rssImg) {
        const { _rssImg, ...rest } = item;
        return { ...rest, image: _rssImg };
      }

      // OG görsel scrape (Google News olmayan URL'ler)
      let image = null;
      if (item.link && !item.link.includes('news.google.com')) {
        image = await fetchOgImage(item.link);
      }

      const { _rssImg, ...rest } = item;
      return { ...rest, image: image || null };
    })
  );

  const finalItems = enriched.map((r, i) =>
    r.status === 'fulfilled' ? r.value : top50[i]
  );

  _cache = finalItems;
  _cacheTime = now;

  return res.json({ items: finalItems, fresh: true, updatedAt: new Date().toISOString() });
}
