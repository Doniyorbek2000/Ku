# Ku — Tashkilot web paneli

Kassir va tashkilot egasi uchun React + Vite paneli.

## Boshlash

```bash
cd web
cp .env.example .env        # VITE_API_URL ni backend manziliga sozlang
npm install
npm run dev                 # http://localhost:5173
```

Backend ishlab turishi kerak (`cd backend && npm run dev`).

## Rollar

| Rol | Ko'radigan ekran |
|-----|------------------|
| **CASHIER** (kassir) | Bitta sodda kassa ekrani: summa kiritish → **QR chiqarish** → xaridor skanerlashini kutish → to'lov tasdig'i |
| **ORG_OWNER** (ega) | Boshqaruv (statistika), Xaridlar jadvali, Kassirlar (qo'shish/bloklash), Sozlamalar (keshbek qoidalari) |

## Test hisoblari (backend seed'dan)

- Ega: `owner@dokon.uz` / `parol123`
- Kassir: `kassir@dokon.uz` / `parol123`

## Desktop (.exe) ga o'rash

Bu panel keyinchalik Electron bilan `.exe` ga o'raladi (offline kassa uchun) —
`main.tsx` va API mijozi o'zgarmaydi, faqat Electron qobig'i qo'shiladi.

## Texnologiyalar

- React 18 + Vite + TypeScript
- react-router-dom — rol asosidagi navigatsiya
- qrcode.react — QR kod chizish
- Kassir ekrani xarid holatini har 2 soniyada tekshiradi (polling)
