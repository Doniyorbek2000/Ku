# Ku Backend API

Asosiy manzil (dev): `http://localhost:4000`

Autentifikatsiya: `Authorization: Bearer <token>` sarlavhasi. Token `/api/auth/login`
yoki `/api/auth/register` dan olinadi. Barcha pul qiymatlari **butun son (so'm)**.

## Auth

| Metod | Yo'l | Rol | Tavsif |
|-------|------|-----|--------|
| POST | `/api/auth/register` | — | Xaridor ro'yxatdan o'tadi `{ name, phone, password }` |
| POST | `/api/auth/login` | — | Kirish `{ login, password }` (login = telefon yoki email) |
| GET | `/api/auth/me` | har qanday | Joriy foydalanuvchi |

## Katalog (ochiq)

| Metod | Yo'l | Tavsif |
|-------|------|--------|
| GET | `/api/catalog` | Faol tashkilotlar ro'yxati (mobil ilova uchun) |

## Admin (SUPER_ADMIN)

| Metod | Yo'l | Tavsif |
|-------|------|--------|
| POST | `/api/admin/organizations` | Tashkilot + ega hisobini yaratish |
| GET | `/api/admin/organizations` | Barcha tashkilotlar |
| PATCH | `/api/admin/organizations/:id/active` | Faollashtirish/o'chirish `{ isActive }` |
| GET | `/api/admin/stats` | Platforma statistikasi |

## Tashkilot (ORG_OWNER)

| Metod | Yo'l | Tavsif |
|-------|------|--------|
| GET | `/api/org/me` | O'z tashkiloti |
| PATCH | `/api/org/me` | Keshbek qoidalari va profilni yangilash |
| POST | `/api/org/cashiers` | Kassir qo'shish `{ name, email, password }` |
| GET | `/api/org/cashiers` | Kassirlar ro'yxati |
| PATCH | `/api/org/cashiers/:id/active` | Kassirni bloklash/faollashtirish |
| GET | `/api/org/stats` | Tashkilot statistikasi |
| GET | `/api/org/purchases` | So'nggi xaridlar |

## Xarid / QR (keshbek oqimi)

| Metod | Yo'l | Rol | Tavsif |
|-------|------|-----|--------|
| POST | `/api/purchases` | CASHIER | Xarid yaratish `{ amount, redeemAmount?, branchId? }` → `qrToken` qaytaradi |
| GET | `/api/purchases/:qrToken` | har qanday | Xarid holatini/oldindan ko'rishni tekshirish |
| POST | `/api/purchases/claim` | CUSTOMER | QR ni skanerlash `{ qrToken }` → keshbek beriladi |
| POST | `/api/purchases/:id/cancel` | CASHIER | Kutilayotgan xaridni bekor qilish |

## Hamyon (CUSTOMER)

| Metod | Yo'l | Tavsif |
|-------|------|--------|
| GET | `/api/wallet` | Barcha tashkilotlardagi balanslar + umumiy summa |
| GET | `/api/wallet/transactions?organizationId=&limit=` | Tranzaksiya tarixi |
| GET | `/api/wallet/rewards` | Bonus ballari, daraja, referral kod va bonus tarixi |
| POST | `/api/wallet/push-token` | Expo push tokenini saqlash `{ token }` |

## O'sish mexanizmlari

| Mexanizm | Qanday ishlaydi |
|----------|-----------------|
| **Referral** | Ro'yxatdan o'tishda `referralCode` beriladi. Taklif qilingan mijoz **birinchi xaridini** qilganda taklif qilganga +10 000, o'ziga +5 000 bonus ball. |
| **Darajalar** | Umumiy xaridga qarab: Bronza → Kumush (1M, +10%) → Oltin (5M, +20%) → Platina (20M, +30%). Har xariddan keshbekning shu ulushi qo'shimcha bonus ball bo'ladi. |
| **Aksiyalar** | Tashkilot `POST /api/org/promotions` orqali muddatli oshirilgan keshbek belgilaydi — xarid yaratilganda faol aksiya narxi qo'llanadi. |

### Tashkilot aksiyalari (ORG_OWNER)

| Metod | Yo'l | Tavsif |
|-------|------|--------|
| GET | `/api/org/promotions` | Aksiyalar ro'yxati |
| POST | `/api/org/promotions` | Aksiya yaratish `{ title, cashbackType, cashbackValue, startsAt, endsAt }` |
| PATCH | `/api/org/promotions/:id/active` | Aksiyani yoqish/o'chirish `{ isActive }` |

## To'liq oqim (misol)

```
1. Kassir:   POST /api/purchases { amount: 100000 }
             → { qrToken: "xmuk5bg...", cashbackPreview: 5000 }
2. Kassir QR ni ekranda ko'rsatadi (qrToken dan QR-kod chiziladi)
3. Xaridor:  POST /api/purchases/claim { qrToken: "xmuk5bg..." }
             → { earned: 5000, newBalance: 5000 }
4. Xaridor:  GET /api/wallet → balans 5000 so'm
```

## Xato formati

```json
{ "error": { "code": "CONFLICT", "message": "QR muddati o‘tgan" } }
```
