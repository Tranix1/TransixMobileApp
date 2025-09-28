# 🔔 Expo Push Notifications Setup Guide for Production Builds

## ✅ What Has Been Fixed

### 1. **App Configuration (app.json)**
- ✅ Added iOS bundle identifier and background modes
- ✅ Enhanced Android permissions for notifications
- ✅ Proper notification channel setup
- ✅ Optimized for Expo push notifications (no FCM needed)

### 2. **EAS Build Configuration (eas.json)**
- ✅ Disabled FCM (`EXPO_USE_FCM: "0"`) - using Expo's service instead
- ✅ Added iOS release configuration
- ✅ Optimized Android build settings

### 3. **Notification Code (Utilities/pushNotification.ts)**
- ✅ Enhanced error handling and debugging
- ✅ Improved Android notification channel configuration
- ✅ Better iOS permission handling
- ✅ Added comprehensive logging for troubleshooting
- ✅ Uses Expo's push notification service

## 🚨 CRITICAL: Complete These Steps Before Building

### Step 1: Verify EAS Project Configuration

**Your EAS project is already configured correctly:**
- Project ID: `ea0fdbd3-e7bb-48b0-b1f5-b0adde88ef7e`
- This is automatically used by Expo's push notification service

### Step 2: Build Commands

```bash
# Clean and reinstall dependencies
rm -rf node_modules
npm install

# Clean Expo cache
npx expo install --fix

# Build for production
eas build --platform android --profile production
eas build --platform ios --profile production
```

## 🔧 Testing Notifications

### 1. **Test Local Notifications**
The app includes a test function. In your app, you can call:
```javascript
const { schedulePushNotification } = usePushNotifications();
schedulePushNotification(); // This will show a test notification
```

### 2. **Test Push Notifications**
Use Expo's push notification tool:
```bash
npx expo send-push-notification --to "ExponentPushToken[YOUR_TOKEN]" --title "Test" --body "Test message"
```

### 3. **Debug Token Generation**
Check the console logs for:
- ✅ "Expo Push Token generated: [token]"
- ✅ "Android notification channel created"
- ✅ "Notification listener mounted"

## 🐛 Troubleshooting

### Common Issues:

1. **"Project ID not found"**
   - Check that `app.json` has the correct EAS project ID
   - The project ID should be: `ea0fdbd3-e7bb-48b0-b1f5-b0adde88ef7e`

2. **"Permission denied"**
   - Ensure device has notification permissions enabled
   - Check that the app is not running in Expo Go (use development build)

3. **"Token generation failed"**
   - Make sure you're testing on a physical device
   - Check that the EAS project ID is correct in app.json

4. **Notifications not showing**
   - Check notification channel is created
   - Verify app is not in background restrictions
   - Test with local notifications first

## 📱 Platform-Specific Notes

### Android
- Uses Expo's push notification service (no FCM needed)
- Notification channel: `myNotificationChannel`
- Permissions: `POST_NOTIFICATIONS`, `WAKE_LOCK`, `VIBRATE`

### iOS
- Uses Expo's push notification service (no APNs setup needed)
- Background modes: `remote-notification`
- Bundle ID: `com.yayapana.TransixNewVersion`

## ✅ Verification Checklist

Before building, ensure:
- [ ] EAS project ID is correct in app.json (`ea0fdbd3-e7bb-48b0-b1f5-b0adde88ef7e`)
- [ ] All permissions are properly configured
- [ ] Notification channel is created successfully
- [ ] App package name/bundle ID is correct

## 🚀 Production Build Commands

```bash
# For Android
eas build --platform android --profile production

# For iOS  
eas build --platform ios --profile production

# For both platforms
eas build --platform all --profile production
```

Your notifications should now work perfectly in production builds! 🎉
