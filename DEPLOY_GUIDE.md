# @karya/core NPM Package - HAZIR VE DEPLOY GÜIDESİ

## ✅ Status: Build Başarılı

Core kütüphanesi tamamen derlenmiş ve npm'ye yayımlanmaya hazırdır.

---

## 📦 Paket Yapısı

### Oluşturulan Dosyalar:
```
src/core/
├── package.json          ✅ NPM paket tanımlaması
├── tsconfig.json         ✅ TypeScript derleyici ayarları
├── .npmignore            ✅ NPM'den hariç tutulacak dosyalar
├── README.md             ✅ Paket dokümantasyonu
├── index.ts              ✅ Ana entry point
└── dist/                 ✅ Derlenmiş JavaScript ve type definitions
    ├── index.js          (CommonJS)
    ├── index.d.ts        (Type definitions)
    ├── index.js.map      (Source map)
    ├── components/
    ├── hooks/
    ├── contexts/
    ├── layouts/
    ├── modals/
    ├── services/
    └── ... (diğer modüller)
```

### Dışa Aktarılan Modüller (exports):
```json
{
  ".": "Main entry point",
  "./pages": "Page components",
  "./components": "UI components",
  "./contexts": "React contexts",
  "./hooks": "Custom hooks",
  "./layouts": "Page layouts",
  "./modals": "Modal components",
  "./services": "API services"
}
```

---

## 🚀 NPM'ye Yayımlama Adımları

### Seçenek 1: Otomatik Versiyon Güncelleme ile

```bash
# 1. Core klasörüne gidin
cd src/core

# 2. Patch version'ı otomatik güncelle (1.0.0 → 1.0.1)
npm version patch

# 3. Build edin
npm run build

# 4. NPM'ye yayımlayın
npm publish --access public
```

### Seçenek 2: Manual Versiyon Güncelleme ile

```bash
# 1. Core klasörüne gidin
cd src/core

# 2. package.json'da version'ı elle güncelle
# "version": "1.0.0" → "1.1.0" vb.

# 3. Build edin
npm run build

# 4. NPM'ye yayımlayın
npm publish --access public
```

### Version Türleri:
```bash
npm version patch    # 1.0.0 → 1.0.1 (bug fix)
npm version minor    # 1.0.0 → 1.1.0 (new feature)
npm version major    # 1.0.0 → 2.0.0 (breaking change)
```

---

## 🔐 NPM Hesabı Ayarları

### İlk Kurulum:
```bash
npm login
# Email, username, password gir
```

### İki Faktörlü Kimlik Doğrulama (2FA) Etkinse:
```bash
npm login --auth-type=web
# Browser'da kimlik doğrulama yap
```

### Oturum Kontrolü:
```bash
npm whoami
```

---

## 📥 Tüketici Tarafında Kullanım

### Kurulum:
```bash
npm install @karya/core
```

### Kullanım Örnekleri:

#### Ana kütüphaneden import:
```typescript
import { BaseFormPage, BaseListPage, BaseCustomPage } from '@karya/core';
import { useAppFormContext, useAppListContext } from '@karya/core';
```

#### Belirli modüllerden import:
```typescript
// Components
import { AppForm, AppDatagrid, AppFormDetail } from '@karya/core/components';

// Hooks
import { useAppFormDatasource, useAppDatagridDatasouce } from '@karya/core/hooks';

// Contexts
import { useAppFormContext } from '@karya/core/contexts';

// Layouts
import { PageLayout, PageFormLayout } from '@karya/core/layouts';

// Services
import { ApiRequest } from '@karya/core/services';
```

---

## 🔧 Teknik Detaylar

### Package.json Configuration:
- **name**: `@karya/core` (scoped package)
- **main**: CommonJS entry point (dist/index.js)
- **module**: ESM entry point (dist/index.esm.js)
- **types**: TypeScript definitions (dist/index.d.ts)
- **peerDependencies**: React, React DOM, DevExtreme (tüketici belirtir)

### Build Çıktısı:
- `.js` dosyaları: JavaScript derlemesi
- `.d.ts` dosyaları: TypeScript type definitions
- `.js.map` dosyaları: Source maps (debugging için)
- `.d.ts.map` dosyaları: Type definition maps

### Ignored Files (.npmignore):
```
node_modules/
dist/ (öncesi)
*.spec.ts/tsx
.env dosyaları
Log dosyaları
```

---

## 🧪 Publish Öncesi Test Etme

### Yerel Linkage (dev environment):
```bash
cd src/core
npm link

# Başka bir projede:
npm link @karya/core
```

### Simulate npm publish:
```bash
cd src/core
npm pack
# @karya-core-1.0.0.tgz dosyası oluşturulur
# Bu .tgz dosyasını analiz edebilirsin
```

---

## 📋 Yayımlama Checklist

- [ ] TypeScript derlemesi hatasız çalışıyor (`npm run build`)
- [ ] `dist/` klasörü .js, .d.ts ve .map dosyaları içeriyor
- [ ] `package.json` version güncel
- [ ] `README.md` dokümantasyonu hazır
- [ ] npm hesabında login yapılı (`npm whoami`)
- [ ] Node version uyumlu (`node --version`)

---

## ⚠️ Yaygın Sorunlar ve Çözümleri

### "403 Forbidden" hatası:
```bash
# Çözüm: 2FA ile login yap
npm login --auth-type=web
```

### "ENEEDAUTH" hatası:
```bash
# Çözüm: Login yapılı mı kontrol et
npm whoami
# Değilse:
npm login
```

### Build hataları:
```bash
# Cache temizle
rm -rf dist node_modules
npm install
npm run build
```

### Version zaten var hatası:
```bash
# Versiyon güncelle
npm version patch
npm publish
```

---

## 📖 Faydalı Bağlantılar

- [NPM Publishing Guide](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)
- [TypeScript Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)
- [npm package.json docs](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)

---

## 💡 İpuçları

1. **Semantic Versioning**: Major.Minor.Patch (x.y.z)
   - Major: Kırıcı değişiklikler
   - Minor: Geriye uyumlu yeni özellikler
   - Patch: Geriye uyumlu hata düzeltmeleri

2. **Git etiketleme**: Yayımladıktan sonra
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

3. **Changelog**: Her yayımda güncelleyin
   ```bash
   # CHANGELOG.md dosyası oluştur
   ```

---

**Yayımlama Zamanı: Hazır! ✅**
