// lib/sportsdb.js — tarayıcı tarafı oyuncu/menajer fotoğrafı
// Birincil kaynak: Wikipedia (TR) REST — güncel ve geniş kapsam (Kenan Yıldız, Montella dahil)
// Yedek: TheSportsDB. İkisi de anahtarsız ve ücretsiz. CORS açık.

const cache = new Map();

async function fromWikipedia(query) {
  try {
    const res = await fetch(
      `https://tr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.type === "disambiguation") return null;
    return data.thumbnail?.source || data.originalimage?.source || null;
  } catch (e) {
    return null;
  }
}

async function fromSportsDB(query) {
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    const p = data.player && data.player[0];
    return p ? p.strCutout || p.strThumb || null : null;
  } catch (e) {
    return null;
  }
}

// query: tercihen Türkçe Wikipedia başlığı (ör. "Kenan Yıldız")
export async function getPlayerPhoto(query) {
  if (!query) return null;
  if (cache.has(query)) return cache.get(query);
  let photo = await fromWikipedia(query);
  if (!photo) photo = await fromSportsDB(query);
  cache.set(query, photo);
  return photo;
}
