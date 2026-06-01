// pages/api/live-news.js
// Vercel Serverless Function — ücretsiz, sınırsız çalışır.
// Her 5 dakikada bir RSS kaynaklarından canlı haber çeker.
// GitHub Actions'a gerek kalmadan haberler sürekli güncel kalır.

import Parser from 'rss-parser';

const parser = new Parser({ timeout: 8000 });

const LIVE_FEEDS = [
  // Çorum FK — her çağrıda taze sonuçlar
  { url: 'https://news.google.com/rss/search?q=%C3%87orum+FK&hl=tr&gl=TR&ceid=TR:tr',
    source: 'Google News', flag: '🔴⚫', forceCat: 'corumsporhaber', limit: 15 },
  { url: 'https://news.google.com/rss/search?q=%C3%87orum+FK+transfer&hl=tr&gl=TR&ceid=TR:tr',
    source: 'Transfer', flag: '🔴⚫', forceCat: 'corumsporhaber', limit: 10 },
  // Türkçe futbol — kategori başlıktan dinamik tespit edilir
  { url: 'https://www.fotomac.com.tr/rss/anasayfa.xml',
    source: 'Fotomaç', flag: '🇹🇷', limit: 10 },
  { url: 'https://www.hurriyet.com.tr/rss/spor',
    source: 'Hürriyet', flag: '🇹🇷', limit: 10 },
  // Dünya futbolu
  { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',
    source: 'BBC Sport', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', limit: 8 },
];

const BLOCK_KW = ["women's","lionesses","wsl","nwsl","cricket","rugby","tenis","nba","boks","formula","f1","volleyball"];
const FOOTBALL_KW = ["futbol","football","soccer","gol","goal","maç","match","transfer","çorum","fenerbahçe","galatasaray","beşiktaş","trabzon","süper lig","lig","kupa","cup","champion","milli","premier","bundesliga","serie a","la liga"];

function isFootball(t) {
  const text = (t || '').toLowerCase();
  if (BLOCK_KW.some(k => text.includes(k))) return false;
  return FOOTBALL_KW.some(k => text.includes(k));
}

// Başlıktan kategori tespiti — fetchData.js'deki mantıkla aynı
const _CORUM_KW    = ["çorum","corum fk","corumspor","çorumspor"];
const _MILLI_KW    = ["milli tak","a milli","türkiye milli","montella","national team turkey","milli maç","milli kadro","milli oyuncu"];
const _WC_KW       = ["dünya kupası","world cup","fifa 2026","wc 2026"];
const _SUPERLIG_KW = ["süper lig","superlig","tff","trendyol süper","3. lig","tff 1","tff 2"];
const _TRANSFER_KW = ["transfer","imza","bonservis","sözleşme","kiralık","anlaştı","satın","bedel"];

function detectLiveCat(text) {
  const t = (text || '').toLowerCase();
  if (_CORUM_KW.some(k => t.includes(k)))    return 'corumsporhaber';
  if (_MILLI_KW.some(k => t.includes(k)))    return 'milli';
  if (_WC_KW.some(k => t.includes(k)))       return 'worldcup';
  if (_TRANSFER_KW.some(k => t.includes(k))) return 'transfer';
  if (_SUPERLIG_KW.some(k => t.includes(k))) return 'superlig';
  return 'general';
}

// Server-side in-memory cache (serverless cold starts reset it, ama yine de hız kazanır)
let _cache = null;
let _cacheTime = 0;
const CACHE_MS = 5 * 60 * 1000; // 5 dakika

export default async function handler(req, res) {
  // Vercel CDN edge cache: 5 dakika taze, 1 dk stale
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

  const now = Date.now();
  if (_cache && now - _cacheTime < CACHE_MS) {
    return res.json({ items: _cache, fresh: false, updatedAt: new Date(_cacheTime).toISOString() });
  }

  // Paralel RSS çekimi (timeout: 8s her biri)
  const results = await Promise.allSettled(
    LIVE_FEEDS.map(feed =>
      parser.parseURL(feed.url)
        .then(r => ({ feed, items: r.items }))
        .catch(() => ({ feed, items: [] }))
    )
  );

  const items = [];
  const seen = new Set();

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    const { feed, items: feedItems } = result.value;

    for (const item of feedItems.slice(0, feed.limit)) {
      if (!item.title) continue;

      // Google News başlığından kaynak adını temizle ("Başlık - Kaynak" formatı)
      const cleanTitle = item.title
        .replace(/\s*[-–—]\s*[\w\s\.]{2,30}$/, '')
        .trim();

      if (!isFootball(cleanTitle)) continue;

      // Tekrar engeli
      const key = cleanTitle.slice(0, 40).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      // forceCat varsa onu kullan, yoksa başlıktan dinamik tespit et
      const cat = feed.forceCat || detectLiveCat(cleanTitle);

      items.push({
        title: cleanTitle,
        link: item.link || '',
        date: item.pubDate || item.isoDate || new Date().toISOString(),
        source: feed.source,
        flag: feed.flag,
        cat,
        category: cat, // NewsCard + admin için
        summary: (item.contentSnippet || '').replace(/\s+/g, ' ').slice(0, 250),
        isLive: true,
      });
    }
  }

  // Tarihe göre sırala
  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  const top = items.slice(0, 50);

  _cache = top;
  _cacheTime = now;

  return res.json({ items: top, fresh: true, updatedAt: new Date().toISOString() });
}
