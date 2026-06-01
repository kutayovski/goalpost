// components/Modal.js — paylaşılan modal sarmalayıcı (arka plan tıklama + ESC ile kapanır)
import { useEffect } from "react";

export default function Modal({ onClose, children, maxWidth = "640px" }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.82)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "40px 16px", overflowY: "auto",
        animation: "fadeUp 0.2s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderTop: "3px solid var(--yellow)", width: "100%", maxWidth,
          position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Kapat"
          style={{
            position: "absolute", top: "12px", right: "12px", zIndex: 2,
            background: "#000", color: "var(--yellow)", border: "1px solid var(--border)",
            width: "30px", height: "30px", cursor: "pointer", fontFamily: "var(--font-mono)",
            fontSize: "15px", lineHeight: 1,
          }}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
