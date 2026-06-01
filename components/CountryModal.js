// components/CountryModal.js — ülke detayı: bayrak, istatistik, ilk 11 dizilişi,
// yıldız oyuncular (fotoğraflı), önceki maçlar.
import { useEffect, useState } from "react";
import Modal from "./Modal";
import { COUNTRY_DETAILS } from "../lib/worldCupData";
import { getPlayerPhoto } from "../lib/sportsdb";

function StarChip({ star }) {
  const [photo, setPhoto] = useState(null);
  useEffect(() => {
    let active = true;
    getPlayerPhoto(star.query).then((p) => active && setPhoto(p));
    return () => { active = false; };
  }, [star.query]);
  return (
    <div style={{ textAlign: "center", width: "90px", flexShrink: 0 }}>
      <div style={{ width: "76px", height: "76px", margin: "0 auto 6px", borderRadius: "50%", overflow: "hidden",
        background: "#0a0a0a", border: "2px solid var(--yellow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {photo ? <img src={photo} alt={star.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} /> : <span style={{ fontSize: "26px" }}>⭐</span>}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#eee", fontWeight: "700", lineHeight: 1.2 }}>{star.name}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "var(--muted)" }}>{star.role}</div>
    </div>
  );
}

export default function CountryModal({ country, onClose }) {
  if (!country) return null;
  const detail = COUNTRY_DETAILS[country.name];
  const flag = country.iso ? `https://flagcdn.com/w160/${country.iso}.png` : null;

  // İlk 11'i pozisyon hatlarına böl (GK + diziliş)
  const lines = [];
  if (detail?.squad?.length === 11 && detail.formation) {
    const counts = detail.formation.split("-").map(Number); // ör [4,2,3,1]
    let idx = 1; // 0 = kaleci
    lines.push([detail.squad[0]]); // GK
    for (const c of counts) { lines.push(detail.squad.slice(idx, idx + c)); idx += c; }
  }

  return (
    <Modal onClose={onClose} maxWidth="600px">
      {/* Başlık */}
      <div style={{ display: "flex", gap: "16px", alignItems: "center", padding: "26px 26px 20px", borderBottom: "1px solid var(--border)" }}>
        {flag && <img src={flag} alt={country.name} style={{ width: "72px", height: "auto", border: "1px solid #222" }} />}
        <div>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: "28px", color: "#fff" }}>{country.name}</h2>
          {country.host && <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "#2a7a2a" }}>EV SAHİBİ</span>}
          {country.highlight && <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--yellow)" }}>★ BİZİM ÇOCUKLAR</span>}
        </div>
      </div>

      {!detail ? (
        <div style={{ padding: "40px 26px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--muted)" }}>
          Bu takımın detaylı kadro bilgisi yakında eklenecek.<br />
          <span style={{ fontSize: "10px" }}>Grup: {country.group || "—"}</span>
        </div>
      ) : (
        <>
          {/* İstatistikler */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--border)" }}>
            {[["FIFA Sırası", `#${detail.fifaRank}`], ["WC Katılım", `${detail.prevApps} kez`], ["En İyi Derece", detail.best], ["Teknik Direktör", detail.coach]].map(([k, v]) => (
              <div key={k} style={{ background: "var(--card)", padding: "13px 18px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--muted)", letterSpacing: "1px", marginBottom: "4px" }}>{k.toUpperCase()}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--yellow)", fontWeight: "700" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Yıldızlar (fotoğraflı) */}
          {detail.stars && (
            <div style={{ padding: "18px 20px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--yellow)", letterSpacing: "1.5px", marginBottom: "14px" }}>⭐ YILDIZ OYUNCULAR</div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                {detail.stars.map((s) => <StarChip key={s.name} star={s} />)}
              </div>
            </div>
          )}

          {/* İlk 11 dizilişi (saha) */}
          {lines.length > 0 && (
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--yellow)", letterSpacing: "1.5px" }}>⚽ İLK 11</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)" }}>Diziliş: {detail.formation}</span>
              </div>
              <div style={{ background: "linear-gradient(to bottom, #0d2818, #0a1a10)", border: "1px solid #1a3a25",
                borderRadius: "4px", padding: "16px 8px", display: "flex", flexDirection: "column", gap: "14px" }}>
                {lines.map((line, li) => (
                  <div key={li} style={{ display: "flex", justifyContent: "space-around", gap: "4px" }}>
                    {line.map((p) => (
                      <div key={p} style={{ textAlign: "center", flex: 1, minWidth: 0 }}>
                        <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "var(--yellow)", margin: "0 auto 3px" }} />
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "8.5px", color: "#cfe", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Önceki maçlar */}
          {detail.recent && (
            <div style={{ padding: "18px 24px 24px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--yellow)", letterSpacing: "1.5px", marginBottom: "12px" }}>📋 SON MAÇLAR</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {detail.recent.map((r, i) => (
                  <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#ccc", background: "#161616", border: "1px solid var(--border)", padding: "5px 10px" }}>{r}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
