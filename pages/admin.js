// pages/admin.js — GOALPOST Haber Yönetim & Tweet Paneli
// Erişim: http://localhost:3000/admin
// Twitter Web Intent ile tek tıkla tweet oluşturma (ücretsiz, API gerekmez)
// Kullanıcı Twitter'da zaten giriş yapmış olmalı.

import { useState, useEffect } from "react";

const CATEGORIES = [
  { id: "corumsporhaber", label: "🔴⚫ Çorum FK",    hashtags: ["ÇorumFK","SüperLig","Futbol"] },
  { id: "milli",          label: "🇹🇷 Milli Takım",  hashtags: ["MilliTakım","TürkiyeMilliTakımı","Futbol"] },
  { id: "superlig",       label: "⚽ Süper Lig",      hashtags: ["SüperLig","Futbol","TrendyolSüperLig"] },
  { id: "transfer",       label: "🔄 Transfer",       hashtags: ["Transfer","Futbol"] },
  { id: "worldcup",       label: "🌍 Dünya Kupası",   hashtags: ["DünyaKupası","FIFA2026","Futbol"] },
  { id: "general",        label: "📰 Gündem",          hashtags: ["Futbol","Football"] },
  { id: "magazine",       label: "⭐ Magazin",         hashtags: ["Futbol"] },
];

const CAT_EMOJI = {
  corumsporhaber: "🔴⚫", milli: "🇹🇷", superlig: "⚽",
  transfer: "🔄", worldcup: "🌍", general: "📰", magazine: "⭐",
};

function buildTweetText(item, catId, customText) {
  if (customText) return customText;
  const catInfo = CATEGORIES.find(c => c.id === catId) || CATEGORIES[5];
  const emoji   = CAT_EMOJI[catId] || "⚽";
  const label   = catInfo.label.replace(/^[^\s]+ /, "").toUpperCase();

  // Özeti kısalt (280 karakter limiti için)
  const summary = (item.summary || "").replace(/\s+/g, " ").trim();
  const MAX_SUMMARY = 160;
  const shortSummary = summary.length > MAX_SUMMARY
    ? summary.slice(0, MAX_SUMMARY).replace(/\s\S*$/, "") + "…"
    : summary;

  const hashtags = catInfo.hashtags.map(h => `#${h}`).join(" ");
  return `${emoji} ${label}\n\n${item.title}\n\n${shortSummary}\n\n${hashtags}`.slice(0, 270);
}

function openTweet(text) {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "width=600,height=500,scrollbars=yes");
}

