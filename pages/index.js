// pages/index.js
import { useState, useEffect, useRef } from "react";
import fs from "fs";
import path from "path";
import NewsCard from "../components/NewsCard";
import FixtureRow from "../components/FixtureRow";
import WorldCupTab from "../components/WorldCupTab";
import NewsModal from "../components/NewsModal";
import MatchModal from "../components/MatchModal";
import CountryModal from "../components/CountryModal";
import { STATIC_NEWS, STATIC_MATCHES } from "../lib/staticData";

const SECTIONS = [
  { id: "corumsporhaber", label: "Çorum FK", icon: "🔴⚫" },
  { id: "gundem",         label: "Gündem",   icon: "📰" },
  { id: "milli",          label: "Milli Takım", icon: "🇹🇷" },
  { id: "superlig",       label: "Süper Lig", icon: "🏟️" },
  { id: "fikstur",        label: "Fikstürler", icon: "📅" },
  { id: "transfer",       label: "Transfer",  icon: "🔄" },
  { id: "dunya-kupasi",   label: "Dünya Kupası", icon: "🌍" },
];

const FIXTURE_TABS = [
  { id: "live",     label: "🔴 Canlı" },
  { id: "upcoming", label: "📆 Gelecek Maçlar" },
  { id: "past",     label: "✓ Oynanan Maçlar" },
];

