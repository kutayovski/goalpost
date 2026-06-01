// components/Countdown.js
import { useState, useEffect } from "react";

const WC_START = new Date("2026-06-11T20:00:00Z"); // Meksika vs Güney Afrika (UTC)

export default function Countdown() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      const diff = WC_START - now;
      if (diff <= 0) return setTime({ started: true });
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({ d, h, m, s, started: false });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, []);

  if (!time) return null;

  if (time.started) {
    return (
      <div style={wrapStyle}>
        <p style={{ fontFamily: "var(--font-mono)", color: "var(--yellow)", fontSize: "14px", fontWeight: "700" }}>
          🔴 DÜNYA KUPASI BAŞLADI!
        </p>
      </div>
    );
  }

  const units = [
    { label: "GÜN", value: time.d },
    { label: "SAAT", value: time.h },
    { label: "DAKİKA", value: time.m },
    { label: "SANİYE", value: time.s },
  ];

  return (
    <div style={wrapStyle}>
      <p style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        letterSpacing: "2px",
        color: "var(--muted)",
        marginBottom: "12px",
        textAlign: "center",
      }}>
        🌍 2026 FIFA DÜNYA KUPASI BAŞLANGICINA
      </p>
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
        {units.map(({ label, value }) => (
          <div key={label} style={{
            background: "#111",
            border: "1px solid var(--border)",
            padding: "10px 16px",
            textAlign: "center",
            minWidth: "72px",
          }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "28px",
              fontWeight: "700",
              color: "var(--yellow)",
              lineHeight: 1,
              tabularNums: true,
            }}>
              {String(value).padStart(2, "0")}
            </div>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "var(--muted)",
              letterSpacing: "1.5px",
              marginTop: "4px",
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>
      <p style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        color: "#333",
        marginTop: "12px",
        textAlign: "center",
      }}>
        Meksika vs Güney Afrika · Estadio Azteca · 11 Haziran 2026
      </p>
    </div>
  );
}

const wrapStyle = {
  background: "#0d0d0d",
  border: "1px solid var(--border)",
  borderTop: "2px solid var(--yellow)",
  padding: "20px",
  marginBottom: "2px",
};
