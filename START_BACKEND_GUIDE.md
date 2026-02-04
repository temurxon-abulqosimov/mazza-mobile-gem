# 🚀 How to Start Your Backend Server

## The Problem
You're getting `Network Error` because your NestJS backend server is **not running**.

## ✅ Solution: Start the Backend

### Step 1: Open New Terminal
Open a **separate terminal window** (don't close your Expo terminal!)

### Step 2: Navigate to Backend
```bash
cd /Users/temurabulqosimov/mazzapro/mazza-backend
```

### Step 3: Start Development Server
```bash
npm run start:dev
```

### Step 4: Wait for Success Message
You should see:
```
[Nest] LOG Application is running on: http://localhost:3000
```

### Step 5: Verify Backend is Running
In another terminal:
```bash
curl http://localhost:3000/api/health
```

Should return JSON (not an error).

## 📱 Frontend Configuration

### For iOS Simulator:
Your `.env` is currently set to use IP address. Change it to:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### For Physical iPhone:
Keep current IP address, but make sure:
1. Both devices on same WiFi network
2. Backend server is accessible from network
3. No firewall blocking port 3000

To allow network access, your backend might need to listen on `0.0.0.0`:
```typescript
// In backend main.ts
await app.listen(3000, '0.0.0.0');
```

## 🔄 Restart Frontend

After backend is running:
```bash
# In your Expo terminal:
# Press 'r' to reload
# Or restart: npm start -- --clear
```

## ✅ Test Login

Now try logging in again - it should work! 🎉

## 🐛 Still Getting Errors?

### Check Backend Logs
Look at your backend terminal for errors:
- Database connection issues?
- Port already in use?
- Missing environment variables?

### Check API URL
Verify in your app that it's using the right URL:
```typescript
// Should see this in console:
console.log(config.apiUrl);
// Should be: http://localhost:3000/api (for simulator)
// or: http://10.82.237.177:3000/api (for physical device)
```

### Common Issues:

**Port 3000 already in use?**
```bash
# Kill process on port 3000:
lsof -ti:3000 | xargs kill -9
# Then restart backend
```

**Database not connected?**
- Check your backend `.env` file
- Ensure PostgreSQL is running
- Verify database credentials

**Wrong API endpoint?**
```bash
# Test your actual API endpoints:
curl http://localhost:3000/api/auth/login
# Should return: {"statusCode":400,...} (not Network Error)
```

## 📊 Current Status

- ✅ Frontend: Running on Expo
- ❌ Backend: **NOT RUNNING** (start it!)
- ✅ Google Maps: Configured
- ✅ API Configuration: Updated

## 💡 Pro Tip

Keep **two terminals open**:
1. **Terminal 1**: Backend (`npm run start:dev`)
2. **Terminal 2**: Frontend (`npm start`)

This way you can see logs from both!

---

**Next Step:** Start your backend server and try logging in again! 🚀
