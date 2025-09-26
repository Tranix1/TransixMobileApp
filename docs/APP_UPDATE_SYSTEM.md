# App Update System Documentation

## Overview
The Transix app now includes an automatic update checking system that compares the current app version with the latest version stored in Firestore. When a newer version is available, users will see an update modal with options to update or dismiss (if not forced).

## Features
- ✅ Automatic version checking on app launch
- ✅ Play Store integration for updates
- ✅ Force update capability
- ✅ Smooth modal UI matching app design
- ✅ Version comparison logic
- ✅ Admin tools for version management

## How It Works

### 1. Version Storage
The app version information is stored in Firestore under the `appConfig/version` document with the following structure:
```json
{
  "version": "1.0.1",
  "forceUpdate": false,
  "updateMessage": "New features and bug fixes available!",
  "lastUpdated": "2024-01-15T10:30:00Z",
  "minSupportedVersion": "1.0.0"
}
```

### 2. Version Checking
- The app checks for updates when the Home screen loads
- Compares current app version (from `app.json`) with database version
- Shows update modal if current version is lower than database version

### 3. Update Modal
- **Optional Update**: Users can dismiss the modal and continue using the app
- **Force Update**: Users must update to continue (no dismiss option)
- **Play Store Integration**: "Update Now" button opens Play Store

## Setup Instructions

### 1. Database Setup
Create the version document in your Firestore database:

```javascript
// Run this in your Firebase console or admin panel
import { setAppVersion } from './Utilities/versionUtils';

await setAppVersion({
  version: '1.0.1', // Your latest version
  forceUpdate: false, // Set to true for mandatory updates
  updateMessage: 'New features and bug fixes available!',
  lastUpdated: new Date(),
});
```

### 2. Version Management
Use the `VersionManager` component to manage app versions:

```tsx
import VersionManager from '@/components/VersionManager';

// Add this to your admin panel or settings screen
<VersionManager visible={true} />
```

### 3. Manual Version Updates
You can also update versions programmatically:

```javascript
import { setAppVersion } from '@/Utilities/versionUtils';

// Optional update
await setAppVersion({
  version: '1.0.2',
  forceUpdate: false,
  updateMessage: 'New features available!',
});

// Force update
await setAppVersion({
  version: '1.1.0',
  forceUpdate: true,
  updateMessage: 'Critical security update required!',
});
```

## Version Comparison Logic
The system uses semantic versioning comparison:
- `1.0.0` < `1.0.1` ✅ Shows update
- `1.0.1` = `1.0.1` ❌ No update needed
- `1.0.2` > `1.0.1` ❌ No update needed

## Components

### UpdateModal
- **Location**: `components/UpdateModal.tsx`
- **Props**: 
  - `visible`: boolean
  - `onClose`: function
  - `currentVersion`: string
  - `latestVersion`: string
  - `updateUrl`: string
  - `isForceUpdate`: boolean

### useAppUpdate Hook
- **Location**: `hooks/useAppUpdate.ts`
- **Returns**:
  - `showUpdateModal`: boolean
  - `currentVersion`: string
  - `latestVersion`: string
  - `isForceUpdate`: boolean
  - `checkForUpdate`: function
  - `dismissUpdate`: function

### VersionManager Component
- **Location**: `components/VersionManager.tsx`
- **Purpose**: Admin interface for managing app versions
- **Features**: Update version, toggle force update, set update message

## Integration
The update system is integrated into the Home screen (`app/Home/Index.tsx`):
- Automatically checks for updates on component mount
- Shows update modal when needed
- Handles both optional and forced updates

## Testing
1. Set a higher version in the database
2. Launch the app
3. The update modal should appear
4. Test both "Update Now" and "Later" buttons
5. Test force update by setting `forceUpdate: true`

## Play Store URL
The update system uses the Play Store URL:
`https://play.google.com/store/apps/details?id=com.yayapana.TransixNewVersion`

## Troubleshooting
- **Modal not showing**: Check if version in database is higher than app version
- **Play Store not opening**: Ensure device has Play Store installed
- **Database errors**: Check Firestore permissions and network connection
- **Version comparison issues**: Ensure version format is semantic (e.g., "1.0.1")

## Future Enhancements
- [ ] iOS App Store integration
- [ ] Update progress tracking
- [ ] Changelog display
- [ ] Staged rollouts
- [ ] A/B testing for update prompts
