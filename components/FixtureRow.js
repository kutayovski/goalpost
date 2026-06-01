// components/FixtureRow.js
// Maça tıklanınca ücretsiz istatistiksel analiz paneli açılır (expand/collapse).
import { useState } from "react";

export default function FixtureRow({ match, onOpenDetail }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const {
    home, away, date, status, score, leagueName, leagueFlag,
    homeCrest, awayCrest, analysis,
  } = match;

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    });
  };

  const isLive = status === "IN_PLAY" || status === "PAUSED";
  const prob = analysis?.winProbability;
  const fav = analysis?.favorite;

  const FormDots = ({ form }) => (
    <span style={{ display: "inline-flex", gap: "3px", marginLeft: "6px" }}>
      {(form || []).map((r, i) => (
        <span key={i} title={r} style={{
          width: "14px", height: "14px", borderRadius: "2px", fontSize: "9px",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-mono)", fontWeight: "700", color: "#fff",
          background: r === "W" ? "var(--green)" : r === "D" ? "#777" : "var(--red)",
        }}>{r === "W" ? "G" : r === "D" ? "B" : "M"}</span>
      ))}
    </span>
  );

  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      {/* Satır */}
      <div
        onClick={() => setExpanded((v) => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "grid", gridTemplateColumns: "1fr 130px 1fr", alignItems: "center",
          padding: "14px 20px", background: hovered ? "#131313" : "transparent",
          transition: "background 0.15s", cursor: "pointer",
        }}
      >
        {/* Ev sahibi */}
        <div style={{ textAlign: "right", paddingRight: "14px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "#ccc", fontWeight: isLive ? "700" : "400" }}>{home}</span>
          {homeCrest && <img src={homeCrest} alt="" style={{ width: "20px", height: "20px", objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />}
        </div>

        {/* Skor / Saat */}
        <div style={{ textAlign: "center" }}>
          {score ? (
            <span style={{
              background: isLive ? "var(--red)" : "var(--yellow)", color: isLive ? "#fff" : "#0a0a0a",
              padding: "4px 12px", fontFamily: "var(--font-mono)", fontWeight: "800", fontSize: "13px",
              letterSpacing: "1px", display: "inline-block",
            }}>{score}{isLive ? " 🔴" : ""}</span>
          ) : (
            <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>{formatDate(date)}</span>
          )}
          <div style={{ marginTop: "3px", color: "#333", fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.5px" }}>
            {leagueFlag} {leagueName}
          </div>
        </div>

        {/* Deplasman */}
        <div style={{ textAlign: "left", paddingLeft: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          {awayCrest && <img src={awayCrest} alt="" style={{ width: "20px", height: "20px", objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "#ccc", fontWeight: isLive ? "700" : "400" }}>{away}</span>
          {analysis && (
            <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "10px", color: hovered ? "var(--yellow)" : "var(--muted)" }}>
              {expanded ? "▲ analiz" : "▼ analiz"}
            </span>
          )}
        </div>
      </div>

      {/* Analiz paneli */}
      {expanded && (
        <div style={{ padding: "4px 20px 20px", animation: "expand 0.25s ease both", overflow: "hidden" }}>
          {!analysis ? (
            <div style={{ padding: "16px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)" }}>
              Bu maç için analiz verisi henüz hazır değil (oynanmış maçlarda tahmin gösterilmez).
            </div>
          ) : (
            <>
              {/* Yüzde barı */}
              <div style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: "11px", marginBottom: "5px" }}>
                  <span style={{ color: "var(--green)", fontWeight: "700" }}>
                    {fav === "home" && "⭐ "}{prob.home}% {home}
                  </span>
                  <span style={{ color: "#888" }}>{fav === "draw" && "⭐ "}Beraberlik {prob.draw}%</span>
                  <span style={{ color: "var(--red)", fontWeight: "700" }}>
                    {away} {prob.away}%{fav === "away" && " ⭐"}
                  </span>
                </div>
                <div style={{ display: "flex", height: "22px", borderRadius: "3px", overflow: "hidden", border: "1px solid #000" }}>
                  <div style={{ width: `${prob.home}%`, background: "var(--green)", transition: "width 0.4s" }} />
                  <div style={{ width: `${prob.draw}%`, background: "#555", transition: "width 0.4s" }} />
                  <div style={{ width: `${prob.away}%`, background: "var(--red)", transition: "width 0.4s" }} />
                </div>
              </div>

              {/* Form satırları */}
              {(analysis.homeForm?.length || analysis.awayForm?.length) ? (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center" }}>{home} formu <FormDots form={analysis.homeForm} /></span>
                  <span style={{ display: "inline-flex", alignItems: "center" }}>{away} formu <FormDots form={analysis.awayForm} /></span>
                </div>
              ) : null}

              {/* Analiz metni */}
              <div style={{
                borderLeft: "3px solid var(--yellow)", background: "#0a0a0a", padding: "12px 16px",
                fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: "14px",
                color: "#ddd", lineHeight: 1.6,
              }}>
                {analysis.text}
              </div>

              {/* Favori rozeti + detay */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                <span style={{
                  background: fav === "home" ? "var(--green)" : fav === "away" ? "var(--red)" : "#555",
                  color: "#fff", fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "700",
                  padding: "4px 10px", letterSpacing: "0.5px",
                }}>
                  ⭐ FAVORİ: {fav === "home" ? home : fav === "away" ? away : "BERABERLİK"}
                </span>
                <button onClick={(e) => { e.stopPropagation(); onOpenDetail && onOpenDetail(); }}
                  style={{
                    background: "transparent", border: "1px solid var(--border)", color: "var(--yellow)",
                    fontFamily: "var(--font-mono)", fontSize: "10px", padding: "5px 12px", cursor: "pointer", letterSpacing: "0.5px",
                  }}>
                  MAÇ DETAYI →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
