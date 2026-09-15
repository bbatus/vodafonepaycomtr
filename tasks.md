# Görev Listesi

**15.09.2026 — bu dosya yeni.** Bu repo 31.08.2026'ya kadar `vodafonepaycomtr`
monorepo'sunun bir alt klasörüydü; o tarihten önceki tüm iş (Payload/CMS
tarafıyla iç içe geçmiş, çoğu zaman aynı madde hem `cms/` hem
`vodafonepaycomtr/` dosyalarını birlikte değiştiriyordu) tam ve kesintisiz
haliyle `clover/tasks.md`'de duruyor — orası artık o ortak geçmişin tek nüshası.
Bu dosya, repo ayrımından (item 41, 31.08.2026) sonra SADECE bu repoyu (site)
ilgilendiren işleri, sıfırdan başlayarak tutuyor. İlk madde (45), o dosyadan
buraya taşınan tek istisna — tamamen site'a özel olduğu için birebir buraya
kopyalandı, oradan silinmedi (tam tarih zaten orada da duruyor).

Durum anahtarı: `[ ]` yapılacak · `[x]` yapıldı + canlı doğrulandı · `[!]` inceledi, yapılmadı (gerekçe yazılı)

---

## 45. Kampanya kartları + detay sayfası, canlı siteye göre (02.09.2026)

Kullanıcının canlı vodafonepay.com.tr ekran görüntülerine göre iki fix.

- [x] **Kampanya kartları** (kampanyalar listesi + campaignGrid bloğu + CMS
      kart önizlemesi) artık sadece görsel + başlık + "Detayları gör" —
      açıklama ve tarih kaldırıldı. `CardListItem`'dan `startDate`/`endDate`
      tamamen kaldırıldı (ölüydü, canlıda kartlarda hiç tarih yok);
      `description` alanı Blog kartları için kaldı, kampanyalar artık hiç
      geçmiyor.
- [x] **Kampanya detay sayfası**: başlık/açıklama/tarih solda tek sütun,
      görsel sağda (`lg:flex-row`) — önceden görsel üstte tam genişlik,
      başlık/açıklama altında tek sütundu.
- [x] **Gri section wrapper**: "Kampanya Detay" başlığından footer'a kadar
      olan alan artık `#f4f4f4` arkaplanlı — canlıda böyle, bizde her yer
      beyazdı. İçerik yoksa (ne body ne terms) bölüm hiç render edilmiyor.
- [x] **Font kontrolü**: canlı site VodafoneLight/Regular/Bold kullanıyor,
      biz de `next/font/local` ile aynı üç fontu self-host edip her yerde
      kullanıyoruz — kontrol ettim, düzeltilecek bir font sorunu çıkmadı.
      AGENTS.md → Design Principles'a bunu koruyacak bir madde eklendi.

**DoD / doğrulama:** site 392/392 test yeşil, `tsc`/eslint temiz. Docker'da
gerçek `--build` sonrası: `/kampanyalar` kartları sadece görsel+başlık+buton,
`/kampanyalar/ulasim-kartina-bakiye-yukle-25-tl-nakit-iade-kazan` detay
sayfasında iki sütunlu üst blok + "Kampanya Detay"tan footer'a kadar gri
section, tüm görünür metin `vodafoneLight/Regular/Bold` font-family (başka
hiçbir font yok).
