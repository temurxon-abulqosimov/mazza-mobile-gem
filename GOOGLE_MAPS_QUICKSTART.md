# 🗺️ Google Maps Quick Setup

## 🚀 3 Steps to Enable Maps

### 1️⃣ Get API Keys
Visit: https://console.cloud.google.com/
- Create project
- Enable: Maps SDK for Android & iOS
- Create 2 API keys (one for Android, one for iOS)

### 2️⃣ Add Keys to `.env`
```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=your_android_key_here
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=your_ios_key_here
```

### 3️⃣ Restart Server
```bash
npm start
```

## ✅ That's It!

The map is now fully functional with:
- 🏪 Store markers
- 📍 User location
- 📊 Bottom sheet store details
- 🎯 Recenter button
- 🔄 Smooth animations

## 📖 Full Documentation
See [docs/GOOGLE_MAPS_SETUP.md](docs/GOOGLE_MAPS_SETUP.md) for complete guide.

## ⚠️ Important
- Never commit `.env` file (it's in `.gitignore`)
- Use `.env.example` as template
- Free tier: $200/month (~28,500 map loads)
