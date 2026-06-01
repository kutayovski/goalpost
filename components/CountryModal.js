// components/CountryModal.js — ülke detayı (bayrak, istatistik, yıldız foto, kadro)
import { useEffect, useState } from "react";
import Modal from "./Modal";
import { COUNTRY_DETAILS } from "../lib/worldCupData";
import { getPlayerPhoto } from "../lib/sportsdb";

export default function CountryModal({ country, onClose }) {
  const [starPhoto, setStarPhoto] = useState(null);
  const detail = country ? COUNTRY_DETAILS[country.name] : null;

  useEffect(() => {
    let active = true;
    if (detail?.star) {
      getPlayerPhoto(detail.star).then((p) => active && setStarPhoto(p));
    } else {
      setStarPhoto(null);
    }
    return () => { active = false; };
  }, [country?.name]);

  if (!country) return null;
  const flag = country.iso ? `https://flagcdn.com/w160/${country.iso}.png` : null;

  return (
    <Modal onClose={onClose} maxWidth="560px">
      {/* Başlık */}
      <div style={{ display: "flex", gap: "16px", alignItems: "center", padding: "26px 26px 20px",
        borderBottom: "1px solid var(--border)" }}>
        {flag && <img src={flag} alt={country.name} style={{ width: "72px", height: "auto", border: "1px solid #222" }} />}
        <div>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: "28px", color: "#fff" }}>{country.name}</h2>
          {country.host && <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "#2a7a2a" }}>EV SAHİBİ</span>}
          {country.highlight && <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--yellow)" }}>★ BİZİM ÇOCUKLAR</span>}
        </div>
      </div>

      {!detail ? (
        <div style={{ padding: "40px 26px", textAlign: "center", fontFamily: "var(--font-mono)",
          fontSize: "12px", color: "var(--muted)" }}>
          Bu takımın detaylı kadro bilgisi yakında eklenecek.<br />
          <span style={{ fontSize: "10px" }}>Grup: {country.group || "—"}</span>
        </div>
      ) : (
        <>
          {/* İstatistikler */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--border)" }}>
            {[
              ["FIFA Sırası", `#${detail.fifaRank}`],
              ["WC Katılım", `${detail.prevApps} kez`],
              ["En İyi Derece", detail.best],
              ["Teknik Direktör", detail.coach],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "var(--card)", padding: "13px 18px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--muted)", letterSpacing: "1px", marginBottom: "4px" }}>{k.toUpperCase()}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--yellow)", fontWeight: "700" }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Yıldız oyuncu */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px 26px",
            borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
            <div style={{ width: "70px", height: "70px", flexShrink: 0, background: "#0a0a0a",
              border: "1px solid var(--border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {starPhoto ? (
                <img src={starPhoto} alt={detail.star} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "26px" }}>⭐</span>
              )}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "1px" }}>YILDIZ OYUNCU</div>
              <div style={{ fontFamily: "var(--font-head)", fontSize: "20px", color: "#fff" }}>{detail.star}</div>
            </div>
          </div>

          {/* Kadro */}
          <div style={{ padding: "18px 26px 24px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--yellow)", letterSpacing: "1.5px", marginBottom: "12px" }}>
              MUHTEMEL KADRO
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
              {detail.squad.map((p, i) => (
                <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#bbb",
                  borderBottom: "1px solid #161616", padding: "5px 0" }}>
                  <span style={{ color: "var(--muted)", marginRight: "8px" }}>{String(i + 1).padStart(2, "0")}</span>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