function NewsItem({ item, catId }) {
  const [editing, setEditing] = useState(false);
  const [tweetText, setTweetText] = useState("");
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const txt = buildTweetText(item, catId, "");
    setTweetText(txt);
    setCharCount(txt.length);
  }, [item, catId]);

  const handleTweetChange = (v) => { setTweetText(v); setCharCount(v.length); };

  const handleCopy = () => {
    navigator.clipboard.writeText(tweetText).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const relTime = (dateStr) => {
    if (!dateStr) return "";
    const d = Math.floor((Date.now() - new Date(dateStr)) / 3600000);
    return d < 24 ? `${d}s önce` : `${Math.floor(d/24)}g önce`;
  };

  return (
    <div style={{
      background: "#0e0e0e", border: "1px solid #1c1c1c",
      borderLeft: `4px solid ${catId === "corumsporhaber" ? "#e30a17" : catId === "milli" ? "#e30a17" : "var(--yellow)"}`,
      marginBottom: "12px", overflow: "hidden",
    }}>
      {/* Haber özeti */}
      <div style={{ display: "flex", gap: "12px", padding: "14px" }}>
        {item.image && (
          <img src={item.image} alt="" style={{
            width: "90px", height: "65px", objectFit: "cover", flexShrink: 0, borderRadius: "2px",
          }} onError={e => { e.target.style.display = "none"; }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", background: "#1a1a1a",
              color: "var(--yellow)", padding: "2px 7px", letterSpacing: "0.5px" }}>
              {item.flag} {item.source}
            </span>
            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
              {relTime(item.date)}
            </span>
          </div>
          <p style={{ fontFamily: "var(--font-head)", fontSize: "14px", color: "#eee", lineHeight: 1.3, marginBottom: "5px" }}>
            {item.title}
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--muted)", lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {item.summary}
          </p>
        </div>
      </div>

      {/* Tweet editörü */}
      <div style={{ borderTop: "1px solid #1c1c1c", padding: "12px 14px", background: "#080808" }}>
        {editing ? (
          <textarea
            value={tweetText}
            onChange={e => handleTweetChange(e.target.value)}
            style={{
              width: "100%", minHeight: "110px", background: "#111", color: "#e8e8e8",
              border: "1px solid #2a2a2a", padding: "10px", fontFamily: "var(--font-body)",
              fontSize: "13px", lineHeight: 1.5, resize: "vertical", borderRadius: "2px",
              boxSizing: "border-box",
            }}
          />
        ) : (
          <pre style={{
            fontFamily: "var(--font-body)", fontSize: "13px", color: "#ccc",
            background: "#111", border: "1px solid #1c1c1c", padding: "10px",
            margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5, borderRadius: "2px",
          }}>{tweetText}</pre>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", flexWrap: "wrap", gap: "8px" }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "10px",
            color: charCount > 270 ? "#e74c3c" : charCount > 240 ? "var(--yellow)" : "var(--muted)",
          }}>
            {charCount}/280 karakter
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setEditing(v => !v)} style={{
              background: "transparent", border: "1px solid #333", color: "var(--muted)",
              padding: "6px 12px", fontFamily: "var(--font-mono)", fontSize: "10px",
              cursor: "pointer", letterSpacing: "0.5px",
            }}>
              {editing ? "ÖNIZLE" : "DÜZENLE"}
            </button>
            <button onClick={handleCopy} style={{
              background: copied ? "#1a3a1a" : "transparent", border: `1px solid ${copied ? "#2a7a2a" : "#333"}`,
              color: copied ? "#2a7a2a" : "var(--muted)", padding: "6px 12px",
              fontFamily: "var(--font-mono)", fontSize: "10px", cursor: "pointer",
            }}>
              {copied ? "✓ KOPYALANDI" : "KOPYALA"}
            </button>
            <button onClick={() => openTweet(tweetText)} style={{
              background: "#1da1f2", border: "none", color: "#fff",
              padding: "6px 16px", fontFamily: "var(--font-mono)", fontSize: "11px",
              fontWeight: "700", cursor: "pointer", letterSpacing: "0.5px",
              opacity: charCount > 280 ? 0.5 : 1,
            }}>
              🐦 TWEETLE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [activeCat, setActiveCat] = useState("corumsporhaber");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/data/football.json")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("football.json yüklenemedi. Önce 'node lib/fetchData.js' çalıştır."); setLoading(false); });
  }, []);

  const news = data?.news || {};
  const items = (news[activeCat] || []).filter(n =>
    !search || (n.title + n.summary).toLowerCase().includes(search.toLowerCase())
  );
  const updatedAt = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleString("tr-TR")
    : "—";

  return (
    <>
      {/* Header */}
      <div style={{ background: "#0a0a0a", borderBottom: "3px solid var(--yellow)", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-head)", fontSize: "22px", color: "#fff" }}>
              GOL<span style={{ color: "var(--yellow)" }}>POST</span> <span style={{ fontSize: "14px", color: "var(--muted)" }}>Tweet Paneli</span>
            </h1>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#333", marginTop: "3px" }}>
              Son güncelleme: {updatedAt}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              placeholder="Haber ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: "#111", border: "1px solid #2a2a2a", color: "#eee",
                padding: "7px 12px", fontFamily: "var(--font-mono)", fontSize: "11px",
                width: "200px", borderRadius: "2px",
              }}
            />
            <a href="/" style={{
              background: "var(--yellow)", color: "#0a0a0a", padding: "7px 14px",
              fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "700",
              textDecoration: "none", letterSpacing: "0.5px",
            }}>← SİTE</a>
          </div>
        </div>

        {/* Kategori sekmeleri */}
        <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", gap: "2px", overflowX: "auto", paddingBottom: "0" }}>
          {CATEGORIES.map(cat => {
            const count = (news[cat.id] || []).length;
            return (
              <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                style={{
                  background: activeCat === cat.id ? "var(--yellow)" : "transparent",
                  color: activeCat === cat.id ? "#0a0a0a" : "var(--muted)",
                  border: "none", padding: "10px 16px", fontFamily: "var(--font-mono)",
                  fontSize: "10px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                }}>
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* İçerik */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "20px" }}>

        {/* Tweet kılavuzu */}
        <div style={{ background: "#0a150a", border: "1px solid #1a2a1a", borderLeft: "3px solid var(--yellow)",
          padding: "12px 16px", marginBottom: "20px", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)" }}>
          🐦 <strong style={{ color: "var(--yellow)" }}>Nasıl çalışır:</strong> Haberi incele → Tweet metnini düzenle (isteğe bağlı) → <strong style={{ color: "#1da1f2" }}>TWEETLE</strong> butonuna bas → Twitter compose penceresi açılır → <strong style={{ color: "#fff" }}>Tweet</strong> butonuna bas. Twitter'a giriş yapmış olman gerekir.
          <div style={{ marginTop: "6px", color: "#333" }}>
            Tamamen ücretsiz · Twitter API gerektirmez · Kendi hesabından paylaşılır
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
            Haberler yükleniyor...
          </div>
        )}

        {error && (
          <div style={{ background: "#1a0a0a", border: "1px solid #c0392b", padding: "16px 20px",
            fontFamily: "var(--font-mono)", fontSize: "12px", color: "#e74c3c" }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
            Bu kategoride haber bulunamadı.
            {activeCat === "corumsporhaber" && (
              <div style={{ marginTop: "10px", fontSize: "11px" }}>
                Çorum FK haberleri için haber güncellemesi çalıştır: <code style={{ color: "var(--yellow)" }}>node lib/fetchData.js</code>
              </div>
            )}
          </div>
        )}

        {items.map((item, i) => (
          <NewsItem key={`${activeCat}-${i}`} item={item} catId={activeCat} />
        ))}
      </div>
    </>
  );
}
