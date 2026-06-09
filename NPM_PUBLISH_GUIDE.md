# @karya/core NPM Package - Yayımlama Rehberi

## Adım 1: Core Klasörüne Gidin
```bash
cd src/core
```

## Adım 2: Gerekli Dosyaları Kontrol Edin
- ✅ `package.json` - Oluşturuldu
- ✅ `tsconfig.json` - Oluşturuldu
- ✅ `.npmignore` - Oluşturuldu
- ✅ `README.md` - Oluşturuldu
- ✅ `index.ts` - Mevcut

## Adım 3: Derleyin
Core klasörü içinden:
```bash
npm run build
```

Bu komut TypeScript dosyalarını JavaScript'e derler ve `dist/` klasörüne çıktı verir.

## Adım 4: Yerel Olarak Test Edin (Opsiyonel)
```bash
npm link
# Başka bir projede kullanmak için:
npm link @karya/core
```

## Adım 5: NPM Hesabında Giriş Yapın
```bash
npm login
```

## Adım 6: NPM'ye Yayımlayın
```bash
npm publish --access public
```

## Version Güncelleme
Yeni versiyon yayımlamadan önce version güncelle:
```bash
npm version patch    # 1.0.0 → 1.0.1
npm version minor    # 1.0.0 → 1.1.0
npm version major    # 1.0.0 → 2.0.0
```

## Tam Yayımlama Akışı
```bash
# 1. Core klasörüne git
cd src/core

# 2. Güncelle package.json version'ı (manual veya npm version ile)
# Veya otomatik olarak:
npm version patch

# 3. Derle
npm run build

# 4. Yayımla
npm publish --access public
```

## Entegrasyon Örneği (Başka Projede)
```bash
npm install @karya/core
```

```typescript
import { BaseFormPage, BaseListPage } from '@karya/core';
// veya
import { AppForm } from '@karya/core/components';
```

## Dikkat Edilecek Noktalar

### Peer Dependencies
- `devextreme` paketleri `package.json` içinde dependencies olarak **değil**, `peerDependencies` olarak tanımlanmıştır
- Bu, tüketici uygulamanın kendi devextreme versiyonunu kullanacağı anlamına gelir
- Çakışmaları önler ve bundle size'ı azaltır

### Ignore Edilen Dosyalar
`.npmignore` tarafından ignored edilen:
- `node_modules/`
- `dist/` daha öncesi (published olmuş halden hariç)
- Test dosyaları (*.spec.ts)
- `.env` dosyaları
- Log dosyaları

## Troubleshooting

### Eğer "403 Forbidden" hatası alırsan:
- NPM hesabının two-factor authentication aktivasyonunu kontrol et
- OTP kodu ile login yap: `npm login --auth-type=web`

### Build hataları:
```bash
# Cache temizle
npm run build -- --clean
# veya
rm -rf dist/
npm run build
```

### NPM registry hatası:
```bash
npm config get registry
# Çıktı olmalı: https://registry.npmjs.org/
```

## Referanslar
- [NPM Publishing Guide](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)
- [TypeScript Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)
