# ⚽ GOALPOST — Dünya Futbol Magazini

Tamamen ücretsiz, her gün otomatik güncellenen futbol haber sitesi.

## Özellikler

- 📰 **Gündem** — BBC Sport, Sky Sports, Goal.com, The Guardian'dan günlük haberler
- 📅 **Fikstürler** — Premier League, La Liga, Bundesliga, Serie A, Ligue 1, UCL
- 🔄 **Transfer** — Yaz/kış transfer haberleri
- ⭐ **Magazin** — Futbol dünyasından ilginç haberler
- 🌍 **Dünya Kupası 2026** — Gruplar, fikstür, geri sayım (canlı!)
- 🔴 **Breaking news banner**
- 📡 **Canlı ticker**

## Maliyet: **$0**

| Servis | Kullanım | Maliyet |
|--------|----------|---------|
| football-data.org | Fikstür & skor API | Ücretsiz |
| RSS Feeds | BBC, Sky, Goal, Guardian | Ücretsiz |
| GitHub Actions | Günlük otomatik güncelleme | Ücretsiz |
| Vercel | Hosting & CDN | Ücretsiz |

---

## Kurulum (15 dakika)

### 1. Repo oluştur ve kodu yükle

```bash
git init goalpost
cd goalpost
# Bu klasörün içeriğini kopyala
git add .
git commit -m "ilk commit"
```

### 2. GitHub'a yükle

```bash
gh repo create goalpost --public
git push -u origin main
```

### 3. Ücretsiz API anahtarı al

→ https://www.football-data.org/client/register  
→ E-mail ile ücretsiz kayıt, API anahtarını hemen gönderirler

### 4. Vercel'e deploy et

```bash
npm i -g vercel
vercel --prod
```

→ Vercel sana 3 değer verecek: Token, Org ID, Project ID

### 5. GitHub Secrets ekle

Repo → Settings → Secrets and variables → Actions → New repository secret:

- `FOOTBALL_DATA_API_KEY` = football-data.org'dan aldığın anahtar
- `VERCEL_TOKEN` = vercel'den aldığın token
- `VERCEL_ORG_ID` = vercel org id
- `VERCEL_PROJECT_ID` = vercel project id

### 6. Test et

```bash
# Manuel bir kez çalıştır
node lib/fetchData.js

# Lokal çalıştır
npm run dev
# → http://localhost:3000
```

Artık her gün sabah 07:00'de GitHub Actions otomatik çalışır, verileri günceller ve Vercel'e deploy eder. **Tamamen ücretsiz.**

---

## Klasör Yapısı

```
goalpost/
├── pages/
│   ├── index.js          # Ana sayfa
│   └── _app.js
├── components/
│   ├── NewsCard.js       # Haber kartı (görselli, tıklanabilir)
│   ├── FixtureRow.js     # Maç satırı
│   ├── Countdown.js      # Dünya Kupası geri sayım
│   ├── WorldCupTab.js    # Dünya Kupası sekmesi
│   └── Ticker.js         # Haber bandı
├── lib/
│   ├── fetchData.js      # Günlük veri çekme scripti
│   ├── worldCupData.js   # DK 2026 statik veriler
│   └── staticData.js     # Fallback veriler
├── public/data/
│   └── football.json     # Her gün güncellenen veri dosyası
└── .github/workflows/
    └── daily-update.yml  # Otomatik güncelleme
```
