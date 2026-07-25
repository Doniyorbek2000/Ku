# Ku — Keshbek Sodiqlik Platformasi 💸

Savdo tashkilotlari uchun to'liq **keshbek (cashback)** ekotizimi. Xaridor do'kondan
mahsulot sotib oladi, biznes egasi belgilagan **foiz** yoki **summa** xaridorning
hisobiga keshbek bo'lib qaytadi. Xaridor keshbekni keyingi xaridlarida ishlatadi —
bu esa mijozlar oqimini kuchaytiradi.

## Qanday ishlaydi?

```
1. Kassir ilovada xarid summasini kiritadi        →  tizim QR yaratadi
2. Xaridor mobil ilova bilan QR ni skanerlaydi    →  keshbek hisoblanadi
3. Keshbek xaridorning shu do'kondagi balansiga tushadi
4. Keyingi xaridida xaridor balansidan foydalanadi (redeem)
```

**Misol:** Xaridor 100 000 so'mlik xarid qiladi. Tashkilot 5% keshbek belgilagan →
xaridorga **5 000 so'm** keshbek qaytadi va balansida ko'rinadi.

## Tizim qismlari

| Qism | Kim uchun | Texnologiya | Holat |
|------|-----------|-------------|-------|
| **Backend API** | Barcha qismlar uchun yagona yadro | Node.js + TypeScript + Express + Prisma | ✅ MVP tayyor |
| **Mobil ilova** | Xaridorlar (QR skanerlash, balans) | React Native (Expo) | ✅ MVP tayyor |
| **Web panel** | Tashkilotlar (kassir, statistika) | React + Vite | ✅ MVP tayyor |
| **Admin panel** | Super admin (tashkilotlar qo'shish) | Web panel ichida | ✅ MVP tayyor |
| **Desktop (.exe)** | Tashkilotlar (offline kassa) | Electron (web panelni o'raydi) | 🔜 Keyingi bosqich |

## Rollar

- **SUPER_ADMIN** — platformani boshqaradi, tashkilotlar qo'shadi/tasdiqlaydi
- **ORG_OWNER** — tashkilot egasi, keshbek qoidalarini belgilaydi, kassirlar qo'shadi
- **CASHIER** — kassir, xarid uchun QR yaratadi
- **CUSTOMER** — xaridor, mobil ilova orqali QR skanerlaydi va balansini ko'radi

## Boshlash (Backend)

```bash
cd backend
cp .env.example .env
npm install
npm run db:push      # ma'lumotlar bazasini yaratadi
npm run db:seed      # demo ma'lumotlar (admin, tashkilot, kassir, xaridor)
npm run dev          # http://localhost:4000
```

## Boshlash (Mobil ilova)

```bash
cd mobile
cp .env.example .env       # EXPO_PUBLIC_API_URL ni backend manziliga sozlang
npm install
npm start                  # Expo Go bilan skanerlang
```

## Boshlash (Web panel — kassir/ega)

```bash
cd web
cp .env.example .env       # VITE_API_URL ni backend manziliga sozlang
npm install
npm run dev                # http://localhost:5173
```

To'liq API hujjati: [`docs/API.md`](docs/API.md)
Arxitektura: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
Mobil ilova: [`mobile/README.md`](mobile/README.md)
Web panel: [`web/README.md`](web/README.md)

## Yo'l xaritasi (Roadmap)

- [x] **1-bosqich** — Backend API (auth, tashkilotlar, keshbek, hamyon, QR oqimi)
- [x] **2-bosqich** — Mobil ilova (Expo): ro'yxatdan o'tish, QR skaner, balans, tarix
- [x] **3-bosqich** — Web panel: kassir QR ekrani, ega statistikasi, kassirlar, keshbek sozlamalari
- [x] **3b-bosqich** — Admin panel (super admin): tashkilotlar qo'shish/tasdiqlash, platforma statistikasi
- [ ] **4-bosqich** — Desktop (.exe) Electron build
- [ ] **5-bosqich** — O'sish mexanizmlari: referral, darajalar, push-bildirishnoma, aksiyalar
