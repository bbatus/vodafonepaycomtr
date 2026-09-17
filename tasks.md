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

## 48a-site. 'Ürünler' menüsü ve site haritası tek kaynaktan okuyor (16.09.2026)

CMS tarafındaki karşılığı ve tam gerekçesi: `clover/tasks.md` madde 48.

`Header.tsx`, Ürünler açılır listesini NavLinks(header-products) +
Pages(showInProductsMenu) olarak birleştirip **href'e göre tekilleştirmiyordu**
— aynı sayfayı iki yoldan ekleyen editör menüde onu iki kez görüyordu. CMS'te
ikinci kaynak kaldırıldığı için burada da tek kaynağa indi.

- [x] `Header.tsx`: Ürünler artık sadece Pages'ten.
- [x] `site-haritasi/page.tsx`: "Ürünler" grubu da NavLinks(header-products)'tan
      geliyordu — kaynak kalkınca sessizce düşecekti; aynı Pages kaynağından
      yeniden kuruldu, böylece site haritası ile header ayrışamıyor.
- [x] `cms.ts`: `header-products` union'da "emekli" olarak kaldı (göçü
      uygulanmamış bir DB hâlâ o değeri taşıyan satırlar içerebilir; okunmuyor).
- [x] Testler: bayat bir header-products satırının sayfayı ikinci kez
      listelemediğini kanıtlayan regresyon testi + site haritası Ürünler grubu
      testi. Site 394/394, tsc/eslint temiz.

**Canlı doğrulama (docker `--build` sonrası):** Ürünler menüsü 6 ürün, her biri
tek kez, sıra korunmuş (Vodafone Pay Uygulaması → Kart → QR ile Öde → Faturana
Yansıt → Anında Bakiye → Vodafone Pay Detayları); `/site-haritasi` aynı 6
kaydı gösteriyor, diğer gruplar bozulmadı.

## 49-site. Faz 1: `/` bayrağa göre (17.09.2026)

Tam plan, kararlar, DB göçleri ve bulgular: `clover/tasks.md` #49.

- [x] `getHomepage()` — slug değil `isHomepage` bayrağı; `/` onunla okuyor.
- [x] İşaretli sayfanın kendi slug'ı → 308 `/`; işaretsiz bir "anasayfa"
      slug'ı artık sıradan sayfa.
- [x] sitemap + generateStaticParams bayrağa göre; `src/lib/homepage.ts` silindi.
- [x] Site 397/397, tsc/eslint temiz.
- [x] Canlı (`next dev`): bayrak taşınınca `/` ve yönlendirmeler bayrağı
      takip etti, geri alınınca eski hali.
- [ ] Docker imajıyla doğrulanmadı — Docker Desktop'ta çekme asılı (bkz. clover #49).

## 52-site. /ucretler-ve-limitler canlıyla birebir (17.09.2026)

