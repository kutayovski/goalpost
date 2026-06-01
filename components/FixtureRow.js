// components/FixtureRow.js — Sofascore tarzı genişleyen satır
import { useState } from "react";
import {
  calculateWinProbabilityFromMatch,
  generateAnalysisText,
  getFavorite,
} from "../lib/analysis";

const GREEN  = "#2a9d4a";
const RED    = "#c0392b";
const GRAY   = "#888";
const YELLOW = "var(--yellow)";
const BORDER = "var(--border)";

function FormDots({ form }) {
  if (!form || form.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: "3px", marginTop: "4px" }}>
      {form.map((r, i) => (
        <span
          key={i}
          title={r === "W" ? "Galibiyet" : r === "D" ? "Beraberlik" : "Mağlubiyet"}
          style={{
            width: "16px", height: "16px", borderRadius: "50%",
            background: r === "W" ? GREEN : r === "D" ? GRAY : RED,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: "8px", fontWeight: "700", color: "#fff",
            fontFamily: "var(--font-mono)", flexShrink: 0,
          }}
        >
          {r === "W" ? "G" : r === "D" ? "B" : "M"}
        </span>
      ))}
    </div>
  );
}

function StatBox({ label, homeVal, awayVal }) {
  return (
    <div style={{
      background: "#111", border: `1px solid ${BORDER}`,
      padding: "10px", textAlign: "center",
    }}>
      <div style={{
        color: "var(--muted)", fontSize: "9px", fontFamily: "var(--font-mono)",
        letterSpacing: "1px", marginBottom: "6px", textTransform: "uppercase",
      }}>
        {label}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: YELLOW, fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: "700" }}>
          {homeVal}
        </span>
        <span style={{ color: "#333", fontSize: "9px", fontFamily: "var(--font-mono)" }}>vs</span>
        <span style={{ color: "#ccc", fontFamily: "var(--font-mono)", fontSize: "14px" }}>
          {awayVal}
        </span>
      </div>
    </div>
  );
}

