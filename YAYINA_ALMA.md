# 🚀 GOALPOST — Yayına Alma Rehberi
## (Tahmini süre: 15 dakika, tamamen ücretsiz)

---

## ADIM 1 — GitHub Hesabı
→ https://github.com adresinden hesap aç (varsa giriş yap)

---

## ADIM 2 — Yeni Repo Oluştur

1. GitHub'da sağ üstte **"+"** → **"New repository"**
2. Repository name: `goalpost`
3. **Public** seç (ücretsiz Actions için şart)
4. **Initialize this repository** kutucuklarını İŞARETLEME (zaten kodumuz var)
5. **Create repository** tıkla
6. Açılan sayfada "Quick setup" bölümündeki HTTPS URL'yi kopyala:
   `https://github.com/KULLANICI_ADIN/goalpost.git`

---

## ADIM 3 — Kodu GitHub'a Gönder

**Powershell veya CMD'yi** `C:\Users\Kutay Erdem\Desktop\goalpost` klasöründe aç ve şu komutları çalıştır:

```bash
# Kopyaladığın URL'yi buraya yapıştır:
git remote add origin https://github.com/KULLANICI_ADIN/goalpost.git

# Kodu gönder:
git push -u origin main
```

> GitHub kullanıcı adı ve şifre (veya token) isteyecek — GitHub'a giriş bilgilerini gir.
> **Not:** GitHub artık şifre yerine Personal Access Token istiyor:
> → https://github.com/settings/tokens → "Generate new token (classic)"
> → "repo" iznini seç → Token oluştur → Şifre yerine bu token'ı kullan

---

## ADIM 4 — GitHub Secret Ekle (API Anahtarı)

Repo sayfasında:
**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Name | Secret |
|------|--------|
| `FOOTBALL_DATA_API_KEY` | `22a651d6a18748d1b6bada0a7bec1117` |

→ **Add secret** tıkla

---

## ADIM 5 — Vercel'e Deploy Et (ÜCRETSİZ)

### Seçenek A — Web Arayüzü (Kolay, önerilen)

1. → https://vercel.com → **Sign up with GitHub** (GitHub hesabınla giriş)
2. **"Add New Project"** tıkla
3. GitHub repoları listesinden **goalpost** seç → **Import**
4. Ayarlar otomatik doldurulur (Next.js algılanır)
5. **Environment Variables** bölümüne ekle:
   - `FOOTBALL_DATA_API_KEY` = `22a651d6a18748d1b6bada0a7bec1117`
6. **Deploy** tıkla → ~2 dakika bekle
7. Sana `goalpost-xxx.vercel.app` adresi verilecek ✅

### Seçenek B — Terminal (CLI)

```bash
# goalpost klasöründe:
vercel login          # tarayıcıda GitHub ile giriş
vercel                # proje bağla (Enter ile geç)
vercel --prod         # canlı yayına al
```

---

## ADIM 6 — Otomatik Güncelleme Testi

GitHub repo sayfasında:
**Actions** sekmesi → **"Daily Football Data Update"** → **"Run workflow"** → **Run workflow**

~2 dakika sonra yeşil tik ✅ görünmeli ve football.json güncellenip Vercel'e otomatik deploy olmalı.

---

## Çalışma Mantığı (Tamamen Ücretsiz)

```
Her gün 08:00, 14:00, 20:00, 02:00 (Türkiye saati):
  GitHub Actions çalışır
    ↓
  node lib/fetchData.js
  (Çorum FK haberleri + Milli + Süper Lig + Dünya + Maçlar + Analizler)
    ↓
  public/data/football.json güncellenir
    ↓
  git commit + push (otomatik)
    ↓
  Vercel push algılar → otomatik yeniden deploy (~1 dk)
    ↓
  goalpost.vercel.app güncel haberlerle yayında ✅
```

## Maliyet: $0
- GitHub Free: Sınırsız public repo + 2000 Actions dakika/ay
- Vercel Free: Sınırsız deploy + 100GB bandwidth/ay
- football-data.org: Ücretsiz tier (zaten kayıtlı)
- Google News RSS: Ücretsiz
- BBC/Sky/Guardian RSS: Ücretsiz
