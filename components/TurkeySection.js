// components/TurkeySection.js — "Bizim Çocuklar": Türkiye Milli Takımı detaylı analiz
import { useEffect, useState } from "react";
import { TURKEY } from "../lib/worldCupData";
import { getPlayerPhoto } from "../lib/sportsdb";

function StarCard({ star }) {
  const [photo, setPhoto] = useState(null);
  useEffect(() => {
    let active = true;
    getPlayerPhoto(star.query).then((p) => active && setPhoto(p));
    return () => { active = false; };
  }, [star.query]);

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", overflow: "hidden" }}>
      <div style={{ height: "150px", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {photo ? (
          <img src={photo} alt={star.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        ) : (
          <span style={{ fontSize: "40px" }}>🇹🇷</span>
        )}
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontFamily: "var(--font-head)", fontSize: "17px", color: "#fff" }}>{star.name}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--yellow)", letterSpacing: "0.5px", marginBottom: "8px" }}>{star.role}</div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--subtext)", lineHeight: 1.55 }}>{star.note}</p>
      </div>
    </div>
  );
}

// Kadrodaki her oyuncu için küçük fotoğraflı kart (Wikipedia'dan canlı foto)
function PlayerCard({ name }) {
  const [photo, setPhoto] = useState(null);
  useEffect(() => {
    let active = true;
    getPlayerPhoto(name).then((p) => active && setPhoto(p));
    return () => { active = false; };
  }, [name]);

  return (
    <div style={{ width: "84px", textAlign: "center" }}>
      <div style={{ width: "72px", height: "72px", margin: "0 auto 6px", borderRadius: "50%", overflow: "hidden",
        background: "#0a0a0a", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {photo ? (
          <img src={photo} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        ) : (
          <span style={{ fontSize: "24px" }}>👤</span>
        )}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#ccc", lineHeight: 1.25 }}>{name}</div>
    </div>
  );
}

export default function TurkeySection() {
  const [coachPhoto, setCoachPhoto] = useState(null);
  useEffect(() => {
    let active = true;
    getPlayerPhoto(TURKEY.coachQuery).then((p) => active && setCoachPhoto(p));
    return () => { active = false; };
  }, []);

  return (
    <div>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #2a0a0a 0%, #0a0a0a 100%)",
        border: "1px solid #3a1515", borderLeft: "4px solid #e30a17", padding: "24px", marginBottom: "2px" }}>
        <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", alignItems: "center" }}>
          <img src={`https://flagcdn.com/w160/${TURKEY.iso}.png`} alt="Türkiye"
            style={{ width: "90px", height: "auto", border: "1px solid #3a1515" }} />
          <div style={{ flex: 1, minWidth: "220px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#e30a17", letterSpacing: "2px", marginBottom: "6px" }}>
              🇹🇷 BİZİM ÇOCUKLAR
            </p>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: "30px", color: "#fff", marginBottom: "8px" }}>
              Türkiye A Millî Takımı
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--subtext)", lineHeight: 1.6 }}>
              {TURKEY.intro}
            </p>
          </div>
        </div>
      </div>

      {/* İstatistik şeridi */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "2px", marginBottom: "2px" }}>
        {[
          ["FIFA Sırası", `#${TURKEY.fifaRank}`],
          ["Grup", TURKEY.group],
          ["WC Katılım", `${TURKEY.apps} kez`],
          ["En İyi", TURKEY.best],
        ].map(([k, v]) => (
          <div key={k} style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "14px 16px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--muted)", letterSpacing: "1px", marginBottom: "5px" }}>{k.toUpperCase()}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", color: "var(--yellow)", fontWeight: "700" }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Teknik direktör */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "var(--card)",
        border: "1px solid var(--border)", padding: "18px 20px", marginBottom: "2px" }}>
        <div style={{ width: "64px", height: "64px", flexShrink: 0, background: "#0a0a0a", overflow: "hidden",
          border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {coachPhoto ? <img src={coachPhoto} alt={TURKEY.coach} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "24px" }}>👔</span>}
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "1px" }}>TEKNİK DİREKTÖR</div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: "20px", color: "#fff" }}>{TURKEY.coach}</div>
        </div>
      </div>

      {/* Grup maçları */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", marginBottom: "2px" }}>
        <div style={{ padding: "13px 20px", borderBottom: "2px solid #e30a17", fontFamily: "var(--font-mono)",
          fontSize: "11px", fontWeight: "700", color: "#fff", letterSpacing: "2px" }}>
          📅 GRUP MAÇLARI
        </div>
        {TURKEY.fixtures.map((f, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "13px 20px", borderBottom: "1px solid var(--border)", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--yellow)" }}>🇹🇷 Türkiye — {f.opp}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)", textAlign: "right" }}>{f.date} · {f.venue}</span>
          </div>
        ))}
      </div>

      {/* Yıldızlar */}
      <div style={{ marginTop: "16px", marginBottom: "12px", fontFamily: "var(--font-mono)", fontSize: "11px",
        color: "var(--yellow)", letterSpacing: "2px" }}>⭐ YILDIZLAR</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "2px" }}>
        {TURKEY.stars.map((s) => <StarCard key={s.name} star={s} />)}
      </div>

      {/* SWOT */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", marginTop: "16px" }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: "2px solid #2a7a2a", padding: "16px 18px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#2a7a2a", letterSpacing: "1.5px", marginBottom: "10px" }}>✓ GÜÇLÜ YÖNLER</div>
          {TURKEY.swot.strengths.map((s, i) => (
            <div key={i} style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#bbb", padding: "4px 0" }}>• {s}</div>
          ))}
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: "2px solid #c0392b", padding: "16px 18px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#c0392b", letterSpacing: "1.5px", marginBottom: "10px" }}>! GELİŞİM ALANLARI</div>
          {TURKEY.swot.weaknesses.map((s, i) => (
            <div key={i} style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#bbb", padding: "4px 0" }}>• {s}</div>
          ))}
        </div>
      </div>

      {/* Tam kadro — her oyuncu fotoğrafıyla */}
      <div style={{ marginTop: "16px", background: "var(--card)", border: "1px solid var(--border)", padding: "18px 20px 22px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--yellow)", letterSpacing: "2px", marginBottom: "14px" }}>👥 TAM KADRO</div>
        {Object.entries(TURKEY.squad).map(([pos, players]) => (
          <div key={pos} style={{ marginBottom: "18px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#e30a17", letterSpacing: "1px", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>{pos.toUpperCase()}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {players.map((p) => <PlayerCard key={p} name={p} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
