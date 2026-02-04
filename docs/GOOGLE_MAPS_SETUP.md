# Google Maps Integration Setup Guide

## Overview
This app uses Google Maps to display nearby stores with markers and interactive bottom sheets. The map integration is fully configured and ready to use - you just need to add your API keys.

## Quick Start

### 1. Get Google Maps API Keys

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS**
   - **Maps JavaScript API** (optional, for web testing)

4. Create API Keys:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **API Key**
   - Create **two separate keys**:
     - One for Android
     - One for iOS

### 2. Restrict API Keys (Recommended for Production)

#### Android Key Restrictions:
- **Application restrictions**: Android apps
- **API restrictions**: Maps SDK for Android
- Add your package name: `com.mazza.app`
- Add your SHA-1 fingerprint (get from: `expo credentials:manager`)

#### iOS Key Restrictions:
- **Application restrictions**: iOS apps
- **API restrictions**: Maps SDK for iOS
- Add your bundle identifier: `com.mazza.app`

### 3. Add API Keys to Your Project

Open the `.env` file in the project root and add your keys:

```env
# Google Maps API Keys
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=AIzaSy...your_android_key_here
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=AIzaSy...your_ios_key_here
```

**⚠️ Important:** Never commit the `.env` file to version control! It's already in `.gitignore`.

### 4. Restart the Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm start
```

### 5. Rebuild for Native Platforms

If you're testing on physical devices or emulators:

```bash
# For Android
npm run android

# For iOS
npm run ios
```

## Features Implemented

✅ **Google Maps Integration**
- Provider: Google Maps (PROVIDER_GOOGLE)
- Shows user location
- Smooth animations
- Compass and scale indicators
- Loading states

✅ **Store Markers**
- Custom 🏪 emoji markers
- Distance badges
- Selected state (scales up, changes color)
- Tap to open bottom sheet
- Android callouts for quick preview

✅ **Interactive Features**
- Tap markers to view store details
- Bottom sheet with store info
- Recenter button to return to user location
- Store count badge at top
- Automatic camera animation to markers

✅ **User Location**
- Requests permission automatically
- Falls back to San Francisco if permission denied
- "My Location" button
- Smooth recenter animation

✅ **Error Handling**
- Permission denied alerts
- Location fetch error handling
- Default fallback location
- Development-only API key warnings

## File Structure

```
mazza-frontend/
├── .env                               # Your API keys (DO NOT COMMIT)
├── .env.example                      # Template for API keys
├── app.json                          # Updated with Maps config
├── src/
│   ├── config/
│   │   └── environment.ts            # Environment config helper
│   ├── screens/
│   │   └── map/
│       └── MapScreen.tsx         # Main map screen (updated)
│   └── components/
│       └── map/
│           └── StoreBottomSheet.tsx  # Store details sheet
└── docs/
    └── GOOGLE_MAPS_SETUP.md          # This file
```

## Configuration Files

### `.env` (Your API Keys)
```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=your_key_here
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=your_key_here
```

### `app.json` (Already Configured)
```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": ""
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": ""
        }
      }
    }
  }
}
```

### `src/config/environment.ts` (Already Created)
```typescript
export const config = {
  googleMaps: {
    apiKey: Platform.select({
      android: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID || '',
      ios: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS || '',
      default: '',
    }),
  },
};
```

## Testing

### Development Mode
In development, you'll see a warning banner if API keys aren't configured:
```
⚠️ Google Maps API key not configured
```

This only shows in `__DEV__` mode and won't appear in production builds.

### Without API Keys
The map will still work but with limited functionality:
- OpenStreetMap fallback on some platforms
- Reduced performance
- Missing Google-specific features

### With API Keys
Full Google Maps functionality:
- Smooth performance
- Rich map data
- Traffic, satellite views
- Places integration (future)

## Troubleshooting

### Map Not Loading
1. **Check API keys are set:**
   ```bash
   cat .env
   ```
2. **Verify .env has correct prefix:**
   - Must use `EXPO_PUBLIC_` prefix for Expo
3. **Restart server:**
   ```bash
   npm start
   ```

### "API key not valid" Error
1. **Check API key restrictions in Google Cloud Console**
2. **Verify the correct APIs are enabled:**
   - Maps SDK for Android
   - Maps SDK for iOS
3. **For Android:** Add SHA-1 fingerprint
4. **For iOS:** Add bundle identifier

### Markers Not Showing
1. **Check if stores are being fetched:**
   - Open React Native debugger
   - Look for store data in console
2. **Verify store data has valid coordinates:**
   ```typescript
   store.location.lat
   store.location.lng
   ```

### Permission Denied
- User must grant location permission
- App shows alert and falls back to default location (San Francisco)

## API Costs

### Google Maps Pricing
- **Maps SDK for Mobile:** $7 per 1,000 loads
- **Free tier:** $200/month credit (~28,500 map loads)

### Optimize Costs
1. **Set usage limits** in Google Cloud Console
2. **Restrict API keys** to your app only
3. **Enable caching** (already implemented)
4. **Monitor usage** regularly

## Security Best Practices

✅ **Implemented:**
- `.env` file in `.gitignore`
- `.env.example` without actual keys
- Platform-specific key selection
- Development-only warnings

⚠️ **Recommended for Production:**
- Use API key restrictions (app bundle/package)
- Set daily usage quotas
- Monitor API usage dashboard
- Rotate keys periodically

## Next Steps

### After Adding API Keys:
1. Test on iOS simulator/device
2. Test on Android emulator/device
3. Verify marker interactions
4. Test bottom sheet functionality
5. Check recenter button
6. Test with multiple stores

### Future Enhancements:
- [ ] Clustering for many markers
- [ ] Custom marker images
- [ ] Route directions to stores
- [ ] Search places
- [ ] Filter by categories
- [ ] Satellite/terrain view toggle

## Support

### Google Maps Documentation:
- [Maps SDK for iOS](https://developers.google.com/maps/documentation/ios-sdk)
- [Maps SDK for Android](https://developers.google.com/maps/documentation/android-sdk)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)

### Get Help:
- Check console for warnings/errors
- Review [React Native Maps docs](https://github.com/react-native-maps/react-native-maps)
- Google Cloud Console support

---

**Note:** The map is fully implemented and ready to use. Just add your API keys and restart the server! 🗺️
