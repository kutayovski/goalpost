// components/WorldCupTab.js
import { useState } from "react";
import { WC_GROUPS, WC_INFO } from "../lib/worldCupData";
import Countdown from "./Countdown";
import NewsCard from "./NewsCard";
import FixtureRow from "./FixtureRow";
import TurkeySection from "./TurkeySection";

export default function WorldCupTab({ news = [], wcMatches, onCountry, onNews, onMatch }) {
  const [view, setView] = useState("groups");

  const upcoming = wcMatches?.upcoming || [];
  const past = wcMatches?.past || [];

  const subTabs = [
    { id: "groups", label: "Gruplar" },
    { id: "fixtures", label: "Fikstür" },
    { id: "bizim", label: "🇹🇷 Bizim Çocuklar" },
    { id: "news", label: "Haberler" },
  ];

  return (
    <div>
      <Countdown />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0d1a0d 0%, #0a0a0a 100%)", border: "1px solid #1a2a1a", borderLeft: "4px solid var(--yellow)", padding: "22px 24px", marginBottom: "2px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--yellow)", letterSpacing: "2px", marginBottom: "8px" }}>🏆 FIFA DÜNYA KUPASI 2026</p>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: "26px", color: "#fff", marginBottom: "10px" }}>ABD · Kanada · Meksika</h2>
            <p style={{ color: "var(--subtext)", fontSize: "13px", fontFamily: "var(--font-body)", lineHeight: "1.65" }}>
              {WC_INFO.totalTeams} takım · {WC_INFO.totalMatches} maç · 39 gün · 11 Haziran – 19 Temmuz 2026
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {[["Takım", `${WC_INFO.totalTeams}`], ["Maç", `${WC_INFO.totalMatches}`], ["Ev Sahibi", "3 Ülke"], ["Final", "MetLife, NJ"]].map(([label, value]) => (
              <div key={label} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "1px", width: "60px" }}>{label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--yellow)", fontWeight: "700" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-nav */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "2px", overflowX: "auto" }}>
        {subTabs.map((t) => (
          <button key={t.id} onClick={() => setView(t.id)}
            style={{
              background: view === t.id ? "var(--yellow)" : "transparent",
              color: view === t.id ? "#0a0a0a" : "var(--muted)", border: "none", padding: "10px 18px",
              fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "700", cursor: "pointer",
              letterSpacing: "1px", whiteSpace: "nowrap", flexShrink: 0,
            }}>
            {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Groups */}
      {view === "groups" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "2px" }}>
          {WC_GROUPS.map((g) => (
            <div key={g.name} style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "16px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "700", color: "var(--yellow)", letterSpacing: "1.5px", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                {g.name.toUpperCase()}
              </div>
              {g.teams.map((team, i) => (
                <div key={i} onClick={() => onCountry && onCountry({ ...team, group: g.name })}
                  style={{ display: "flex", alignItems: "center", gap: "9px", padding: "7px 0", cursor: "pointer", borderBottom: i < g.teams.length - 1 ? "1px solid #161616" : "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#161616")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  {team.iso && <img src={`https://flagcdn.com/w40/${team.iso}.png`} alt="" style={{ width: "22px", height: "auto", flexShrink: 0 }} />}
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", flex: 1, color: team.highlight ? "var(--yellow)" : team.star ? "#fff" : "var(--subtext)", fontWeight: team.highlight || team.star ? "700" : "400" }}>{team.name}</span>
                  {team.host && <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "#2a7a2a", background: "#0d1f0d", padding: "1px 5px" }}>EV</span>}
                  {team.star && !team.host && <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--yellow)", opacity: 0.7 }}>★</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Real fixtures from API */}
      {view === "fixtures" && (
        <div>
          {upcoming.length === 0 && past.length === 0 ? (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "40px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--muted)" }}>
              Fikstür yükleniyor… (GitHub Actions günde güncelliyor)
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", marginBottom: "12px" }}>
                  <div style={{ padding: "13px 20px", borderBottom: "2px solid var(--yellow)", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "700", color: "var(--yellow)", letterSpacing: "2px" }}>📆 YAKLAŞAN MAÇLAR</div>
                  {upcoming.slice(0, 20).map((m, i) => <FixtureRow key={m.id || i} match={m} onOpenDetail={() => onMatch && onMatch(m)} />)}
                </div>
              )}
              {past.length > 0 && (
                <div style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <div style={{ padding: "13px 20px", borderBottom: "2px solid var(--yellow)", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "700", color: "var(--yellow)", letterSpacing: "2px" }}>✓ OYNANAN MAÇLAR</div>
                  {past.slice(0, 20).map((m, i) => <FixtureRow key={m.id || i} match={m} onOpenDetail={() => onMatch && onMatch(m)} />)}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Bizim Çocuklar */}
      {view === "bizim" && <TurkeySection />}

      {/* News */}
      {view === "news" && (
        <div>
          {news.length === 0 ? (
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "40px", textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--muted)", fontSize: "12px", letterSpacing: "1px" }}>
              Dünya Kupası haberleri yükleniyor...
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2px" }}>
              {news.map((item, i) => <NewsCard key={i} {...item} isMain={i === 0} onOpen={() => onNews && onNews(item)} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
