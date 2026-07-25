# Ku — Arxitektura

## Umumiy ko'rinish

Ku — savdo tashkilotlari uchun keshbek sodiqlik platformasi. Barcha qismlar bitta
**backend API** ga ulanadi.

```
        ┌────────────────┐     ┌────────────────┐     ┌────────────────┐
        │  Mobil ilova   │     │   Web panel    │     │  Admin panel   │
        │  (xaridor)     │     │  (kassir/ega)  │     │ (super admin)  │
        │  Expo / RN     │     │  React + Vite  │     │  React + Vite  │
        └───────┬────────┘     └───────┬────────┘     └───────┬────────┘
                │                       │                      │
                └───────────────────────┼──────────────────────┘
                                        │  HTTPS / JSON (JWT)
                              ┌─────────▼──────────┐
                              │   Backend API      │
                              │ Node + Express + TS│
                              │      Prisma        │
                              └─────────┬──────────┘
                                        │
                              ┌─────────▼──────────┐
                              │  PostgreSQL / SQLite│
                              └────────────────────┘
```

`.exe` (desktop) — web panelni Electron ichida o'raydi, o'sha API ga ulanadi.

## Ma'lumotlar modeli

- **User** — yagona auth entitisi (role: SUPER_ADMIN / ORG_OWNER / CASHIER / CUSTOMER).
  Xaridor telefon bilan, ega/kassir email bilan kiradi.
- **Organization** — do'kon/biznes. Keshbek qoidasi shu yerda: `cashbackType`
  (PERCENT/FIXED), `cashbackValue`, `minPurchase`, `maxCashbackPerTxn`, `redeemEnabled`.
- **Branch** — tashkilot filiallari (ixtiyoriy).
- **Wallet** — xaridorning **har bir tashkilotdagi** keshbek balansi (`@@unique([userId, organizationId])`).
- **Purchase** — xarid. `qrToken`, `status` (PENDING→COMPLETED), `amount`, `cashbackAmount`, `redeemAmount`, `expiresAt`.
- **Transaction** — o'zgarmas moliyaviy jurnal (audit): har bir EARN/REDEEM/ADJUST harakati va `balanceAfter`.

## Keshbek oqimi (QR)

1. **Kassir** summa kiritadi → backend `Purchase` (PENDING) yaratadi, `qrToken` qaytaradi.
2. Kassir ekranida `qrToken` dan QR-kod chiziladi.
3. **Xaridor** mobil ilova bilan skanerlaydi → `POST /purchases/claim`.
4. Bitta **DB tranzaksiyasi** ichida:
   - redeem (bo'lsa, balansdan oshmaydigan qismi) ayiriladi,
   - keshbek (`cashbackAmount`) qo'shiladi,
   - `Wallet` yangilanadi, ikkita `Transaction` yoziladi,
   - `Purchase` → COMPLETED.
5. Xaridor yangi balansni ko'radi.

Muhim yechimlar:
- **Pul butun son (so'm)** — float xatolaridan holi.
- **Atomarlik** — claim `prisma.$transaction` ichida; ikki marta claim bo'lmaydi
  (status PENDING tekshiruvi).
- **QR muddati** — `expiresAt` (default 15 daqiqa), o'tsa EXPIRED.
- **Balans himoyasi** — redeem hech qachon mavjud balansdan oshmaydi.

## Xavfsizlik

- Parollar `bcrypt` bilan hashlanadi.
- JWT tokenlar (`role` + `organizationId` ichida) — RBAC middleware (`authorize`).
- Kirish ma'lumotlari `zod` bilan tekshiriladi.
- Kassir faqat o'z tashkiloti xaridlarini ko'radi/boshqaradi.

## Ishlab chiqarishga (production) o'tish

1. `.env` da `DATABASE_URL` ni PostgreSQL ga o'zgartirish.
2. `schema.prisma` da `provider = "postgresql"` va enum'larni native enum'ga qaytarish mumkin.
3. `JWT_SECRET` ni kuchli tasodifiy qiymatga almashtirish.
4. `npm run build && npm start`.
5. HTTPS (reverse proxy), rate-limiting va monitoring qo'shish.

## Keyingi bosqichlar (o'sish mexanizmlari)

- **Referral** — do'st taklif qilsa ikkalasiga bonus.
- **Darajalar (tier)** — ko'p xarid qilgan mijozga yuqori foiz.
- **Push-bildirishnoma** — "balansingizni ishlating" eslatmalari.
- **Aksiya/kupon** — belgilangan davrda oshirilgan keshbek.
- **Amal muddати** — keshbek eskirishi (expiry) bilan qaytishni rag'batlantirish.