Kullanıcı: "tıpatıp aynı olmalı". Canlı sayfa (1440px) ile bizimki yan yana çekildi. Canlının CSS kuralları, sayfanın kendi CSSOM'undan kural kural okundu; hesaplanan stiller ve `document.fonts` de karşılaştırıldı.
- `PricesAndLimits.tsx` baştan yazıldı: gri bant (#f2f2f2, 20px), sekmelerin beyaz kapsayıcısı (300px, köşe 8px/6px), 1028px sabit tablo, 104px satırlar ve aralarında #e5e5e5 çizgi, hücre dolgusu 32/40px, 16px köşeler. Canlıdaki `tr:nth-child(7)` 260px tuhaflığı da bilerek kopyalandı. Limitlerde başlıklar 28/34px, altlarında 24px boşluk. ≤1028 / ≤768 / ≤480px kırılımları da canlıyla aynı.
- Yeni içerik türleri: ara başlık satırı, yeşil değer, çok satırlı değer, tablonun altında linkli not, limit tablosu dipnotu (clover #52).
- Sayfada görünür H1 yok (canlıda da yok); H1 artık `sr-only`.
- Font bulguları: canlı sitede `VodafoneBold` için hiç @font-face tanımı yok, bu yüzden tablonun ilk sütunu sistemin genel kalın sans-serif fontuyla (Mac'te Helvetica) görünüyor. Birebirlik için aynısı yapıldı (`LABEL_FONT`). Vodafone Bold'a çevirmek tek sınıf değişikliği — kullanıcıya soruldu. Ayrıca kök layout'taki `antialiased` Mac'te yazıyı inceltiyordu; bu bölümde `subpixel-antialiased` ile canlının davranışına dönüldü. Font dosyaları canlıdakilerle aynı (hash eşit).
- Kopyalanmayanlar: canlı hücrelerdeki satır içi `Calibri` span'leri (Word'den yapıştırma kalıntısı).
- Kapsam dışı kalan, site genelindeki farklar: header, breadcrumb (canlıda 1300px genişlik ve 20px margin, bizde 1030px; bant bu yüzden 12px yukarıda başlıyor), footer tasarımı.
- Doğrulama: `next dev` 3098 (CMS 3099) + headless Chrome; ölçüler canlıyla aynı (sekmeler 300×56 / 142×48, tablo 1028px genişlik, satırlar 104px, 7. satır 260px, hücre fontları ve renkleri eşit). tsc/eslint temiz, testler 401/401. Mobil kırılımlar CSS kuralı düzeyinde eşlendi ama ekran görüntüsüyle karşılaştırılmadı.

## 54-site. SSS sayfası ve SSS blokları canlıyla birebir (17.09.2026)

Kullanıcı: "Ücretler ve limitler gibi SSS'yi de eşitleyelim." Canlıda iki ayrı widget var: `AllFaqs` (/sikca-sorulan-sorular) ve `General\FAQs` (anasayfa, ürün sayfaları, /kampanyalar; bizde Pages `faqList` bloğu ve /kampanyalar). İkisi de lazy-load sonrası render edilip incelendi: computed stiller, CSSOM kuralları ve tıklama tıklama davranış testi.
- `Faq.tsx` iki varyant oldu:
  - `block` (General\FAQs): 1030px genişlik, 40px dış boşluk, VodafoneRegular. Başlık 28px/leading-tight, VodafoneRegular üzerinde 700 kalınlık (canlıdaki gibi tarayıcı kalınlaştırıyor), lg'de üstte 80px, altta 40px boşluk. Birden fazla cevap aynı anda açık kalabiliyor. Cevap metni 18/27 #333. Başlık metni blok ayarından geliyor.
  - `page` (AllFaqs): 1280px genişlik, altta 30px boşluk. Sorular sistem sans-serif fontunda (canlıda o widget'ta font tanımı yok, bilerek aynısı yapıldı). Aynı anda tek cevap açık; açılınca cevabın üstünde 8px boşluk, ok 180° dönüyor (0.1s). Cevap metni 18/24 #333.
  - Ortak: kart `px-5 py-[22px]`, 4px köşe, gölge `0 2px 8px #00000029`, kartlar arası 20px, cevap paneli #f9fafb. Köşeler px olarak verildi (bizim tema `rounded` değerini büyütüyor). `subpixel-antialiased` (#52-site'taki gibi).
- `FaqCategoryFilter`: breadcrumb kaldırıldı (canlıda yok). Başlık lg:pt-64px, VodafoneLight 40/48. Kategori butonları 600px'lik kırpılmış şeritte, fareyle sürüklenerek kayıyor (canlıda Swiper): 18/28 sistem fontu, `px-4 py-[11px]`, #7E7E7E çerçeve, seçili olan #00697C/beyaz, aralarında 16px. Her buton gerçek `?kategori=<slug>` linki; filtre URL'den okunuyor (paylaşılabilir, geri/ileri çalışıyor). `useSearchParams` için Suspense + "Tümü" seçili fallback.
- Cevap artık CMS'te zengin metin (clover #54): `RichText` ile render ediliyor, düz string de hâlâ kabul ediliyor. `FaqJsonLd` zengin metni düz metne çevirip gönderiyor.
- Doğrulama (1440px, `next dev` 3098 + CMS 3099): SSS sayfasında h1→butonlar 88px, butonlar→ilk soru 92px, kart 1280×68, h3/cevap fontları ve renkleri canlıyla aynı. Blokta (/faturana-yansit, /aninda-bakiye) başlık 28/35 ve 80px üst boşluk, kart 1030×68, cevap 18/27 aynı. Sayfa bizde 14px aşağıdan başlıyor: yerel veride header'a "layout Test Sayfası" linki eklendiği için menü iki satıra düşüyor (veri, SSS kaynaklı değil). Canlıdaki bazı cevaplarda Word'den gelen Times New Roman/Aptos satır içi stilleri var; bunlar kopyalanmadı.
- Yerel veri notu: yerelde "aninda-bakiye" ve "kampanyalar" SSS kategorilerinde yayında soru yok, bu yüzden /aninda-bakiye, anasayfa ve /kampanyalar'da blok boş görünüyor. Bileşen, dolu olan /faturana-yansit üzerinden doğrulandı.
- Testler 408/408, tsc ve eslint temiz.

## 55-site. Kampanyalar: liste, detay ve anasayfa şeridi canlıyla birebir (17.09.2026)

Kullanıcı: "Kampanyaları da ücretler/SSS gibi eşitleyelim; detayda Kampanya Tarihi, Tanımlama Süresi, Katılım alanları da olsun, opsiyonel olsun." Canlıda üç widget var: `Campaigns` (/kampanyalar), `Campaign` (detay, örn. /kampanyalar/yemeksepeti-harcamana-400tlye-varan-avantaj), `Homepage\VpayKampanya` (anasayfa şeridi, üstündeki "Kampanyalar · İncele" satırıyla). Hepsi lazy-load sonrası render edildi; computed stiller, CSSOM kuralları ve davranış (Devamını Oku, carousel) canlıdan ölçüldü.
- `CampaignCard.tsx` (yeni): kart 361px genişlik, 6px köşe, `shadow-md`, `p-5`; görsel 321×180 `object-contain`; başlık VodafoneBold 20/28 #333; ortalanmış "Detayları gör" 18/26 #E60000, sistem fontunda (canlıda o sınıf tanımsız) ve 20px #BD0000 okla. Izgara 1/2/3 sütun, `gap-6 lg:mt-10 lg:ml-8`; bölüm başlığı 24/lg:28, satır yüksekliği 34.
- `CampaignsFilterableList`: başlık sütunu 1030px, `lg:pt-64px`, VodafoneLight 40/48. Masaüstünde butonlar VodafoneRegular 18/28, #7E7E7E çerçeve, seçili #00697C; mobilde 16px, 40px yükseklik, çerçevesiz, yana kayan şerit. "Tümü"de "Bu ayın favorileri" (kartlar +mb-10) ve "Tüm Kampanyalar"; bir kategori seçilince tek ızgara "<Kategori> kampanyaları" başlığıyla. `?kategori=` URL'si + Suspense fallback.
- Detay sayfası baştan yazıldı: breadcrumb yok (canlıda da yok), #f4f4f4 zemin. Beyaz üst bant: solda 300px genişlikte 28/32 başlık, sağda 500px görsel; mobilde başlık ve açıklama görselin altında. Bilgi kutuları (ikon 36px, etiket 18/26 siyah, değer 18/26 #4D4D4D; mobilde 220px'lik yana kayan gri kartlar):
  - Kampanya Tarihi, Tanımlama Süresi, Katılım: HER BİRİ opsiyonel. Değeri olmayan kutu, hiçbiri yoksa bütün satır oluşmuyor.
  - İkonlar canlının SVG'leri: `public/images/kampanya/`.
  - Tarih biçimi `01.09.2026 - 30.09.2026` (İstanbul saati, `lib/campaignDate.ts`).
- Detay sayfasındaki "Kampanya Detay" (lg+) ve "Kampanya Koşulları" kutuları (`CampaignContentBox`): 1280px, `px-10 py-[50px]`, `shadow-md`, başlık 28/34 #333. İçerik 350px'te kesilip 80px'lik beyaz geçişle bitiyor, "Devamını Oku" / "Daha Az Göster" düğmesiyle açılıyor (ok dönüyor); madde işaretleri 20px kalın siyah "•"; linkler #007bff. Detay kutusu zengin gövdeyi, gövde boşsa açıklamayı gösteriyor; içeriği olmayan kutu oluşmuyor.
- `Campaigns.tsx` (daha önce hiçbir yerde kullanılmıyordu) canlı anasayfa şeridi olarak yeniden yazıldı. Başlık satırı: 40/60, weight 700, "İncele >" linki. Şerit: #eeeeee zemin, 1030px, `py-10`, tek slayt (loop ve autoplay yok, canlıdaki gibi). Görsel 200px, 80px boşluk, başlık 25/32; "Detayları gör" butonu 172px, 2px çerçeve, 8px köşe. 48px beyaz ok butonları, uçta %50 opak ve devre dışı; 8px noktalar, seçili olan kırmızı. Mobil düzen ayrı ("Detaylara git", kaydırma).
- Pages "Kampanya Grid" bloğu yeni `layout` alanına göre ızgara ya da şerit render ediyor (clover #55); anasayfa bloğu şeride alındı.
- `Breadcrumb` canlının `widget_General_Breadcrumb`'ına göre yeniden yazıldı (site genelinde): 1300px, `my-5 px-5`, 16/24 siyah, 16px'lik #0D0D0D ok, geçerli sayfa %50 opak; mobilde yalnızca geri oku ve geçerli sayfa. #52-site'ta not edilen 12px'lik kayma bununla kapandı.
- Kaldırılanlar: `CampaignDate.tsx` ve testi (detay sayfası artık kullanmıyor), kullanılmayan `CalendarIcon`. `kart-onizleme` artık `CampaignCard`'ı kullanıyor.
- Doğrulama (1440px, `next dev` 3098 + CMS 3099):
  - Liste: kart 361×325, görsel 321×180, başlıklar ve link canlıyla aynı ölçülerde ve fontta. Yerel veride header'daki test linki nedeniyle 14px aşağıda.
  - Detay: bilgi kutuları 257/207/133 × 84, x=398/671/894 (canlıyla birebir); kutu başlıkları ve madde işaretleri aynı; Devamını Oku 350px → açılır, "Daha Az Göster" + ok dönüyor (canlıda da öyle).
  - Anasayfa şeridi: başlık 40/60, butonlar 1116/1180, noktalar 663/679.
  - Mobil (390px) detay kontrol edildi.
  - Yerelde test için "Pazarama'da %50 İndirim!" (#13) kampanyasına tarih, tanımlama süresi ("24 Saat"), katılım ("1"), gövde ve 7 maddelik koşul girildi (yerel dev veri).
- Testler 415/415, tsc/eslint temiz.

## 56-site. Blog: liste, yazı detayı ve "Daha fazlasını keşfedin" canlıyla birebir (17.09.2026)

Kullanıcı: "Blogları da kampanyalar gibi eşitleyelim; tarih, tablo, başlık fontları, görsel yeri, en alttaki 'Daha fazlasını keşfedin'; ekstra alanlar opsiyonel olsun." Canlıda iki widget: `Blogs` (/blog) ve `Blog` (örn. /blog/ulasim-karti-bakiye-yukleme-yollari-vodafone-pay). Lazy-load sonrası computed stiller, CSSOM kuralları ve filtre davranışı ölçüldü.
- `BlogCard.tsx` (yeni):
  - Çerçeve kampanya kartıyla aynı (361px, 6px, shadow-md, p-5, 321×180 contain).
  - Kartlar hücrede ortalı (`mx-auto`); başlık VodafoneBold 20/28, `h-14 line-clamp-1` flow-root kutusunda (canlıdaki kırpma).
  - Liste kartlarında tek satırlık özet: sistem fontu 16px #666, ortalı, `mb-6`, üç noktayla kesiliyor. Paragrafın 8px üst boşluğu ve 21.28px satır yüksekliği canlıdakiyle aynı.
  - `BlogGrid`: list (`lg:ml-8`) ve related (offset yok) varyantları.
- `CategoryPills.tsx` (yeni): /kampanyalar ve /blog'un birebir aynı olan kategori butonları tek bileşende; `?kategori=` URL'si. `CampaignsFilterableList` da buna geçti.
- /blog: breadcrumb yok (canlıda da yok). `lg:pt-64px`, VodafoneLight 40/48 "Blog". "Tüm Bloglar", kategori seçilince "<Kategori> blogları". Suspense fallback eklendi.
- Blog yazısı detay sayfası baştan yazıldı:
  - Kendi breadcrumb'ı: "Vodafone Pay Bloglar" → /blog, VodafoneLight, `py-3` (`Breadcrumb` yeni `root` / `variant="blog"` prop'ları).
  - Üst bölüm: solda 300px, VodafoneLight 28/32 başlık; sol sütunun sağ alt köşesinde tarih etiketi (120×40, 45° #820000→#E60000 degrade, beyaz VodafoneRegular 16px); sağda 450px kapak görseli. Mobilde başlık ve tarih görselin altında.
  - **Tarih opsiyonel:** `publishedDate` yoksa etiket hiç oluşmuyor.
- Gövde, canlı şablonun `.textarea-content` kurallarıyla:
  - p: Light 16/20, `mb-4`; h1–h3: Light 28/32 (mobilde 20/24).
  - Madde işareti: 20px kalın kırmızı "•", maddeler VodafoneRegular 16/24.
  - Linkler #1f6feb, altı çizili değil.
  - Tablo: #D9D9D9 çizgili, 9.33/6.67px dolgu, kırmızı başlık satırında beyaz yazı (Light face'in kalınlaştırılmışı), satırlar sırayla #FCE4E4, doğal genişlik, köşesiz. Sadece blog gövdesine uygulanıyor, genel tablo stili değişmedi.
  - Yazılardaki Word'den yapıştırılmış satır içi stiller kopyalanmadı.
- "Daha fazlasını keşfedin": `max-w-[1280px] px-4 py-10 lg:py-16`, özetsiz 3 kart.
  - Seçim: editör `relatedPosts` seçtiyse onlar; seçmediyse aynı kategoriden, yetmezse en yeni yazılardan (kendisi hariç).
  - Gösterilecek yazı yoksa bölüm oluşmuyor.
  - Detay isteği bunun için `depth=2`.
- Pages "Blog Grid" bloğu da `BlogGrid`'e geçti. `CardListGrid` artık kullanılmadığı için testiyle birlikte silindi.
- Doğrulama (1440px, `next dev` 3098 + CMS 3099):
  - Liste: kart 361×378, özet 29px, başlık 56px, link 18/26 canlıyla aynı.
  - Detay: breadcrumb 1300px, `py-3`; tarih etiketi sol sütunun sağ altında; gövde üst bölümden 80px sonra başlıyor; tablo hücreleri, madde işaretleri ve linkler aynı; "Daha fazlasını keşfedin" kartları 361×325, grid konumu aynı.
  - Test verisi: yerel "Ulaşım Kartı Bakiye Yükleme Yolları" (#3) yazısına 23.07.2026 tarihi, 2 başlık, 5 satırlık tablo, 3 maddelik liste ve link girildi (yerel dev veri).
- Testler 413/413, tsc ve eslint temiz.