export default function Home({ data }) {
  const [tab, setTab]           = useState("gundem");
  const [navHover, setNavHover] = useState(null);
  const [fixTab, setFixTab]     = useState("upcoming");
  const [activeNews, setActiveNews]       = useState(null);
  const [activeMatch, setActiveMatch]     = useState(null);
  const [activeCountry, setActiveCountry] = useState(null);

  // ── Canlı tarih/saat ─────────────────────────────────────────────────────
  const [today, setToday]       = useState("");
  const [liveTime, setLiveTime] = useState("");
  const [mounted, setMounted]   = useState(false);

  // ── Canlı haber polling (her 5 dakikada bir) ─────────────────────────────
  const [liveNews, setLiveNews]     = useState({});
  const [liveUpdated, setLiveUpdated] = useState("");
  const pollRef = useRef(null);

  useEffect(() => {
    // Saat
    setMounted(true);
    const tick = () => {
      const now = new Date();
      setToday(now.toLocaleDateString("tr-TR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      }));
      setLiveTime(now.toLocaleTimeString("tr-TR", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      }));
    };
    tick();
    const clockT = setInterval(tick, 1000);

    // Canlı haber çek
    const fetchLive = async () => {
      try {
        const r = await fetch("/api/live-news");
        if (!r.ok) return;
        const d = await r.json();
        if (!d.items?.length) return;
        // Kategorilere göre grupla
        const grouped = {};
        for (const item of d.items) {
          if (!grouped[item.cat]) grouped[item.cat] = [];
          grouped[item.cat].push(item);
        }
        setLiveNews(grouped);
        setLiveUpdated(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
      } catch (e) { /* sessizce geç */ }
    };
    fetchLive(); // ilk yükleme
    pollRef.current = setInterval(fetchLive, 5 * 60 * 1000); // her 5 dk

    return () => {
      clearInterval(clockT);
      clearInterval(pollRef.current);
    };
  }, []);

  const CORUM_BADGE_URL = "https://upload.wikimedia.org/wikipedia/tr/3/37/%C3%87orum_FK.png";
  // Ham statik veri: Çorum FK'da Unsplash görselleri logoyla değiştir
  const rawStaticNews = data?.news || {};
  const staticNews = {
    ...rawStaticNews,
    corumsporhaber: (rawStaticNews.corumsporhaber || []).map(n => ({
      ...n,
      image: n.image?.includes("unsplash") ? CORUM_BADGE_URL : n.image,
    })),
  };

  // ── Haber birleştirme: static(görsel) + live(taze) ──────────────────────────
  // Kural:
  //   1. Static haberler 30 günden eskiyse gösterilmez (eski transfer/superlig haberleri)
  //   2. Live haberlerin kendi görseli varsa kullanılır; yoksa static eşleşmesinden alınır
  //   3. Tümü tarihe göre sıralanır (en yeni önce)
  const STATIC_MAX_AGE_MS = 30 * 24 * 3600_000; // 30 gün
  const mergeNews = (cat) => {
    const live    = liveNews[cat]   || [];
    const static_ = staticNews[cat] || [];

    // 30 günden eski static haberler filtrele (en az 3 bırak)
    const cutoff = Date.now() - STATIC_MAX_AGE_MS;
    let freshStatic = static_.filter(n => !n.date || new Date(n.date).getTime() > cutoff);
    if (freshStatic.length < 3 && static_.length > 0) {
      freshStatic = [...static_].sort((a, b) => new Date(b.date||0) - new Date(a.date||0)).slice(0, 3);
    }

    // Static'i başlık prefix ile hızlı ara
    const staticByKey = new Map(freshStatic.map(n => [n.title.slice(0, 30).toLowerCase(), n]));

    // Live haberler: görsel yoksa eşleşen static'ten al
    const processedLive = live.map(n => {
      const key   = n.title.slice(0, 30).toLowerCase();
      const match = staticByKey.get(key);
      const image = n.image || (match ? match.image : null);
      const summary = n.summary || (match ? match.summary : '');
      return { ...(match || {}), ...n, image, summary };
    });

    // Deduplicate: live'da var olan static'leri çıkar
    const liveKeys = new Set(processedLive.map(n => n.title.slice(0, 30).toLowerCase()));
    const remainingStatic = freshStatic.filter(n => !liveKeys.has(n.title.slice(0, 30).toLowerCase()));

    // Birleştir ve tarihle sırala
    const all = [...processedLive, ...remainingStatic];
    all.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return all;
  };

  const news = {
    corumsporhaber: mergeNews("corumsporhaber"),
    milli:          mergeNews("milli"),
    superlig:       mergeNews("superlig"),
    transfer:       mergeNews("transfer"),
    worldcup:       mergeNews("worldcup"),
    general:        mergeNews("general"),
    magazine:       staticNews.magazine || [],
  };

  const rawMatches = data?.matches;
  const staticMatches = (rawMatches && !Array.isArray(rawMatches))
    ? rawMatches
    : { live: [], upcoming: [], past: Array.isArray(rawMatches) ? rawMatches : STATIC_MATCHES };

  // Canlı maç state — /api/live-matches her 60 sn'de poll edilir
  const [liveFixtures, setLiveFixtures] = useState(null);
  const matchPollRef = useRef(null);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const r = await fetch("/api/live-matches");
        if (!r.ok) return;
        const d = await r.json();
        // d.matches null bile olsa (API key yok) boş set ile liveFixtures'ı başlat
        setLiveFixtures(d.matches || { live: [], upcoming: [], past: [] });
      } catch (e) { /* sessizce geç */ }
    };
    fetchLive();
    matchPollRef.current = setInterval(fetchLive, 60_000);
    return () => clearInterval(matchPollRef.current);
  }, []);

  // Canlı API (skor/durum güncel) + statik veri (form/analiz zengin) MERGE:
  // ID bazlı: statik temel, canlı API üstüne yazar
  const mergeMatchArrays = (fresh, static_, sortFn) => {
    const map = new Map();
    for (const m of (static_ || [])) map.set(m.id, m);
    for (const m of (fresh   || [])) map.set(m.id, { ...(map.get(m.id) || {}), ...m });
    return [...map.values()].sort(sortFn);
  };

  const liveIds = new Set((liveFixtures?.live || []).map(m => m.id));

  // Stale IN_PLAY filtresi: API gelmeden (veya API key yoksa) static live kullanılırken
  // 3.5 saatten eski "canlı" maçları gösterme
  const filterStaleLive = (arr) => (arr || []).filter(m => {
    if (m.status !== "IN_PLAY" && m.status !== "PAUSED") return false;
    return Date.now() - new Date(m.date).getTime() < 3.5 * 3600_000;
  });

  const matches = {
    live: liveFixtures
      ? liveFixtures.live.map(lm => {
          const s = staticMatches.upcoming?.find(u => u.id === lm.id)
                 || staticMatches.past?.find(p => p.id === lm.id);
          return s ? { ...s, ...lm } : lm;
        })
      : filterStaleLive(staticMatches.live),
    upcoming: mergeMatchArrays(
      liveFixtures?.upcoming,
      (staticMatches.upcoming || []).filter(m => !liveIds.has(m.id)),
      (a, b) => new Date(a.date) - new Date(b.date)
    ),
    past: mergeMatchArrays(
      liveFixtures?.past?.slice(0, 40),
      staticMatches.past,
      (a, b) => new Date(b.date) - new Date(a.date)
    ),
  };

  const updatedAt = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleString("tr-TR")
    : "Örnek veriler";

  const tickerItems = [
    ...(news.corumsporhaber?.slice(0, 2).map(n => n.title) || []),
    ...(news.general?.slice(0, 2).map(n => n.title) || []),
    ...(news.milli?.slice(0, 1).map(n => n.title) || []),
    "🌍 Dünya Kupası 11 Haziran'da başlıyor!",
    "🔴⚫ Çorum FK Süper Lig'de!",
  ];

  const fixtureList = matches[fixTab] || [];

  // Gündem = general + magazine birleşimi
  const gundemItems = [
    ...(news.general || STATIC_NEWS.general || []),
    ...(news.magazine || []),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      {/* Header */}
      <header style={{ background: "#0a0a0a", borderBottom: "3px solid var(--yellow)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #181818" }}>
            {/* Canlı tarih — sadece mounted sonrası (hydration mismatch yok) */}
            <span style={{ color: "#444", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
              {mounted ? today.toUpperCase() : ""}
            </span>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              {/* Canlı saat */}
              {mounted && (
                <span style={{ color: "var(--yellow)", fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: "700", letterSpacing: "1px" }}>
                  🕐 {liveTime}
                </span>
              )}
              {liveUpdated ? (
                <span style={{ color: "#2a9d4a", fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: "700" }}>
                  🟢 CANLI · {liveUpdated}
                </span>
              ) : (
                <span style={{ color: "#333", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                  🟢 {mounted ? updatedAt : ""}
                </span>
              )}
              <a href="/admin" style={{ color: "var(--yellow)", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "1px" }}>
                🐦 TWEET PANELİ
              </a>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "14px 0 8px" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-head)", fontSize: "clamp(28px, 5vw, 52px)", fontWeight: "900", color: "#fff", letterSpacing: "-1px", lineHeight: 1 }}>
                GOL<span style={{ color: "var(--yellow)" }}>POST</span>
              </h1>
              <p style={{ color: "#2a2a2a", fontSize: "9px", marginTop: "4px", fontFamily: "var(--font-mono)", letterSpacing: "2.5px" }}>
                DÜNYA FUTBOL MAGAZİNİ
              </p>
            </div>
            <div style={{ display: "flex", gap: "5px", fontSize: "18px" }}>
              {["🔴⚫","🏆","🏴󠁧󠁢󠁥󠁮󠁧󠁿","🇪🇸","🇩🇪","🇮🇹","🇹🇷","🌍"].map((f, i) => <span key={i}>{f}</span>)}
            </div>
          </div>
          <nav style={{ display: "flex", borderTop: "1px solid #181818", overflowX: "auto" }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setTab(s.id)}
                onMouseEnter={() => setNavHover(s.id)} onMouseLeave={() => setNavHover(null)}
                style={{
                  background: tab === s.id ? (s.id === "corumsporhaber" ? "#e30a17" : "var(--yellow)") : "transparent",
                  color: tab === s.id ? "#fff" : navHover === s.id ? "#fff" : "var(--muted)",
                  border: "none", padding: "11px 16px", fontFamily: "var(--font-mono)", fontSize: "10px",
                  fontWeight: "700", cursor: "pointer", letterSpacing: "0.8px", transition: "all 0.15s",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}>
                {s.icon} {s.label.toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Ticker */}
      <div style={{ background: "var(--yellow)", overflow: "hidden", padding: "9px 0", borderBottom: "2px solid #111" }}>
        <div style={{ display: "inline-block", whiteSpace: "nowrap", animation: "ticker 45s linear infinite" }}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} style={{ marginRight: "80px", fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: "700", color: "#111" }}>
              ⚽ {item}
            </span>
          ))}
        </div>
      </div>

      {/* Main */}
      <main style={{ maxWidth: "1120px", margin: "0 auto", padding: "24px 20px 48px" }}>

        {/* ÇORUM FK */}
        {tab === "corumsporhaber" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <SectionHeader
              title="🔴⚫ Çorum FK"
              subtitle="Trendyol Süper Lig · Çorum Futbol Kulübü haberleri"
              accent="#e30a17"
            />
            {(news.corumsporhaber || []).length === 0 ? (
              <EmptyState cat="Çorum FK" />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2px" }}>
                {(news.corumsporhaber || []).map((item, i) => (
                  <NewsCard key={i} {...item} isMain={i === 0} onOpen={() => setActiveNews(item)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* GÜNDEM */}
        {tab === "gundem" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <SectionHeader title="Gündem" subtitle="Dünyadan en güncel futbol haberleri" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2px" }}>
              {gundemItems.map((item, i) => (
                <NewsCard key={i} {...item} isMain={i === 0} onOpen={() => setActiveNews(item)} />
              ))}
            </div>
          </div>
        )}

        {/* MİLLİ TAKIM */}
        {tab === "milli" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <SectionHeader title="🇹🇷 Milli Takım" subtitle="Türkiye A Milli Futbol Takımı haberleri" accent="#e30a17" />
            {(news.milli || []).length === 0 ? <EmptyState cat="Milli Takım" /> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2px" }}>
                {(news.milli || []).map((item, i) => (
                  <NewsCard key={i} {...item} isMain={i === 0} onOpen={() => setActiveNews(item)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* SÜPER LİG */}
        {tab === "superlig" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <SectionHeader title="🏟️ Süper Lig" subtitle="Trendyol Süper Lig haberleri" />
            {(news.superlig || []).length === 0 ? <EmptyState cat="Süper Lig" /> : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2px" }}>
                {(news.superlig || []).map((item, i) => (
                  <NewsCard key={i} {...item} isMain={i === 0} onOpen={() => setActiveNews(item)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* FİKSTÜR */}
        {tab === "fikstur" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <SectionHeader
              title="Fikstürler & Sonuçlar"
              subtitle={
                liveFixtures
                  ? `Gerçek zamanlı · ${new Date(liveFixtures.fetchedAt || Date.now()).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} itibarıyla · Maça tıkla → istatistiksel analiz`
                  : "Maça tıkla — istatistiksel analiz & tahmin"
              }
            />

            {/* Canlı maç varsa uyarı bandı */}
            {matches.live.length > 0 && (
              <div style={{
                background: "#1a0000", border: "1px solid #500",
                borderLeft: "4px solid #c0392b",
                padding: "10px 16px", marginBottom: "2px",
                fontFamily: "var(--font-mono)", fontSize: "11px", color: "#e55",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <span style={{ animation: "pulse 1.5s ease-in-out infinite" }}>🔴</span>
                <span>{matches.live.length} maç şu anda oynuyor — her 60 saniyede güncelleniyor</span>
              </div>
            )}

            <div style={{ display: "flex", gap: "2px", marginBottom: "2px" }}>
              {FIXTURE_TABS.map(t => {
                const count = (matches[t.id] || []).length;
                return (
                  <button key={t.id} onClick={() => setFixTab(t.id)}
                    style={{
                      flex: 1, background: fixTab === t.id ? "var(--yellow)" : "var(--card)",
                      color: fixTab === t.id ? "#0a0a0a" : "var(--muted)", border: "1px solid var(--border)",
                      padding: "11px 8px", fontFamily: "var(--font-mono)", fontSize: "11px",
                      fontWeight: "700", cursor: "pointer",
                      position: "relative",
                    }}>
                    {t.label} ({count})
                    {t.id === "live" && count > 0 && (
                      <span style={{
                        position: "absolute", top: "4px", right: "4px",
                        width: "6px", height: "6px", borderRadius: "50%",
                        background: "#c0392b",
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              {fixtureList.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--muted)" }}>
                  {fixTab === "live"
                    ? liveFixtures
                      ? "Şu anda takip edilen liglerde canlı maç yok."
                      : "Canlı maçlar yükleniyor..."
                    : "Bu kategoride maç bulunamadı."}
                </div>
              ) : (
                fixtureList.map((m, i) => <FixtureRow key={m.id || i} match={m} onOpenDetail={() => setActiveMatch(m)} />)
              )}
            </div>

            {fixTab === "live" && liveFixtures && (
              <div style={{ textAlign: "right", padding: "6px 4px 0", fontFamily: "var(--font-mono)", fontSize: "9px", color: "#2a2a2a" }}>
                Son güncelleme: {new Date(liveFixtures.fetchedAt).toLocaleTimeString("tr-TR")} · PL · LaLiga · Bundesliga · SerieA · Ligue1 · CL
              </div>
            )}
          </div>
        )}

        {/* TRANSFER */}
        {tab === "transfer" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <SectionHeader title="Transfer Haberleri" subtitle="Transfer dünyasından son gelişmeler" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2px" }}>
              {(news.transfer?.length ? news.transfer : STATIC_NEWS.transfer || []).map((item, i) => (
                <NewsCard key={i} {...item} isMain={i === 0} onOpen={() => setActiveNews(item)} />
              ))}
            </div>
          </div>
        )}

        {/* DÜNYA KUPASI */}
        {tab === "dunya-kupasi" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <SectionHeader title="Dünya Kupası 2026" subtitle="ABD · Kanada · Meksika · 11 Haziran – 19 Temmuz" />
            <WorldCupTab
              news={news.worldcup || []}
              wcMatches={data?.worldCup?.matches}
              onCountry={setActiveCountry}
              onNews={setActiveNews}
              onMatch={setActiveMatch}
            />
          </div>
        )}
      </main>

      {/* Modallar */}
      {activeNews    && <NewsModal    item={activeNews}       onClose={() => setActiveNews(null)} />}
      {activeMatch   && <MatchModal   match={activeMatch}     onClose={() => setActiveMatch(null)} />}
      {activeCountry && <CountryModal country={activeCountry} onClose={() => setActiveCountry(null)} />}

      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px", textAlign: "center", color: "#222", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "1.5px" }}>
        GOALPOST © 2026 — TAMAMEN ÜCRETSİZ · BBC · SKY · GUARDIAN · ESPN · FOTOMAÇ · FOOTBALL-DATA.ORG
      </footer>
    </>
  );
}

function SectionHeader({ title, subtitle, accent }) {
  return (
    <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: `2px solid ${accent || "var(--yellow)"}` }}>
      <h2 style={{ fontFamily: "var(--font-head)", fontSize: "28px", color: "#fff", marginBottom: "4px" }}>{title}</h2>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)", letterSpacing: "1px" }}>{subtitle}</p>
    </div>
  );
}

function EmptyState({ cat }) {
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "40px", textAlign: "center",
      fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--muted)", letterSpacing: "1px" }}>
      {cat} haberleri için veri güncellenmesi bekleniyor.<br />
      <span style={{ fontSize: "10px", marginTop: "8px", display: "block", color: "#333" }}>
        GitHub Actions her gün 4 kez otomatik günceller.
      </span>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const filePath = path.join(process.cwd(), "public/data/football.json");
    if (fs.existsSync(filePath)) {
      const raw  = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      return { props: { data }, revalidate: 3600 };
    }
  } catch (e) {
    console.warn("football.json okunamadı:", e.message);
  }
  return { props: { data: null }, revalidate: 3600 };
}
