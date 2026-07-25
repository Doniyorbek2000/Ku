# Ku — Xaridor mobil ilovasi

Expo (React Native) ilovasi: ro'yxatdan o'tish, **QR skanerlash**, keshbek balansi,
hamkor do'konlar va tranzaksiya tarixi.

## Boshlash

```bash
cd mobile
cp .env.example .env       # EXPO_PUBLIC_API_URL ni backend manziliga sozlang
npm install
npm start                  # QR ni Expo Go ilovasi bilan skanerlang
```

> **Muhim:** Telefonda test qilganda `.env` dagi `EXPO_PUBLIC_API_URL` ni
> `localhost` emas, kompyuteringizning lokal IP manziliga qo'ying, masalan
> `http://192.168.1.10:4000`. Backend ishlab turishi kerak (`cd backend && npm run dev`).

## Ekranlar

| Ekran | Tavsif |
|-------|--------|
| 💰 Hamyon | Umumiy va do'konlar bo'yicha keshbek balansi |
| 📷 Skaner | Kassadagi QR ni skanerlab keshbek olish |
| 🏪 Do'konlar | Hamkor do'konlar va ularning keshbek foizi |
| 📜 Tarix | Keshbek olindi/ishlatildi tarixi |

## Texnologiyalar

- Expo SDK 52 + expo-router (fayl asosidagi navigatsiya)
- expo-camera — QR skaner
- expo-secure-store — tokenni xavfsiz saqlash

## Test hisoblari (backend seed'dan)

- Xaridor: `+998901234567` / `parol123`

## Tuzilma

```
app/
  _layout.tsx          # AuthProvider + Stack
  index.tsx            # kirish holatiga qarab yo'naltirish
  (auth)/login,register
  (tabs)/index         # hamyon
  (tabs)/scan          # QR skaner
  (tabs)/stores        # katalog
  (tabs)/history       # tarix
src/
  api/                 # client, types
  context/AuthContext  # kirish holati
  components/ui        # Button, Input, Card
  utils/format         # so'm formatlash
  theme                # ranglar
```
