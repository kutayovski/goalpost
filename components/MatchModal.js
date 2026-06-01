// components/MatchModal.js — maç detayı + ücretsiz istatistiksel analiz
import Modal from "./Modal";

function TeamCol({ name, crest }) {
  return (
    <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
      {crest ? (
        <img src={crest} alt={name} style={{ width: "64px", height: "64px", objectFit: "contain", marginBottom: "10px" }}
          onError={(e) => { e.target.style.display = "none"; }} />
      ) : (
        <div style={{ width: "64px", height: "64px", margin: "0 auto 10px", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>⚽</div>
      )}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "#eee", fontWeight: "700" }}>{name}</div>
    </div>
  );
}

export default function MatchModal({ match, onClose }) {
  if (!match) return null;
  const { home, away, homeCrest, awayCrest, score, halfTime, venue, referee, leagueName, leagueFlag, date, status, group, matchday, analysis } = match;

  const dateStr = date ? new Date(date).toLocaleString("tr-TR", { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" }) : "";
  const isLive = status === "IN_PLAY" || status === "PAUSED";
  const cleanScore = score || "vs";
  const prob = analysis?.winProbability;
  const fav = analysis?.favorite;

  const rows = [
    ["Lig", `${leagueFlag} ${leagueName}`],
    venue && ["Stadyum", venue],
    halfTime && ["İlk Yarı", halfTime],
    referee && ["Hakem", referee],
    group && ["Grup", group],
    matchday && ["Hafta", String(matchday)],
    ["Tarih", dateStr],
  ].filter(Boolean);

  return (
    <Modal onClose={onClose} maxWidth="580px">
      <div style={{ padding: "30px 26px 8px" }}>
        <div style={{ textAlign: "center", marginBottom: "6px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "2px", color: isLive ? "#fff" : "var(--yellow)", background: isLive ? "var(--red)" : "transparent", padding: isLive ? "3px 10px" : 0 }}>
            {isLive ? "🔴 CANLI" : status === "FINISHED" ? "MAÇ SONUCU" : "YAKLAŞAN MAÇ"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "16px 0 22px" }}>
          <TeamCol name={home} crest={homeCrest} />
          <div style={{ textAlign: "center", paddingTop: "16px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "30px", fontWeight: "800", color: isLive ? "#e74c3c" : "var(--yellow)", whiteSpace: "nowrap" }}>{cleanScore}</div>
          </div>
          <TeamCol name={away} crest={awayCrest} />
        </div>
      </div>

      {/* Analiz (varsa) */}
      {prob && (
        <div style={{ padding: "0 26px 18px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--yellow)", letterSpacing: "1.5px", marginBottom: "8px" }}>📊 İSTATİSTİKSEL TAHMİN</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: "11px", marginBottom: "5px" }}>
            <span style={{ color: "var(--green)", fontWeight: "700" }}>{fav === "home" && "⭐ "}{prob.home}%</span>
            <span style={{ color: "#888" }}>{prob.draw}%</span>
            <span style={{ color: "var(--red)", fontWeight: "700" }}>{prob.away}%{fav === "away" && " ⭐"}</span>
          </div>
          <div style={{ display: "flex", height: "20px", borderRadius: "3px", overflow: "hidden", marginBottom: "12px" }}>
            <div style={{ width: `${prob.home}%`, background: "var(--green)" }} />
            <div style={{ width: `${prob.draw}%`, background: "#555" }} />
            <div style={{ width: `${prob.away}%`, background: "var(--red)" }} />
          </div>
          {analysis.text && (
            <div style={{ borderLeft: "3px solid var(--yellow)", background: "#0a0a0a", padding: "10px 14px", fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: "13px", color: "#ddd", lineHeight: 1.6 }}>
              {analysis.text}
            </div>
          )}
        </div>
      )}

      <div style={{ borderTop: "1px solid var(--border)" }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 26px", borderBottom: "1px solid #161616" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)", letterSpacing: "1px" }}>{k.toUpperCase()}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#ddd", textAlign: "right" }}>{v}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
