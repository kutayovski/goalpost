// components/Ticker.js
export default function Ticker({ items = [] }) {
  if (!items.length) return null;
  const doubled = [...items, ...items];
  return (
    <div style={{
      background: "var(--yellow)",
      overflow: "hidden",
      padding: "9px 0",
      borderBottom: "2px solid #111",
      userSelect: "none",
    }}>
      <div style={{
        display: "inline-block",
        whiteSpace: "nowrap",
        animation: "ticker 40s linear infinite",
      }}>
        {doubled.map((item, i) => (
          <span key={i} style={{
            marginRight: "80px",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: "700",
            color: "#111",
            letterSpacing: "0.3px",
          }}>
            ⚽ {item}
          </span>
        ))}
      </div>
    </div>
  );
}
