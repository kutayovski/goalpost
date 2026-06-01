// components/NewsCard.js
import { useState } from "react";

export default function NewsCard({ title, summary, source, flag, date, link, image, isMain, onOpen }) {
  const [hovered, setHovered] = useState(false);

  const relativeTime = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}dk önce`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}sa önce`;
    return `${Math.floor(hrs / 24)}g önce`;
  };

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fade-up"
      style={{
        display: "block",
        background: "var(--card)",
        borderLeft: `4px solid ${hovered ? "var(--yellow)" : isMain ? "var(--yellow)" : "var(--border)"}`,
        transition: "border-color 0.18s, transform 0.18s, box-shadow 0.18s",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.5)" : "none",
        cursor: "pointer",
        overflow: "hidden",
        textDecoration: "none",
      }}
    >
      {/* Image */}
      {image && (
        <div style={{ position: "relative", width: "100%", height: isMain ? "200px" : "140px", overflow: "hidden" }}>
          <img
            src={image}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s",
              transform: hovered ? "scale(1.04)" : "scale(1)",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(8,8,8,0.85) 0%, transparent 60%)",
          }} />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: isMain ? "20px 22px 22px" : "14px 18px 18px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          gap: "8px",
        }}>
          <span style={{
            background: "var(--yellow)",
            color: "#0a0a0a",
            fontSize: "10px",
            fontWeight: "800",
            padding: "2px 8px",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.8px",
            flexShrink: 0,
          }}>
            {flag} {source}
          </span>
          <span style={{
            color: "var(--muted)",
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            flexShrink: 0,
          }}>
            {relativeTime(date)}
          </span>
        </div>

        <h3 style={{
          color: hovered ? "var(--yellow)" : "#f0f0f0",
          fontFamily: "var(--font-head)",
          fontSize: isMain ? "19px" : "14px",
          fontWeight: "700",
          lineHeight: "1.35",
          marginBottom: summary ? "10px" : 0,
          transition: "color 0.18s",
        }}>
          {title}
        </h3>

        {summary && (
          <p style={{
            color: "var(--subtext)",
            fontSize: "13px",
            lineHeight: "1.6",
            fontFamily: "var(--font-body)",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {summary}
          </p>
        )}

        <div style={{
          marginTop: "12px",
          fontSize: "11px",
          fontFamily: "var(--font-mono)",
          color: hovered ? "var(--yellow)" : "var(--muted)",
          transition: "color 0.18s",
        }}>
          Detay →
        </div>
      </div>
    </div>
  );
}