export default function FixtureRow({ match, onOpenDetail }) {
  const [open, setOpen]       = useState(false);
  const [hovered, setHovered] = useState(false);

  const {
    home, away, date, status, score, leagueName, leagueFlag,
    homeCrest, awayCrest, homeForm, awayForm,
    homeGoalAvg, awayGoalAvg, headToHead, analysis, minute,
  } = match;

  const isLive     = status === "IN_PLAY" || status === "PAUSED";
  const isFinished = match.timeframe === "past";
  const hasStats   = (homeForm && homeForm.length > 0) || (awayForm && awayForm.length > 0);

  // Olasılık: mevcut maç nesnesinden hesapla; yoksa önceden saklanmış analizi kullan
  const prob = hasStats
    ? calculateWinProbabilityFromMatch(match)
    : analysis?.winProbability || null;

  const fav  = prob ? getFavorite(prob) : null;
  const analysisText = hasStats && prob
    ? generateAnalysisText(match, prob)
    : analysis?.text || null;

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit", month: "short",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const homeWins = (homeForm || []).filter(f => f === "W").length;
  const awayWins = (awayForm || []).filter(f => f === "W").length;

  const canExpand = prob || analysisText;

  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      {/* ── Ana satır ── */}
      <div
        onClick={() => canExpand && setOpen(v => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 150px 1fr",
          alignItems: "center",
          padding: "12px 20px",
          background: hovered ? "#131313" : "transparent",
          transition: "background 0.15s",
          cursor: canExpand ? "pointer" : "default",
        }}
      >
        {/* Ev sahibi */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "flex-end",
          paddingRight: "14px", gap: "2px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "13px",
              color: fav === "home" ? YELLOW : "#ccc",
              fontWeight: (fav === "home" || isLive) ? "700" : "400",
            }}>
              {fav === "home" && !isFinished && <span style={{ marginRight: "4px", fontSize: "10px" }}>⭐</span>}
              {home}
            </span>
            {homeCrest && (
              <img src={homeCrest} alt="" style={{ width: "20px", height: "20px", objectFit: "contain" }}
                onError={e => { e.target.style.display = "none"; }} />
            )}
          </div>
          <FormDots form={homeForm} />
        </div>

        {/* Orta: skor / saat */}
        <div style={{ textAlign: "center" }}>
          {score ? (
            <div>
              <span style={{
                background: isLive ? RED : "var(--yellow)",
                color: isLive ? "#fff" : "#0a0a0a",
                padding: "5px 14px",
                fontFamily: "var(--font-mono)", fontWeight: "800", fontSize: "15px",
                display: "inline-block", letterSpacing: "1px",
              }}>
                {score}
              </span>
              {isLive && minute && (
                <div style={{ color: RED, fontSize: "9px", fontFamily: "var(--font-mono)", marginTop: "3px", fontWeight: "700" }}>
                  {minute}&apos;
                </div>
              )}
              {isLive && !minute && (
                <div style={{ color: RED, fontSize: "9px", fontFamily: "var(--font-mono)", marginTop: "3px", fontWeight: "700" }}>
                  🔴 CANLI
                </div>
              )}
            </div>
          ) : (
            <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
              {formatDate(date)}
            </span>
          )}
          <div style={{
            color: "#2a2a2a", fontSize: "10px", fontFamily: "var(--font-mono)",
            marginTop: "4px", letterSpacing: "0.3px",
          }}>
            {leagueFlag} {leagueName}
          </div>
          {canExpand && (
            <div style={{
              color: hovered ? "#555" : "#2a2a2a",
              fontSize: "10px", marginTop: "2px", transition: "color 0.15s",
            }}>
              {open ? "▲" : "▼"}
            </div>
          )}
        </div>

        {/* Deplasman */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "flex-start",
          paddingLeft: "14px", gap: "2px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {awayCrest && (
              <img src={awayCrest} alt="" style={{ width: "20px", height: "20px", objectFit: "contain" }}
                onError={e => { e.target.style.display = "none"; }} />
            )}
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "13px",
              color: fav === "away" ? YELLOW : "#ccc",
              fontWeight: (fav === "away" || isLive) ? "700" : "400",
            }}>
              {away}
              {fav === "away" && !isFinished && <span style={{ marginLeft: "4px", fontSize: "10px" }}>⭐</span>}
            </span>
          </div>
          <FormDots form={awayForm} />
        </div>
      </div>

      {/* ── Genişleyen analiz paneli ── */}
      {open && (
        <div style={{
          background: "#0a0a0a",
          borderTop: `1px solid ${BORDER}`,
          padding: "20px 24px",
          animation: "fadeUp 0.2s ease both",
        }}>

          {/* Oynanmış maç: sadece skor detayı */}
          {isFinished ? (
            <div style={{
              textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "12px",
              color: "var(--muted)", padding: "8px 0",
            }}>
              Maç tamamlandı.
              {analysisText && (
                <div style={{
                  marginTop: "12px",
                  borderLeft: `3px solid ${BORDER}`, paddingLeft: "14px",
                  fontFamily: "var(--font-body)", fontSize: "12px",
                  color: "#666", textAlign: "left", lineHeight: 1.6, fontStyle: "italic",
                }}>
                  {analysisText}
                </div>
              )}
              {onOpenDetail && (
                <button onClick={e => { e.stopPropagation(); onOpenDetail(); }} style={detailBtnStyle}>
                  MAÇ DETAYI →
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Kazanma olasılığı barı */}
              {prob && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    fontFamily: "var(--font-mono)", fontSize: "11px", marginBottom: "6px",
                  }}>
                    <span style={{ color: GREEN, fontWeight: "700" }}>
                      {fav === "home" && "⭐ "}{home} %{prob.home}
                    </span>
                    <span style={{ color: GRAY }}>
                      {fav === "draw" && "⭐ "}Beraberlik %{prob.draw}
                    </span>
                    <span style={{ color: RED, fontWeight: "700" }}>
                      %{prob.away} {away}{fav === "away" && " ⭐"}
                    </span>
                  </div>
                  <div style={{ display: "flex", height: "8px", overflow: "hidden", borderRadius: "2px" }}>
                    <div style={{ width: `${prob.home}%`, background: GREEN, transition: "width 0.4s" }} />
                    <div style={{ width: `${prob.draw}%`, background: "#444" }} />
                    <div style={{ width: `${prob.away}%`, background: RED, transition: "width 0.4s" }} />
                  </div>
                </div>
              )}

              {/* İstatistik kutuları */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                marginBottom: "16px",
              }}>
                <StatBox
                  label="Gol Ort."
                  homeVal={homeGoalAvg ?? (analysis?.homeForm ? "-" : "–")}
                  awayVal={awayGoalAvg ?? (analysis?.awayForm ? "-" : "–")}
                />
                <StatBox
                  label={`Son ${Math.max((homeForm || []).length, (awayForm || []).length) || 5} Maç`}
                  homeVal={hasStats ? `${homeWins}G` : "–"}
                  awayVal={hasStats ? `${awayWins}G` : "–"}
                />
                <StatBox
                  label="H2H Galibiyet"
                  homeVal={headToHead != null ? String(headToHead.homeWins) : "–"}
                  awayVal={headToHead != null ? String(headToHead.awayWins) : "–"}
                />
              </div>

              {/* Form satırları */}
              {(homeForm?.length || awayForm?.length) ? (
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  marginBottom: "14px", fontFamily: "var(--font-mono)",
                  fontSize: "10px", color: "var(--muted)",
                }}>
                  <div>
                    <span>{home} formu</span>
                    <FormDots form={homeForm} />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span>{away} formu</span>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <FormDots form={awayForm} />
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Analiz metni */}
              {analysisText && (
                <div style={{
                  borderLeft: `3px solid ${YELLOW}`, paddingLeft: "14px",
                  fontFamily: "var(--font-body)", fontStyle: "italic",
                  fontSize: "13px", color: "#aaa", lineHeight: 1.65,
                  marginBottom: "14px",
                }}>
                  <span style={{ color: "#ddd", fontStyle: "normal", fontWeight: "600" }}>
                    📊 İstatistiksel Analiz:{" "}
                  </span>
                  {analysisText}
                </div>
              )}

              {/* FAVORİ rozeti + detay butonu */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {fav && prob && (
                  <span style={{
                    background: fav === "home" ? GREEN : fav === "away" ? RED : "#555",
                    color: "#fff", fontFamily: "var(--font-mono)", fontSize: "10px",
                    fontWeight: "700", padding: "4px 10px", letterSpacing: "0.5px",
                  }}>
                    ⭐ FAVORİ: {fav === "home" ? home : fav === "away" ? away : "BERABERLİK"}
                  </span>
                )}
                {onOpenDetail && (
                  <button
                    onClick={e => { e.stopPropagation(); onOpenDetail(); }}
                    style={detailBtnStyle}
                  >
                    MAÇ DETAYI →
                  </button>
                )}
              </div>

              <div style={{
                marginTop: "10px", fontSize: "9px", color: "#222",
                fontFamily: "var(--font-mono)", letterSpacing: "1px",
              }}>
                * Form, gol ortalaması ve H2H verilerine dayalı istatistiksel tahmin.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const detailBtnStyle = {
  background: "transparent",
  border: `1px solid var(--border)`,
  color: "var(--yellow)",
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  padding: "5px 12px",
  cursor: "pointer",
  letterSpacing: "0.5px",
  marginTop: "6px",
};
