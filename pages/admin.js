// pages/admin.js — GOALPOST Tweet Paneli
import { useState, useEffect } from "react";

const CORUM_BADGE = "https://upload.wikimedia.org/wikipedia/tr/3/37/%C3%87orum_FK.png";

const CATEGORIES = [
  { id: "corumsporhaber", label: "🔴⚫ Çorum FK",    hashtags: ["ÇorumFK", "SüperLig", "Futbol"] },
  { id: "milli",          label: "🇹🇷 Milli Takım",  hashtags: ["MilliTakım", "TürkiyeMilliTakımı", "Futbol"] },
  { id: "superlig",       label: "⚽ Süper Lig",      hashtags: ["SüperLig", "TrendyolSüperLig", "Futbol"] },
  { id: "transfer",       label: "🔄 Transfer",       hashtags: ["Transfer", "Futbol"] },
  { id: "worldcup",       label: "🌍 Dünya Kupası",   hashtags: ["DünyaKupası", "FIFA2026"] },
  { id: "general",        label: "📰 Gündem",          hashtags: ["Futbol", "Football"] },
  { id: "magazine",       label: "⭐ Magazin",         hashtags: ["Futbol"] },
];

const CAT_PREFIX = {
  corumsporhaber: "🔴⚫ ÇORUM FK",
  milli:          "🇹🇷 MİLLİ TAKIM",
  superlig:       "⚽ SÜPER LİG",
  transfer:       "🔄 TRANSFER",
  worldcup:       "🌍 DÜNYA KUPASI",
  general:        "📰 GÜNDEM",
  magazine:       "⭐ MAGAZİN",
};

// ─── Viral Tweet Motoru ──────────────────────────────────────────────────────
// Kural tabanlı (AI yok), başlık + özetten çarpıcı X paylaşımı üretir.
// Format: HOOK → Ana Mesaj → Merak/CTA → Hashtag

// Haber türü tespiti
const STORY_SIGNALS = {
  transfer_bomb: ["bomba","imzala","anlaşt","transfer etti","resmen","bonservis","sözleşme imzal","transferi tamam","kesinleşti","açıkladı","anlaşma sağland"],
  transfer_rumor: ["talip","istiyor","peşinde","gündemde","görüşme","teklif","listede","ilgileniyor","transfer görüşme"],
  match_win:    ["galip","kazandı","mağlup etti","3 puan","galibiyet","yendi"],
  match_draw:   ["berabere","puan paylaştı","golsüz","draw"],
  match_loss:   ["mağlup","kaybetti","yenildi","fark yedi"],
  goal_hero:    ["hat-trick","gol attı","harika gol","muhteşem gol","vuruş"],
  injury:       ["sakatlık","sakatlandı","ameliyat","kadro dışı","uzak kalacak","kaybetti"],
  squad_out:    ["ayrıldı","veda","yollar ayrıldı","sözleşmesi feshedildi","kadrodan çıkarıldı","gönderildi"],
  press_conf:   ["açıkladı","konuştu","dedi ki","söyledi","açıklamasında","basın toplantısı"],
  record:       ["rekor","tarihe geçti","ilk kez","tarihinde ilk","efsane","eşsiz"],
  controversy:  ["tartışma","tepki","kırmızı kart","hakem","skandal","şikaye","ceza"],
  ranking:      ["zirve","lider","düştü","yükseldi","puan tablosu","sıralama"],
};

function detectStory(text) {
  const t = text.toLowerCase();
  for (const [type, signals] of Object.entries(STORY_SIGNALS)) {
    if (signals.some(s => t.includes(s))) return type;
  }
  return "general";
}

// Özeti temizle: başlık tekrarı + kaynak adını çıkar
function cleanSummaryText(summary, title) {
  if (!summary) return "";
  let s = summary.replace(/\s+/g, " ").trim();

  // Kaynak adı kalıpları: "- T24", "| Fotomaç", ".com.tr" sonu
  s = s.replace(/\s*[-–—|]\s*[\w\s\.]{1,30}\.(com|net|org|tr|co\.uk)\S*/gi, "")
       .replace(/\s*(T24|Fotomaç|Hürriyet|Sabah|Milliyet|Habertürk|NTV Spor|beinsports\.com\.tr|sporx\.com)\s*$/i, "")
       .trim();

  // Başlığın ilk 25 karakteri özette tekrar ediyorsa çıkar
  const titleChunk = title.slice(0, 25).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (titleChunk.length > 10) s = s.replace(new RegExp(titleChunk, "i"), "").trim();

  return s;
}

