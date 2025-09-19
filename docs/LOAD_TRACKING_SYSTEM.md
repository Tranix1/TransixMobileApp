# Load Tracking System Documentation

## Overview
The Load Tracking System allows truck owners to share their truck's tracker information with load owners, enabling real-time tracking of loads being transported.

## Components

### 1. LoadTracker Component (`components/LoadTracker.tsx`)
A React component that displays tracking information for booked loads. It shows different interfaces based on whether the user is a truck owner or load owner.

**Features:**
- **Truck Owner View**: Shows "Share Tracker" button to share tracker with load owner
- **Load Owner View**: Shows "View Tracker" button to access tracking map
- **Status Display**: Shows whether tracker has been shared and when

### 2. Tracker Utilities (`Utilities/trackerUtils.ts`)
Utility functions for managing tracker information and operations.

**Key Functions:**
- `generateTrackerId()`: Creates unique tracker IDs
- `getTruckTrackerInfo()`: Retrieves tracker information for a truck
- `shareTrackerWithLoadOwner()`: Shares tracker with load owner
- `isTruckOwnerForLoad()`: Checks if user is truck owner
- `isLoadOwnerForLoad()`: Checks if user is load owner
- `formatTrackerSharedDate()`: Formats tracker shared timestamp

## Integration

### ViewBidsAndBooks Component
The tracking functionality is integrated into the `ViewBidsAndBooks` component through the `RequestedCargo` component. The `LoadTracker` component is displayed for loads with status "Booked".

### Database Structure
The system uses the following fields in the `loadRequests` collection:
- `trackerShared`: Boolean indicating if tracker has been shared
- `trackerSharedAt`: Timestamp when tracker was shared
- `trackerSharedBy`: ID of the truck that shared the tracker
- `trackerId`: Unique identifier for the tracker

## User Flow

### For Truck Owners:
1. View their booked loads in "Books and Bids" section
2. See the LoadTracker component with "Share Tracker" button
3. Click "Share Tracker" to share tracker information with load owner
4. Receive confirmation that tracker has been shared

### For Load Owners:
1. View their load requests in "Books and Bids" section
2. See the LoadTracker component showing tracker status
3. If tracker is shared, see "View Tracker" button
4. Click "View Tracker" to open the tracking map with real-time location

## Technical Implementation

### State Management
- Uses React hooks for component state
- Integrates with existing authentication context
- Updates database through utility functions

### Navigation
- Uses Expo Router for navigation to tracking map
- Passes tracker ID as URL parameter to tracking component

### Error Handling
- Comprehensive error handling for database operations
- User-friendly error messages
- Loading states for async operations

## Future Enhancements
- Push notifications when tracker is shared
- Real-time updates without page refresh
- Historical tracking data
- Multiple tracker support per load
- Tracker status indicators (online/offline)

## Dependencies
- React Native
- Expo Router
- Firebase/Firestore
- Custom UI components (ThemedText, etc.)
- Tracking map component
