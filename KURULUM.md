# 🚀 GOALPOST — Yayına Alma Rehberi (Senin Yapacakların)

Kod tarafı hazır. Aşağıdaki adımlar **senin hesaplarınla** yapılması gerekenler.
Hepsi **ücretsiz**. Sırayla takip et.

---

## 1) football-data.org ücretsiz API anahtarı (zaten aldın ✅)

- Anahtarın: `22a651d6a18748d1b6bada0a7bec1117`
- Lokal `.env.local` dosyasına eklendi (bu dosya GitHub'a **gitmez**).
- Yeni anahtar almak istersen: https://www.football-data.org/client/register

---

## 2) GitHub'da repo oluştur

**Seçenek A — terminalden (gh CLI kuruluysa):**
```bash
cd "C:\Users\Kutay Erdem\Desktop\goalpost"
gh auth login          # ilk kez ise GitHub'a giriş
gh repo create goalpost --public --source=. --remote=origin --push
```

**Seçenek B — web'den:**
1. https://github.com/new → Repository name: `goalpost` → **Public** → Create.
2. Sonra terminalde:
```bash
cd "C:\Users\Kutay Erdem\Desktop\goalpost"
git remote add origin https://github.com/KULLANICI_ADIN/goalpost.git
git push -u origin main
```

---

## 3) GitHub Secret ekle (API anahtarı için)

Repo sayfasında:
**Settings** → sol menü **Secrets and variables** → **Actions** →
**New repository secret**:
- **Name:** `FOOTBALL_DATA_API_KEY`
- **Secret:** `22a651d6a18748d1b6bada0a7bec1117`
- **Add secret**

> Bu sayede GitHub Actions her çalıştığında anahtarı güvenle kullanır.

---

## 4) Vercel'e deploy et (ücretsiz hosting)

```bash
npm i -g vercel
cd "C:\Users\Kutay Erdem\Desktop\goalpost"
vercel            # ilk kez: sorulara Enter / projeyi bağla
vercel --prod     # canlı yayın
```
- Vercel sana bir `https://goalpost-xxx.vercel.app` adresi verir.
- Vercel panelinde de **Settings → Environment Variables**'a
  `FOOTBALL_DATA_API_KEY` eklemen iyi olur (build sırasında veri tazelemek istersen).

---

## 5) GitHub Actions'ı manuel test et

1. Repo → üstte **Actions** sekmesi.
2. Soldan **"Daily Football Data Update"** workflow'unu seç.
3. Sağda **"Run workflow"** → **Run workflow** butonuna bas.
4. ~1-2 dk sonra yeşil tik görünür; `public/data/football.json` otomatik güncellenip commit edilir.

> Otomatik takvim: **Türkiye saatiyle 08:00, 14:00, 20:00, 02:00** (günde 4 kez).

---

## Çalışma mantığı (tamamen ücretsiz)

```
GitHub Actions (günde 4x)
   └─ node lib/fetchData.js
        ├─ RSS (BBC, Sky, Guardian, ESPN, Fotomaç, Sabah) → futbol filtresi → Türkçe çeviri
        ├─ football-data.org → fikstür/sonuç + Dünya Kupası + takım formu
        └─ lib/analysis.js → ücretsiz istatistiksel tahmin (AI yok)
   └─ public/data/football.json güncellenir → commit → Vercel otomatik yeniden deploy
```

Hiçbir ödemeli API yok. Toplam maliyet: **$0**.