// Özetten TAM CÜMLE seç (asla yarım bırakma)
function pickCompleteSentence(rawSummary, title, maxLen = 120) {
  const s = cleanSummaryText(rawSummary, title);
  if (s.length < 20) return null;

  // Cümlelere böl (nokta, ünlem, soru işareti sonrası)
  const sentences = s.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(x => x.length > 15);

  if (sentences.length === 0) {
    // Bölünemedi — tam metin sığıyorsa al, yoksa alma
    return s.length <= maxLen ? s : null;
  }

  // Tırnak/alıntı içeren varsa önce al (en etkili tweet formatı)
  const quoted = sentences.find(s => /["'«»„"]/.test(s) && s.length <= maxLen);
  if (quoted) return quoted;

  // Sayı içeren (istatistik, para, skor)
  const numSent = sentences.find(s => /\d/.test(s) && s.length <= maxLen);
  if (numSent) return numSent;

  // Sığan ilk tam cümle
  const fits = sentences.find(s => s.length <= maxLen);
  if (fits) return fits;

  return null; // Hiçbir cümle sığmıyorsa boş — yarım bırakmak yerine atla
}

// Kategori + hikaye tipine göre hook seç
function pickHook(storyType, catId, title) {
  const t = title.toLowerCase();
  const hooks = {
    transfer_bomb: ["💣 BOMBA TRANSFER!", "🚨 TRANSFER TAMAM!", "⚡ RESMEN AÇIKLANDI!", "🔥 SON DAKİKA TRANSFER!"],
    transfer_rumor: ["👀 TRANSFER GÜNDEMDE!", "🔍 YAKLAŞIYOR...", "💬 KULİS BİLGİSİ:", "🤔 KİM OLACAK?"],
    match_win:    ["⚽ BÜYÜK GALİBİYET!", "🏆 3 PUAN TAMAM!", "💪 KESİN ÜSTÜNLÜK!"],
    match_draw:   ["🤝 PUANLAR PAYLAŞILDI", "📊 BERABERLİK SONUCU..."],
    match_loss:   ["😔 AĞIR YENILGI", "📉 KÖTÜ GECİ..."],
    goal_hero:    ["⚽ MUHTEŞEM GOL!", "🌟 YILDIZ PARADI!", "🎯 HAT-TRİCK!"],
    injury:       ["🚑 SAKАТLIK HABERI", "❌ KADRO DIŞI!"],
    squad_out:    ["👋 VEDA VAKTİ", "🔄 YOLLAR AYRILIYOR..."],
    press_conf:   ["🎤 RESMİ AÇIKLAMA:", "📢 DUYURULDU:"],
    record:       ["📈 TARİHİ REKOR!", "🏅 TARİHE GEÇTİ!"],
    controversy:  ["🔥 TARTIŞMA YARATTI!", "😡 BÜYÜK TEPKİ!", "⚠️ SKANDAL!"],
    ranking:      ["📊 PUAN TABLOSU", "📈 ZİRVE HAREKETİ!"],
    general:      ["📰 SON DAKİKA", "⚡ GELİŞME", "🎯 DİKKAT", "🔔 DUYURU"],
  };

  // Çorum FK için özel hooklar (daha enerjik, ünlem)
  if (catId === "corumsporhaber") {
    const corumHooks = {
      transfer_bomb: ["🚨 ÇORUM FK'DA TRANSFER TAMAM!", "💣 BOMBA! ÇORUM FK RESMEN AÇIKLADI!", "🔴⚫ ÇORUM FK'DAN BÜYÜK HAMLE!"],
      transfer_rumor: ["👀 ÇORUM FK HAREKETLENİYOR!", "🔍 ÇORUM FK'NIN YENİ HEDEFİ...", "⚡ ÇORUM FK PEŞINDE!"],
      match_win:    ["💪 ÇORUM FK 3 PUANI ALDI!", "🔴⚫ ÇORUM FK KAZANDI!", "⚽ ÇORUM FK'DAN BÜYÜK GALİBİYET!"],
      match_draw:   ["🤝 ÇORUM FK PUAN PAYLAŞTI"],
      match_loss:   ["😤 ÇORUM FK YENİLDİ — NEDEN?"],
      press_conf:   ["🎤 ÇORUM FK'DAN RESMİ AÇIKLAMA!", "📢 ÇORUM FK YÖNETİMİ KONUŞTU!"],
      squad_out:    ["👋 ÇORUM FK'DA BÜYÜK VEDA!", "🔄 ÇORUM FK'DAN AYRILIK!"],
      injury:       ["🚑 ÇORUM FK'DA SAKАТLIK HABERI!"],
      record:       ["📈 TARİHİ BAŞARI! ÇORUM FK"],
      controversy:  ["🔥 ÇORUM FK'DA BÜYÜK TARTIŞMA!"],
      general:      ["🔴⚫ ÇORUM FK", "⚡ ÇORUM FK'DAN SON DAKİKA!", "📌 ÇORUM FK"],
    };
    const catHooks = corumHooks[storyType] || corumHooks.general;
    return catHooks[Math.floor(Date.now() / 10000) % catHooks.length];
  }

  const typeHooks = hooks[storyType] || hooks.general;
  return typeHooks[Math.floor(Date.now() / 10000) % typeHooks.length];
}

