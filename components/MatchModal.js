// components/MatchModal.js — maç detayı + istatistiksel analiz
import Modal from "./Modal";
import { calculateWinProbabilityFromMatch, generateAnalysisText, getFavorite } from "../lib/analysis";

function TeamCol({ name, crest, form }) {
  return (
    <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
      {crest ? (
        <img src={crest} alt={name}
          style={{ width: "64px", height: "64px", objectFit: "contain", marginBottom: "10px" }}
          onError={e => { e.target.style.display = "none"; }} />
      ) : (
        <div style={{ width: "64px", height: "64px", margin: "0 auto 10px", background: "#1a1a1a",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>⚽</div>
      )}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "#eee", fontWeight: "700" }}>
        {name}
      </div>
      {form && form.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "3px", marginTop: "8px" }}>
          {form.map((r, i) => (
            <span key={i} style={{
              width: "15px", height: "15px", borderRadius: "50%",
              background: r === "W" ? "#2a9d4a" : r === "D" ? "#888" : "#c0392b",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: "8px", fontWeight: "700", color: "#fff",
            }}>
              {r === "W" ? "G" : r === "D" ? "B" : "M"}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MatchModal({ match, onClose }) {
  if (!match) return null;
  const {
    home, away, homeCrest, awayCrest, score, halfTime,
    venue, referee, leagueName, leagueFlag, date, status,
    group, matchday, analysis,
    homeForm, awayForm, homeGoalAvg, awayGoalAvg, headToHead,
  } = match;

  const dateStr = date
    ? new Date(date).toLocaleString("tr-TR", {
        weekday: "long", day: "2-digit", month: "long",
        hour: "2-digit", minute: "2-digit",
      })
    : "";
  const isLive     = status === "IN_PLAY" || status === "PAUSED";
  const isFinished = match.timeframe === "past" || status === "FINISHED";
  const cleanScore = score || "vs";

  // Olasılık: form verisi varsa yeni hesaplama, yoksa önceden saklanmış analiz
  const hasForm = homeForm?.length || awayForm?.length;
  const prob = hasForm
    ? calculateWinProbabilityFromMatch(match)
    : analysis?.winProbability || null;
  const fav  = prob ? getFavorite(prob) : analysis?.favorite;
  const analysisText = hasForm && prob
    ? generateAnalysisText(match, prob)
    : analysis?.text || null;

  const rows = [
    ["Lig",     `${leagueFlag} ${leagueName}`],
    venue    && ["Stadyum",  venue],
    halfTime && ["İlk Yarı", halfTime],
    referee  && ["Hakem",    referee],
    group    && ["Grup",     group],
    matchday && ["Hafta",    String(matchday)],
    ["Tarih",   dateStr],
  ].filter(Boolean);

  return (
    <Modal onClose={onClose} maxWidth="600px">
      {/* Başlık */}
      <div style={{ padding: "26px 26px 0" }}>
        <div style={{ textAlign: "center", marginBottom: "6px" }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "2px",
            color: isLive ? "#fff" : "var(--yellow)",
            background: isLive ? "var(--red)" : "transparent",
            padding: isLive ? "3px 10px" : 0,
          }}>
            {isLive ? "🔴 CANLI" : isFinished ? "MAÇ SONUCU" : "YAKLAŞAN MAÇ"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "16px 0 18px" }}>
          <TeamCol name={home} crest={homeCrest} form={homeForm} />
          <div style={{ textAlign: "center", paddingTop: "10px" }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: "30px", fontWeight: "800",
              color: isLive ? "#e74c3c" : "var(--yellow)", whiteSpace: "nowrap",
            }}>
              {cleanScore}
            </div>
            {isLive && (
              <div style={{ color: "#e74c3c", fontSize: "10px", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                CANLI
              </div>
            )}
          </div>
          <TeamCol name={away} crest={awayCrest} form={awayForm} />
        </div>
      </div>

      {/* İstatistiksel tahmin */}
      {prob && !isFinished && (
        <div style={{ padding: "0 26px 18px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--yellow)", letterSpacing: "1.5px", marginBottom: "8px" }}>
            📊 İSTATİSTİKSEL TAHMİN
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: "11px", marginBottom: "5px" }}>
            <span style={{ color: "#2a9d4a", fontWeight: "700" }}>{fav === "home" && "⭐ "}{home} %{prob.home}</span>
            <span style={{ color: "#888" }}>Beraberlik %{prob.draw}</span>
            <span style={{ color: "#c0392b", fontWeight: "700" }}>%{prob.away} {away}{fav === "away" && " ⭐"}</span>
          </div>
          <div style={{ display: "flex", height: "18px", borderRadius: "3px", overflow: "hidden", marginBottom: "12px" }}>
            <div style={{ width: `${prob.home}%`, background: "#2a9d4a" }} />
            <div style={{ width: `${prob.draw}%`, background: "#555" }} />
            <div style={{ width: `${prob.away}%`, background: "#c0392b" }} />
          </div>

          {/* İstatistik kutuları */}
          {(homeGoalAvg || awayGoalAvg || headToHead) && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "12px" }}>
              {[
                { label: "Gol Ort.",      hv: homeGoalAvg || "–",                   av: awayGoalAvg || "–" },
                { label: "Son 5 Galibiyet", hv: homeForm ? `${homeForm.filter(r=>r==="W").length}G` : "–",
                                           av: awayForm  ? `${awayForm.filter(r=>r==="W").length}G`  : "–" },
                { label: "H2H",           hv: headToHead ? String(headToHead.homeWins) : "–",
                                           av: headToHead ? String(headToHead.awayWins) : "–" },
              ].map(({ label, hv, av }) => (
                <div key={label} style={{
                  background: "#111", border: "1px solid var(--border)",
                  padding: "8px", textAlign: "center",
                }}>
                  <div style={{ color: "var(--muted)", fontSize: "9px", fontFamily: "var(--font-mono)", letterSpacing: "1px", marginBottom: "4px" }}>
                    {label}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--yellow)", fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: "700" }}>{hv}</span>
                    <span style={{ color: "#333", fontSize: "9px" }}>vs</span>
                    <span style={{ color: "#ccc", fontFamily: "var(--font-mono)", fontSize: "13px" }}>{av}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {analysisText && (
            <div style={{
              borderLeft: "3px solid var(--yellow)", background: "#0a0a0a",
              padding: "10px 14px", fontFamily: "var(--font-body)", fontStyle: "italic",
              fontSize: "13px", color: "#ddd", lineHeight: 1.6,
            }}>
              {analysisText}
            </div>
          )}
        </div>
      )}

      {/* Maç bilgi satırları */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{
            display: "flex", justifyContent: "space-between",
            padding: "10px 26px", borderBottom: "1px solid #161616",
          }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)", letterSpacing: "1px" }}>
              {k.toUpperCase()}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#ddd", textAlign: "right" }}>
              {v}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
