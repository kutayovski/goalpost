// components/NewsModal.js — haber TAM içeriği kendi sitede okunur (yönlendirme yok)
import Modal from "./Modal";

export default function NewsModal({ item, onClose }) {
  if (!item) return null;
  const { title, summary, source, flag, date, image, imageCredit } = item;
  const dateStr = date
    ? new Date(date).toLocaleString("tr-TR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";

  // Tam metni paragraflara böl
  const paragraphs = (summary || "").split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <Modal onClose={onClose} maxWidth="720px">
      {image && (
        <div style={{ position: "relative", width: "100%", height: "340px", overflow: "hidden" }}>
          <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.parentElement.style.display = "none"; }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(14,14,14,0.95) 0%, transparent 55%)" }} />
        </div>
      )}
      <div style={{ padding: "26px 30px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "10px" }}>
          <span style={{ background: "var(--yellow)", color: "#0a0a0a", fontSize: "11px", fontWeight: "800", padding: "3px 10px", fontFamily: "var(--font-mono)", letterSpacing: "0.8px" }}>
            {flag} {source}
          </span>
          <span style={{ color: "var(--muted)", fontSize: "11px", fontFamily: "var(--font-mono)" }}>{dateStr}</span>
        </div>

        <h2 style={{ fontFamily: "var(--font-head)", fontSize: "29px", color: "#fff", lineHeight: 1.22, marginBottom: "20px" }}>
          {title}
        </h2>

        <div style={{ color: "var(--text)", fontSize: "17px", lineHeight: 1.75, fontFamily: "var(--font-body)" }}>
          {paragraphs.length ? paragraphs.map((p, i) => (
            <p key={i} style={{ marginBottom: "16px" }}>{p}</p>
          )) : <p style={{ color: "var(--muted)" }}>İçerik yükleniyor…</p>}
        </div>

        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.5px" }}>
          Kaynak: {source} · Bu içerik GOALPOST tarafından Türkçe'ye çevrilerek sunulmuştur.
        </div>
      </div>
    </Modal>
  );
}