// Merak uyandıran CTA (Call-to-Action)
function pickCTA(storyType) {
  const ctas = {
    transfer_bomb: ["Detayları okumak için ↓", "Kim, kaça, nereye? ↓"],
    transfer_rumor: ["Son gelişmeler için ↓", "Peki gerçekleşecek mi? 👇"],
    match_win: ["Maç özeti için ↓", "Gol anları için ↓"],
    goal_hero: ["İzlemek için ↓", "Gol anı için ↓"],
    injury: ["Son durum için ↓", "Açıklama için ↓"],
    squad_out: ["Ayrılık detayları ↓"],
    press_conf: ["Tüm açıklama için ↓"],
    controversy: ["Ne düşünüyorsunuz? 👇", "Siz ne diyorsunuz? 🗣️"],
    record: ["Tarihi başarı için ↓"],
    general: ["👇", "Devamı için ↓", "Detaylar için ↓"],
  };
  const list = ctas[storyType] || ctas.general;
  return list[Math.floor(Date.now() / 8000) % list.length];
}

// ─── Ana viral tweet builder ──────────────────────────────────────────────────
function buildTweetText(item, catId) {
  const title     = (item.title || "").trim();
  const summary   = (item.summary || "").replace(/\s+/g, " ").trim();
  const combined  = title + " " + summary;
  const hashtags  = (CATEGORIES.find(c => c.id === catId)?.hashtags || ["Futbol"])
    .map(h => `#${h}`).join(" ");

  const storyType = detectStory(combined);
  const hook      = pickHook(storyType, catId, title);
  const cta       = pickCTA(storyType);

  // Başlığı temizle — kaynak adı, pipe, domain çıkar
  const cleanTitle = title
    .replace(/\s*[-–—|]\s*[\w\s\.]{1,30}\.(com|net|org|tr|co\.uk)\S*/gi, "")
    .replace(/\s*[-–—]\s*(T24|Fotomaç|Hürriyet|Sabah|Milliyet|Habertürk|NTV Spor|sporx|bein)\s*$/i, "")
    .trim();

  // Başlığa ünlem/soru ekle (uygunsa)
  let formattedTitle = cleanTitle;
  if (!/[!?…]$/.test(formattedTitle)) {
    const t = formattedTitle.toLowerCase();
    if (["transfer","talip","görüşme","peşinde","istiyor","anlaştı","resmen"].some(k => t.includes(k)))
      formattedTitle += "!";
    else if (["neden","nasıl","kim","hangi","mi?","mı?"].some(k => t.includes(k)))
      formattedTitle += "?";
  }

  // TAM CÜMLE seç (yarım bırakma)
  const keySent = pickCompleteSentence(summary, title, 115);

  // ─── Tweet montajı — her bölüm ya TAM ya da HİÇ ───────────────────────────
  // Karakter bütçesi: 250 max (URL için 24 karakter ayrılıyor, Twitter t.co)
  const BUDGET = 250;

  // v1: Hook + başlık + cümle + CTA + hashtag
  const v1 = [hook, "", formattedTitle, keySent ? `\n${keySent}` : "", "", cta, "", hashtags]
    .join("\n").replace(/\n{3,}/g, "\n\n").trim();

  if (v1.length <= BUDGET) return v1;

  // v2: Hook + başlık + CTA + hashtag (cümle çıkar)
  const v2 = [hook, "", formattedTitle, "", cta, "", hashtags].join("\n").trim();
  if (v2.length <= BUDGET) return v2;

  // v3: Hook + başlık + hashtag (CTA da çıkar)
  const v3 = [hook, "", formattedTitle, "", hashtags].join("\n").trim();
  return v3.length <= BUDGET ? v3 : v3.slice(0, BUDGET);
}

