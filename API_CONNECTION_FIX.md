# 🔧 API Connection Fix

## Problem
You were getting `[AxiosError: Network Error]` when trying to login because:
1. ❌ Bug in `client.ts` - still referenced old config variable
2. ❌ Wrong API URL - `localhost` doesn't work on physical devices
3. ❌ Missing `EXPO_PUBLIC_` prefix - env variables weren't accessible

## ✅ What Was Fixed

### 1. Fixed Bug in API Client
**File:** `src/api/client.ts:75`
- Changed: `Config.API_BASE_URL` → `config.apiUrl`
- This was causing the refresh token logic to fail

### 2. Updated .env File
**File:** `.env`
- Changed: `API_URL` → `EXPO_PUBLIC_API_URL`
- Set to: `http://10.82.237.177:3000/api` (your computer's IP)
- Added options for different environments

### 3. Updated Environment Config
**File:** `src/config/environment.ts`
- Now reads from `process.env.EXPO_PUBLIC_API_URL`
- Properly exposes to client-side code

## 🚀 Next Steps

### 1. Make Sure Your Backend is Running
```bash
# In your backend directory:
cd /Users/temurabulqosimov/mazzapro/mazza-backend
npm run start:dev
# Should see: Server running on http://localhost:3000
```

### 2. Restart Expo Server
```bash
# Stop current server (Ctrl+C)
# Clear cache and restart:
npm start -- --clear
```

### 3. Try Login Again
The network errors should be gone!

## 📱 API URL Guide

### Testing on Physical Device (iPhone/Android):
Use your computer's IP address:
```env
EXPO_PUBLIC_API_URL=http://10.82.237.177:3000/api
```

### Testing on iOS Simulator:
Use localhost:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Testing on Android Emulator:
Use special IP that maps to host:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
```

## 🔍 How to Find Your IP Address

### macOS/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}'
```

### Windows:
```cmd
ipconfig
# Look for "IPv4 Address"
```

## ✅ Verification

Test if your backend is reachable:

### From Terminal:
```bash
curl http://10.82.237.177:3000/api/health
# or
curl http://localhost:3000/api/health
```

Should see a response from your backend.

### From Browser:
Visit: http://10.82.237.177:3000/api/health

## 🛡️ Security Note

The IP address `10.82.237.177` is your **local network IP**, not exposed to the internet. It's safe for development.

## ❓ Troubleshooting

### Still Getting Network Error?

1. **Check backend is running:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Check firewall:** Make sure your firewall allows connections on port 3000

3. **Try different URL:** 
   - Physical device → Use IP address
   - iOS Simulator → Use localhost  
   - Android Emulator → Use 10.0.2.2

4. **Check your .env file:**
   ```bash
   cat .env
   # Verify EXPO_PUBLIC_API_URL is set correctly
   ```

5. **Restart everything:**
   ```bash
   # Kill Expo server
   # Kill backend server
   # Restart both
   npm start -- --clear
   ```

### Different Error?

If you see a different error (like 404, 401, etc), that means the connection is working! The error is now application-level, not network-level.

## 📝 Files Changed

- ✅ `src/api/client.ts` - Fixed config reference
- ✅ `.env` - Added EXPO_PUBLIC_ prefix and IP address
- ✅ `.env.example` - Updated template
- ✅ `src/config/environment.ts` - Uses correct env variable

## 🎉 Summary

Your API connection is now properly configured! The app will connect to your backend at `http://10.82.237.177:3000/api`.

**Next:** Restart the Expo server and try logging in again. It should work! 🚀
