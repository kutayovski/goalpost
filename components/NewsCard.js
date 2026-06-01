// components/NewsCard.js
import { useState } from "react";

const CORUM_BADGE = "https://upload.wikimedia.org/wikipedia/tr/3/37/%C3%87orum_FK.png";

// Görsel yoksa kategori renginde gradient arka plan + emoji göster
const CAT_STYLE = {
  corumsporhaber: { bg: "linear-gradient(135deg,#1a0000,#2a0000)", emoji: null, logo: CORUM_BADGE },
  milli:          { bg: "linear-gradient(135deg,#0a0a1a,#1a0a0a)", emoji: "🇹🇷" },
  superlig:       { bg: "linear-gradient(135deg,#0a0a0a,#111)",    emoji: "🏟️" },
  transfer:       { bg: "linear-gradient(135deg,#0a1a0a,#0a0a0a)", emoji: "🔄" },
  worldcup:       { bg: "linear-gradient(135deg,#0a1a0a,#0d1a0d)", emoji: "🏆" },
  general:        { bg: "linear-gradient(135deg,#0a0a0a,#111)",    emoji: "⚽" },
  magazine:       { bg: "linear-gradient(135deg,#0a0a0a,#111)",    emoji: "⭐" },
};

export default function NewsCard({ title, summary, source, flag, date, link, image, isMain, onOpen, category }) {
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

  // Kart tıklaması: modal açar (özet görmek için)
  // "Devamını oku" ise direkt orijinal siteye gider
  const handleCardClick = () => {
    if (onOpen) onOpen();
  };

  const handleReadMore = (e) => {
    e.stopPropagation();
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleCardClick}
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
      }}
    >
      {/* Görsel */}
      {(() => {
        const h = isMain ? "200px" : "140px";
        const catStyle = CAT_STYLE[category] || CAT_STYLE.general;

        if (image) {
          return (
            <div style={{ position: "relative", width: "100%", height: h, overflow: "hidden" }}>
              <img
                src={image}
                alt={title}
                style={{
                  width: "100%", height: "100%", objectFit: "cover",
                  transition: "transform 0.4s",
                  transform: hovered ? "scale(1.04)" : "scale(1)",
                }}
                onError={(e) => {
                  if (category === "corumsporhaber" && e.target.src !== CORUM_BADGE) {
                    // Çorum FK: bozuk görsel → logo
                    e.target.src = CORUM_BADGE;
                    e.target.style.objectFit = "contain";
                    e.target.style.padding = "20px";
                    e.target.style.background = "#111";
                    e.target.style.transform = "none";
                  } else {
                    // Diğer kategoriler: bozuk görsel → emoji placeholder
                    e.target.style.display = "none";
                    const parent = e.target.parentElement;
                    if (parent) {
                      parent.style.background = catStyle.bg;
                      parent.style.display = "flex";
                      parent.style.alignItems = "center";
                      parent.style.justifyContent = "center";
                      parent.innerHTML = `<span style="font-size:40px;opacity:0.4">${catStyle.emoji || "⚽"}</span>`;
                    }
                  }
                }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(8,8,8,0.85) 0%, transparent 60%)",
              }} />
            </div>
          );
        }

        // Görsel yok: Çorum FK → logo, diğerleri → kategori placeholder
        if (category === "corumsporhaber") {
          return (
            <div style={{ position: "relative", width: "100%", height: h, background: "#111", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={CORUM_BADGE} alt="Çorum FK"
                style={{ width: "80px", height: "80px", objectFit: "contain", opacity: 0.85 }} />
              <div style={{ position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(8,8,8,0.7) 0%, transparent 60%)" }} />
            </div>
          );
        }

        // Görsel olmayan diğer kategoriler: emoji placeholder
        return (
          <div style={{ width: "100%", height: h, background: catStyle.bg,
            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <span style={{ fontSize: "40px", opacity: 0.25 }}>{catStyle.emoji || "⚽"}</span>
          </div>
        );
      })()}

      {/* İçerik */}
      <div style={{ padding: isMain ? "20px 22px 22px" : "14px 18px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", gap: "8px" }}>
          <span style={{
            background: "var(--yellow)", color: "#0a0a0a", fontSize: "10px",
            fontWeight: "800", padding: "2px 8px", fontFamily: "var(--font-mono)",
            letterSpacing: "0.8px", flexShrink: 0,
          }}>
            {flag} {source}
          </span>
          <span style={{ color: "var(--muted)", fontSize: "10px", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
            {relativeTime(date)}
          </span>
        </div>

        <h3 style={{
          color: hovered ? "var(--yellow)" : "#f0f0f0",
          fontFamily: "var(--font-head)",
          fontSize: isMain ? "19px" : "14px",
          fontWeight: "700", lineHeight: "1.35",
          marginBottom: summary ? "10px" : 0,
          transition: "color 0.18s",
        }}>
          {title}
        </h3>

        {summary && (
          <p style={{
            color: "var(--subtext)", fontSize: "13px", lineHeight: "1.6",
            fontFamily: "var(--font-body)",
            display: "-webkit-box", WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {summary.split(/\n/)[0]}
          </p>
        )}

        {/* Alt butonlar */}
        <div style={{ marginTop: "14px", display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Özeti gör — modal açar */}
          <span style={{
            fontSize: "11px", fontFamily: "var(--font-mono)",
            color: hovered ? "var(--yellow)" : "var(--muted)",
            transition: "color 0.18s",
          }}>
            Özet →
          </span>

          {/* Devamını oku — orijinal siteye gider */}
          {link && (
            <span
              onClick={handleReadMore}
              style={{
                fontSize: "11px", fontFamily: "var(--font-mono)",
                color: "#1da1f2", cursor: "pointer",
                borderLeft: "1px solid var(--border)", paddingLeft: "10px",
                textDecoration: "underline",
              }}
            >
              Devamını oku ↗
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
