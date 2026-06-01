// pages/index.js
import { useState } from "react";
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
  { id: "gundem", label: "Gündem", icon: "📰" },
  { id: "fikstur", label: "Fikstürler", icon: "📅" },
  { id: "transfer", label: "Transfer", icon: "🔄" },
  { id: "magazin", label: "Magazin", icon: "⭐" },
  { id: "dunya-kupasi", label: "Dünya Kupası", icon: "🌍" },
];

const FIXTURE_TABS = [
  { id: "live", label: "🔴 Canlı" },
  { id: "upcoming", label: "📆 Gelecek Maçlar" },
  { id: "past", label: "✓ Oynanan Maçlar" },
];

export default function Home({ data }) {
  const [tab, setTab] = useState("gundem");
  const [navHover, setNavHover] = useState(null);
  const [fixTab, setFixTab] = useState("upcoming");
  const [activeNews, setActiveNews] = useState(null);
  const [activeMatch, setActiveMatch] = useState(null);
  const [activeCountry, setActiveCountry] = useState(null);

  const news = data?.news || STATIC_NEWS;
  // matches: yeni yapı { live, upcoming, past }. Eski/statik fallback dizi olabilir.
  const rawMatches = data?.matches;
  const matches = (rawMatches && !Array.isArray(rawMatches))
    ? rawMatches
    : { live: [], upcoming: [], past: Array.isArray(rawMatches) ? rawMatches : STATIC_MATCHES };

  const updatedAt = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleString("tr-TR")
    : "Örnek veriler";

  const tickerItems = [
    ...(news.general?.slice(0, 3).map((n) => n.title) || []),
    ...(news.transfer?.slice(0, 2).map((n) => n.title) || []),
    "🌍 Dünya Kupası 11 Haziran'da başlıyor!",
    "🇹🇷 Türkiye, Grup D'de ABD, Avustralya ve Paraguay ile karşılaşacak",
  ];

  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const fixtureList = matches[fixTab] || [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Space+Mono:wght@400;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --yellow: #f0e614; --dark: #080808; --card: #0e0e0e;
          --border: #1c1c1c; --muted: #555; --text: #e8e8e8;
          --subtext: #888; --green: #2a9d4a; --red: #c0392b;
          --font-head: 'Playfair Display', serif;
          --font-mono: 'Space Mono', monospace; --font-body: 'Crimson Pro', Georgia, serif;
        }
        body { background: var(--dark); color: var(--text); font-family: var(--font-body); -webkit-font-smoothing: antialiased; }
        a { color: inherit; text-decoration: none; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: var(--yellow); }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes expand { from{opacity:0;max-height:0} to{opacity:1;max-height:400px} }
      `}</style>

      {/* Header */}
      <header style={{ background: "#0a0a0a", borderBottom: "3px solid var(--yellow)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #181818" }}>
            <span style={{ color: "#333", fontSize: "11px", fontFamily: "var(--font-mono)" }}>{today.toUpperCase()}</span>
            <span style={{ color: "#333", fontSize: "11px", fontFamily: "var(--font-mono)" }}>🟢 {updatedAt}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "14px 0 8px" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-head)", fontSize: "clamp(30px, 5vw, 54px)", fontWeight: "900", color: "#fff", letterSpacing: "-1px", lineHeight: 1 }}>
                GOL<span style={{ color: "var(--yellow)" }}>POST</span>
              </h1>
              <p style={{ color: "#2a2a2a", fontSize: "9px", marginTop: "4px", fontFamily: "var(--font-mono)", letterSpacing: "2.5px" }}>
                DÜNYA FUTBOL MAGAZİNİ
              </p>
            </div>
            <div style={{ display: "flex", gap: "5px", fontSize: "20px" }}>
              {["🏆","🏴󠁧󠁢󠁥󠁮󠁧󠁿","🇪🇸","🇩🇪","🇮🇹","🇫🇷","🇹🇷","🌍"].map((f, i) => <span key={i}>{f}</span>)}
            </div>
          </div>
          <nav style={{ display: "flex", borderTop: "1px solid #181818", overflowX: "auto" }}>
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => setTab(s.id)}
                onMouseEnter={() => setNavHover(s.id)} onMouseLeave={() => setNavHover(null)}
                style={{
                  background: tab === s.id ? "var(--yellow)" : "transparent",
                  color: tab === s.id ? "#0a0a0a" : navHover === s.id ? "#fff" : "var(--muted)",
                  border: "none", padding: "11px 20px", fontFamily: "var(--font-mono)", fontSize: "11px",
                  fontWeight: "700", cursor: "pointer", letterSpacing: "1px", transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0,
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
        {/* GÜNDEM */}
        {tab === "gundem" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <SectionHeader title="Gündem" subtitle="Dünyadan en güncel futbol haberleri" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2px" }}>
              {(news.general || []).map((item, i) => (
                <NewsCard key={i} {...item} isMain={i === 0} onOpen={() => setActiveNews(item)} />
              ))}
            </div>
          </div>
        )}

        {/* FİKSTÜR */}
        {tab === "fikstur" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <SectionHeader title="Fikstürler & Sonuçlar" subtitle="Maça tıkla — ücretsiz istatistiksel analiz & tahmin" />
            {/* alt sekmeler */}
            <div style={{ display: "flex", gap: "2px", marginBottom: "2px" }}>
              {FIXTURE_TABS.map((t) => {
                const count = (matches[t.id] || []).length;
                return (
                  <button key={t.id} onClick={() => setFixTab(t.id)}
                    style={{
                      flex: 1, background: fixTab === t.id ? "var(--yellow)" : "var(--card)",
                      color: fixTab === t.id ? "#0a0a0a" : "var(--muted)", border: "1px solid var(--border)",
                      padding: "11px 8px", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "700",
                      cursor: "pointer", letterSpacing: "0.5px",
                    }}>
                    {t.label} ({count})
                  </button>
                );
              })}
            </div>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              {fixtureList.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--muted)" }}>
                  {fixTab === "live" ? "Şu anda canlı maç yok." : "Bu kategoride maç bulunamadı."}
                </div>
              ) : (
                fixtureList.map((m, i) => <FixtureRow key={m.id || i} match={m} onOpenDetail={() => setActiveMatch(m)} />)
              )}
            </div>
          </div>
        )}

        {/* TRANSFER */}
        {tab === "transfer" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <SectionHeader title="Transfer Haberleri" subtitle="Transfer dünyasından son gelişmeler" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2px" }}>
              {(news.transfer?.length ? news.transfer : STATIC_NEWS.transfer).map((item, i) => (
                <NewsCard key={i} {...item} isMain={i === 0} onOpen={() => setActiveNews(item)} />
              ))}
            </div>
          </div>
        )}

        {/* MAGAZİN */}
        {tab === "magazin" && (
          <div style={{ animation: "fadeUp 0.3s ease both" }}>
            <SectionHeader title="Magazin" subtitle="Futbol dünyasından ilginç haberler" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2px" }}>
              {(news.magazine?.length ? news.magazine : STATIC_NEWS.magazine).map((item, i) => (
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
      {activeNews && <NewsModal item={activeNews} onClose={() => setActiveNews(null)} />}
      {activeMatch && <MatchModal match={activeMatch} onClose={() => setActiveMatch(null)} />}
      {activeCountry && <CountryModal country={activeCountry} onClose={() => setActiveCountry(null)} />}

      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px", textAlign: "center", color: "#222", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "1.5px" }}>
        GOALPOST © 2026 — TAMAMEN ÜCRETSİZ · BBC · SKY · GUARDIAN · ESPN · FOOTBALL-DATA.ORG
      </footer>
    </>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
      <h2 style={{ fontFamily: "var(--font-head)", fontSize: "28px", color: "#fff", marginBottom: "4px" }}>{title}</h2>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)", letterSpacing: "1px" }}>{subtitle}</p>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const filePath = path.join(process.cwd(), "public/data/football.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      return { props: { data }, revalidate: 3600 };
    }
  } catch (e) {
    console.warn("football.json okunamadı, statik veri kullanılıyor:", e.message);
  }
  return { props: { data: null }, revalidate: 3600 };
}
