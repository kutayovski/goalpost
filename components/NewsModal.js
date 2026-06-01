// components/NewsModal.js — haber özeti + orijinal siteye gidiş
import Modal from "./Modal";

export default function NewsModal({ item, onClose }) {
  if (!item) return null;
  const { title, summary, source, flag, date, link, image } = item;

  const dateStr = date
    ? new Date(date).toLocaleString("tr-TR", {
        day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "";

  const paragraphs = (summary || "")
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const openSource = () => {
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <Modal onClose={onClose} maxWidth="720px">
      {/* Görsel */}
      {image && (
        <div style={{ position: "relative", width: "100%", height: "320px", overflow: "hidden" }}>
          <img
            src={image} alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.parentElement.style.display = "none"; }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(14,14,14,0.95) 0%, transparent 50%)",
          }} />
        </div>
      )}

      <div style={{ padding: "26px 28px 28px" }}>
        {/* Kaynak + Tarih */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", gap: "10px", flexWrap: "wrap" }}>
          <span style={{
            background: "var(--yellow)", color: "#0a0a0a", fontSize: "11px",
            fontWeight: "800", padding: "3px 10px", fontFamily: "var(--font-mono)", letterSpacing: "0.8px",
          }}>
            {flag} {source}
          </span>
          <span style={{ color: "var(--muted)", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
            {dateStr}
          </span>
        </div>

        {/* Başlık */}
        <h2 style={{
          fontFamily: "var(--font-head)", fontSize: "26px", color: "#fff",
          lineHeight: 1.25, marginBottom: "18px",
        }}>
          {title}
        </h2>

        {/* Özet */}
        {paragraphs.length > 0 ? (
          <div style={{ color: "var(--text)", fontSize: "16px", lineHeight: 1.75, fontFamily: "var(--font-body)", marginBottom: "22px" }}>
            {paragraphs.map((p, i) => (
              <p key={i} style={{ marginBottom: "14px" }}>{p}</p>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--muted)", fontFamily: "var(--font-body)", marginBottom: "22px" }}>
            Özet mevcut değil.
          </p>
        )}

        {/* Orijinal kaynağa git — büyük, belirgin buton */}
        {link && (
          <button
            onClick={openSource}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "var(--yellow)", color: "#0a0a0a", border: "none",
              padding: "13px 24px", fontFamily: "var(--font-mono)", fontSize: "13px",
              fontWeight: "700", cursor: "pointer", letterSpacing: "0.5px", width: "100%",
              justifyContent: "center",
            }}
          >
            Haberin Tamamını Oku ↗ — {source}
          </button>
        )}

        <div style={{
          marginTop: "14px", fontFamily: "var(--font-mono)", fontSize: "10px",
          color: "#333", textAlign: "center",
        }}>
          Bu özet GOALPOST tarafından derlendi · Tam haber için yukarıdaki butona bas
        </div>
      </div>
    </Modal>
  );
}