function openTweet(text, url) {
  const params = new URLSearchParams({ text });
  if (url) params.set("url", url);
  const tweetUrl = `https://twitter.com/intent/tweet?${params.toString()}`;
  window.open(tweetUrl, "_blank", "width=600,height=500,scrollbars=yes,resizable=yes");
}

function NewsItem({ item, catId }) {
  const isCorumCat = catId === "corumsporhaber";
  const [expanded, setExpanded]       = useState(false);
  const [editing, setEditing]         = useState(false);
  const [tweetText, setTweetText]     = useState("");
  const [copied, setCopied]           = useState(false);
  const [customImage, setCustomImage] = useState(item.image || "");
  const [editingImg, setEditingImg]   = useState(false);
  const [imgInput, setImgInput]       = useState(item.image || "");

  useEffect(() => {
    setTweetText(buildTweetText(item, catId));
  }, [item.title, catId]);

  const applyImage = () => {
    setCustomImage(imgInput);
    setEditingImg(false);
  };

  // Twitter karakter sayısı: text + " " + url (23 char)
  const urlLen      = item.link ? 24 : 0;
  const totalChars  = tweetText.length + urlLen;
  const charColor   = totalChars > 275 ? "#e74c3c" : totalChars > 250 ? "var(--yellow)" : "#2a9d4a";

  const relTime = (d) => {
    if (!d) return "";
    const h = Math.floor((Date.now() - new Date(d)) / 3600000);
    return h < 1 ? "Az önce" : h < 24 ? `${h}s önce` : `${Math.floor(h / 24)}g önce`;
  };

  const handleCopy = () => {
    const full = tweetText + (item.link ? "\n" + item.link : "");
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Paragraflar
  const paragraphs = (item.summary || "").split(/\n{2,}|\n/).map(p => p.trim()).filter(Boolean);

  return (
    <div style={{
      background: "#0e0e0e",
      border: "1px solid #1c1c1c",
      borderLeft: `4px solid ${catId === "corumsporhaber" || catId === "milli" ? "#e30a17" : "var(--yellow)"}`,
      marginBottom: "14px",
    }}>
      {/* Haber özeti satırı */}
      <div style={{ display: "flex", gap: "12px", padding: "14px 14px 10px" }}>
        {/* Fotoğraf — tıklanabilir, düzenlenebilir */}
        <div style={{ flexShrink: 0, position: "relative" }}>
          {customImage ? (
            <img
              src={customImage} alt=""
              style={{ width: "100px", height: "70px", objectFit: "cover", borderRadius: "2px", display: "block" }}
              onError={e => {
                if (isCorumCat && e.target.src !== CORUM_BADGE) {
                  e.target.src = CORUM_BADGE;
                  e.target.style.objectFit = "contain";
                  e.target.style.padding = "6px";
                  e.target.style.background = "#111";
                } else {
                  e.target.style.display = "none";
                }
              }}
            />
          ) : (
            <div style={{ width: "100px", height: "70px", background: "#1a1a1a", borderRadius: "2px",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📷</div>
          )}
          {/* Fotoğraf değiştir butonu — görselin üzerinde */}
          <button
            onClick={() => setEditingImg(v => !v)}
            title="Fotoğrafı değiştir"
            style={{
              position: "absolute", bottom: "2px", right: "2px",
              background: "rgba(0,0,0,0.75)", border: "none", color: "var(--yellow)",
              fontSize: "10px", padding: "2px 5px", cursor: "pointer", borderRadius: "2px",
              fontFamily: "var(--font-mono)",
            }}>
            ✏️
          </button>
        </div>

        {/* Fotoğraf URL girişi */}
        {editingImg && (
          <div style={{
            position: "absolute", zIndex: 10, background: "#0e0e0e",
            border: "1px solid var(--yellow)", padding: "10px", width: "300px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.8)", marginLeft: "110px",
          }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--yellow)", marginBottom: "6px" }}>
              📷 FOTOĞRAF URL'İ
            </p>
            <input
              value={imgInput}
              onChange={e => setImgInput(e.target.value)}
              placeholder="https://... (resim URL'si yapıştır)"
              style={{
                width: "100%", background: "#111", border: "1px solid #333", color: "#eee",
                padding: "7px 8px", fontFamily: "var(--font-mono)", fontSize: "10px",
                boxSizing: "border-box", marginBottom: "6px",
              }}
            />
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={applyImage}
                style={{ flex: 1, background: "var(--yellow)", color: "#000", border: "none",
                  padding: "6px", fontFamily: "var(--font-mono)", fontSize: "10px", cursor: "pointer", fontWeight: "700" }}>
                UYGULA
              </button>
              <button onClick={() => setEditingImg(false)}
                style={{ background: "transparent", border: "1px solid #333", color: "var(--muted)",
                  padding: "6px 10px", fontFamily: "var(--font-mono)", fontSize: "10px", cursor: "pointer" }}>
                İPTAL
              </button>
            </div>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "5px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", background: "#1a1a1a", color: "var(--yellow)", padding: "2px 7px" }}>
              {item.flag} {item.source}
            </span>
            <span suppressHydrationWarning style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
              {relTime(item.date)}
            </span>
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "#555", textDecoration: "underline" }}>
                🔗 kaynak
              </a>
            )}
          </div>
          <p style={{ fontFamily: "var(--font-head)", fontSize: "15px", color: "#eee", lineHeight: 1.3, marginBottom: "6px" }}>
            {item.title}
          </p>
          {/* Kısa önizleme */}
          {!expanded && paragraphs[0] && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--muted)", lineHeight: 1.5 }}>
              {paragraphs[0].slice(0, 180)}{paragraphs[0].length > 180 ? "…" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Tam içerik (expand) */}
      {expanded && paragraphs.length > 0 && (
        <div style={{ padding: "0 14px 12px", borderTop: "1px solid #1a1a1a", paddingTop: "12px" }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#ccc", lineHeight: 1.7, marginBottom: "10px" }}>
              {p}
            </p>
          ))}
        </div>
      )}

      {/* Expand / collapse */}
      {paragraphs.length > 1 && (
        <button onClick={() => setExpanded(v => !v)}
          style={{ display: "block", width: "100%", background: "#111", border: "none", borderTop: "1px solid #1a1a1a",
            color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "10px", padding: "7px", cursor: "pointer" }}>
          {expanded ? "▲ Daha az göster" : `▼ Tam haberi gör (${paragraphs.length} paragraf)`}
        </button>
      )}

      {/* Tweet bölümü */}
      <div style={{ borderTop: "1px solid #1c1c1c", padding: "12px 14px", background: "#080808" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.5px" }}>
            🐦 TWEET METNİ {item.link ? "(URL otomatik eklenir)" : ""}
          </span>
          <button onClick={() => setEditing(v => !v)}
            style={{ background: "transparent", border: "1px solid #333", color: "var(--muted)", padding: "3px 10px",
              fontFamily: "var(--font-mono)", fontSize: "9px", cursor: "pointer" }}>
            {editing ? "ÖNIZLE" : "DÜZENLE"}
          </button>
        </div>

        {editing ? (
          <textarea value={tweetText} onChange={e => setTweetText(e.target.value)}
            style={{ width: "100%", minHeight: "100px", background: "#0f0f0f", color: "#e8e8e8",
              border: "1px solid #2a2a2a", padding: "10px", fontFamily: "var(--font-body)", fontSize: "14px",
              lineHeight: 1.6, resize: "vertical", borderRadius: "2px", boxSizing: "border-box" }}
          />
        ) : (
          <pre style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#ccc", background: "#0f0f0f",
            border: "1px solid #1c1c1c", padding: "10px", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6, borderRadius: "2px" }}>
            {tweetText}
            {item.link && (
              <span style={{ color: "#1da1f2", display: "block", marginTop: "4px" }}>{item.link}</span>
            )}
          </pre>
        )}

        {/* Karakter sayacı */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: charColor }}>
              {totalChars}/280 karakter {item.link ? `(metin: ${tweetText.length} + link: ${urlLen})` : ""}
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleCopy}
              style={{ background: copied ? "#0a1a0a" : "transparent", border: `1px solid ${copied ? "#2a7a2a" : "#333"}`,
                color: copied ? "#2a7a2a" : "var(--muted)", padding: "7px 12px",
                fontFamily: "var(--font-mono)", fontSize: "10px", cursor: "pointer" }}>
              {copied ? "✓ KOPYALandı" : "📋 KOPYALA"}
            </button>
            <button
              onClick={() => openTweet(tweetText, item.link)}
              disabled={totalChars > 280}
              style={{ background: totalChars > 280 ? "#333" : "#1da1f2", border: "none", color: "#fff",
                padding: "7px 18px", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "700",
                cursor: totalChars > 280 ? "not-allowed" : "pointer", letterSpacing: "0.5px",
                opacity: totalChars > 280 ? 0.5 : 1 }}>
              🐦 TWEETLE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [data, setData]         = useState(null);
  const [liveNews, setLiveNews] = useState({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [activeCat, setActiveCat] = useState("corumsporhaber");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    // Statik veri
    fetch("/data/football.json")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => {
        setError("football.json yüklenemedi. Önce 'node lib/fetchData.js' çalıştır.");
        setLoading(false);
      });

    // Canlı haberler — site ile aynı kaynak
    fetch("/api/live-news")
      .then(r => r.json())
      .then(d => {
        if (!d.items?.length) return;
        const grouped = {};
        for (const item of d.items) {
          const c = item.cat || item.category || "general";
          if (!grouped[c]) grouped[c] = [];
          grouped[c].push(item);
        }
        setLiveNews(grouped);
      })
      .catch(() => {});
  }, []);

  const CORUM_BADGE_URL = "https://upload.wikimedia.org/wikipedia/tr/3/37/%C3%87orum_FK.png";
  const rawStaticNews = data?.news || {};
  // Çorum FK Unsplash → logo
  const staticNews = {
    ...rawStaticNews,
    corumsporhaber: (rawStaticNews.corumsporhaber || []).map(n => ({
      ...n,
      image: n.image?.includes("unsplash") ? CORUM_BADGE_URL : n.image,
    })),
  };
  const STATIC_MAX_AGE_MS = 30 * 24 * 3600_000;
  const [cutoffTs] = useState(() => Date.now() - STATIC_MAX_AGE_MS);
  const mergeNews = (cat) => {
    const live    = liveNews[cat]   || [];
    const static_ = staticNews[cat] || [];
    const cutoff  = cutoffTs;
    let freshStatic = static_.filter(n => !n.date || new Date(n.date).getTime() > cutoff);
    if (freshStatic.length < 3 && static_.length > 0)
      freshStatic = [...static_].sort((a,b) => new Date(b.date||0)-new Date(a.date||0)).slice(0,3);
    const staticByKey = new Map(freshStatic.map(n => [n.title.slice(0,30).toLowerCase(), n]));
    const processedLive = live.map(n => {
      const key   = n.title.slice(0,30).toLowerCase();
      const match = staticByKey.get(key);
      return { ...(match||{}), ...n, image: n.image||(match?.image)||null, summary: n.summary||(match?.summary)||'' };
    });
    const liveKeys = new Set(processedLive.map(n => n.title.slice(0,30).toLowerCase()));
    const remaining = freshStatic.filter(n => !liveKeys.has(n.title.slice(0,30).toLowerCase()));
    return [...processedLive, ...remaining].sort((a,b) => new Date(b.date||0)-new Date(a.date||0));
  };

  const news = {
    corumsporhaber: mergeNews("corumsporhaber"),
    milli:          mergeNews("milli"),
    superlig:       mergeNews("superlig"),
    transfer:       mergeNews("transfer"),
    worldcup:       mergeNews("worldcup"),
    general:        mergeNews("general"),
    magazine:       staticNews.magazine || [],
  };

  const updatedAt = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleString("tr-TR")
    : "—";

  const catItems = news[activeCat] || [];
  const items = search
    ? catItems.filter(n => (n.title + n.summary + n.source).toLowerCase().includes(search.toLowerCase()))
    : catItems;

  return (
    <>
      {/* Sticky header */}
      <div style={{ background: "#0a0a0a", borderBottom: "3px solid var(--yellow)", padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Üst çubuk */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0 8px" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-head)", fontSize: "22px", color: "#fff" }}>
                GOL<span style={{ color: "var(--yellow)" }}>POST</span>
                <span style={{ fontSize: "14px", color: "var(--muted)", fontFamily: "var(--font-mono)", marginLeft: "10px" }}>Tweet Paneli</span>
              </h1>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#333", marginTop: "2px" }}>
                Son güncelleme: {updatedAt}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input placeholder="Haber ara..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ background: "#111", border: "1px solid #2a2a2a", color: "#eee",
                  padding: "7px 12px", fontFamily: "var(--font-mono)", fontSize: "11px", width: "180px", borderRadius: "2px" }}
              />
              <a href="/" style={{ background: "var(--yellow)", color: "#0a0a0a", padding: "7px 14px",
                fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: "700", textDecoration: "none" }}>
                ← SİTE
              </a>
            </div>
          </div>

          {/* Kategori sekmeleri */}
          <div style={{ display: "flex", gap: "2px", overflowX: "auto", paddingBottom: "0" }}>
            {CATEGORIES.map(cat => {
              const count = (news[cat.id] || []).length;
              return (
                <button key={cat.id} onClick={() => setActiveCat(cat.id)}
                  style={{
                    background: activeCat === cat.id
                      ? (cat.id === "corumsporhaber" || cat.id === "milli" ? "#e30a17" : "var(--yellow)")
                      : "transparent",
                    color: activeCat === cat.id ? "#fff" : "var(--muted)",
                    border: "none", padding: "10px 16px", fontFamily: "var(--font-mono)",
                    fontSize: "10px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "16px 20px 40px" }}>

        {/* Bilgi kutusu */}
        <div style={{ background: "#0a150a", border: "1px solid #1a2a1a", borderLeft: "3px solid var(--yellow)",
          padding: "10px 14px", marginBottom: "16px", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
          <span style={{ color: "var(--yellow)" }}>🐦 Nasıl kullanılır:</span>
          <span style={{ color: "var(--muted)" }}> Tweet metnini incele → gerekirse DÜZENLE → <strong style={{ color: "#1da1f2" }}>TWEETLE</strong> butonuna bas → Twitter'da paylaş. URL otomatik eklenir. Tamamen ücretsiz.</span>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
            Yükleniyor...
          </div>
        )}

        {error && (
          <div style={{ background: "#1a0a0a", border: "1px solid #c0392b", padding: "14px 18px",
            fontFamily: "var(--font-mono)", fontSize: "12px", color: "#e74c3c", marginBottom: "16px" }}>
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ textAlign: "center", padding: "50px", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
            Bu kategoride haber yok.
            {activeCat === "corumsporhaber" && (
              <p style={{ marginTop: "10px", color: "#333", fontSize: "11px" }}>
                <code style={{ color: "var(--yellow)" }}>node lib/fetchData.js</code> çalıştırarak verileri güncelle.
              </p>
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
