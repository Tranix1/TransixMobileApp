# Location-Based Tracking System

## Overview

This document describes the implementation of a location-based tracking system that encourages load owners to provide accurate location coordinates and automatically manages tracker visibility based on the truck's position relative to the specified route.

## Key Features

### 1. Precise Location Storage
- Load data now includes `originCoordinates` and `destinationCoordinates` with latitude/longitude
- Location accuracy is validated and rated (high/medium/low/none)
- Route information including polyline and bounds are stored for better tracking

### 2. Location-Based Tracker Visibility
- Tracker is only visible when truck is within the specified route bounds
- Tracker is hidden if load owner didn't provide precise coordinates
- Real-time validation of truck position against route

### 3. Destination Arrival Detection
- Automatic detection when truck reaches destination (200m radius)
- Tracker is automatically removed when destination is reached
- Arrival notifications and status updates

### 4. Location Accuracy Encouragement
- Clear messaging about location accuracy requirements
- Visual indicators showing location quality
- Suggestions for improving location accuracy

## Implementation Details

### Files Modified/Created

#### New Files:
- `Utilities/locationTrackerUtils.ts` - Core location tracking utilities
- `Utilities/destinationArrivalService.ts` - Destination arrival detection
- `hooks/useDestinationArrival.ts` - React hook for arrival detection
- `docs/LOCATION_BASED_TRACKING.md` - This documentation

#### Modified Files:
- `Utilities/loadUtils.ts` - Added coordinate storage to load data
- `components/LoadTracker.tsx` - Enhanced with location-based logic
- `app/BooksAndBids/ViewBidsAndBooks.tsx` - Added location tracking
- `components/CargoYouRequest.tsx` - Updated to pass location data

### Data Structure Changes

#### Load Data (Cargo collection):
```typescript
{
  // ... existing fields
  originCoordinates: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  destinationCoordinates: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  // ... existing fields
}
```

#### Load Request Data (loadRequests collection):
```typescript
{
  // ... existing fields
  destinationReached: boolean;
  destinationReachedAt: string;
  destinationReachedCoordinates: {
    latitude: number;
    longitude: number;
  };
  trackerRemovedAt: string;
  trackerRemovedReason: string;
  // ... existing fields
}
```

## Usage

### For Load Owners

1. **Creating Loads**: When creating a load, ensure you select precise locations using the map picker or Google Places autocomplete
2. **Location Accuracy**: The system will show you the accuracy level of your locations
3. **Tracker Access**: You'll only see the tracker when the truck is on the specified route

### For Truck Owners

1. **Sharing Tracker**: You can only share the tracker if the load has precise coordinates
2. **Route Validation**: The system checks if you're on the correct route before allowing tracking
3. **Automatic Removal**: The tracker is automatically removed when you reach the destination

## Location Accuracy Levels

### High Accuracy ✅
- Precise coordinates with route polyline and bounds
- Best tracking experience

### Medium Accuracy ⚠️
- Precise coordinates with distance/duration info
- Good tracking experience

### Low Accuracy ⚠️
- Basic coordinates only
- Limited tracking functionality

### No Accuracy ❌
- No precise coordinates
- Tracker unavailable until accurate locations provided

## API Functions

### Location Tracking
```typescript
// Check if tracker should be visible
const status = await shouldShowTracker(loadRequestId, truckId, currentLat, currentLon);

// Validate load location data
const validation = validateLoadLocationData(loadData);

// Check if truck is within route bounds
const withinRoute = isWithinRouteBounds(truckLat, truckLon, origin, destination);
```

### Destination Arrival
```typescript
// Check if destination reached
const arrival = await checkDestinationArrival(loadRequestId, truckLat, truckLon);

// Get arrival status
const status = await getArrivalStatus(loadRequestId);

// Calculate distance to destination
const distance = await getDistanceToDestination(loadRequestId, currentLat, currentLon);
```

## Configuration

### Arrival Detection
- **Arrival Radius**: 200 meters (configurable in `locationTrackerUtils.ts`)
- **Check Interval**: 30 seconds (configurable in `useDestinationArrival.ts`)
- **Route Tolerance**: 2km from direct route (configurable in `locationTrackerUtils.ts`)

### Location Validation
- **Departure Radius**: 300 meters from origin
- **Route Bounds**: Based on origin-destination bounding box
- **Accuracy Thresholds**: Defined in `getLocationAccuracyMessage()`

## Benefits

1. **Encourages Accurate Locations**: Load owners are motivated to provide precise coordinates
2. **Security**: Tracker only works when truck is on the correct route
3. **Automatic Management**: No manual intervention needed for tracker removal
4. **Real-time Updates**: Continuous monitoring of truck position
5. **User Experience**: Clear feedback about tracking status and location accuracy

## Future Enhancements

1. **Geofencing**: More sophisticated route validation using actual road networks
2. **ETA Updates**: Real-time estimated arrival times
3. **Route Optimization**: Suggest better routes based on traffic
4. **Historical Tracking**: Store and display tracking history
5. **Push Notifications**: Real-time notifications for arrival events

## Troubleshooting

### Common Issues

1. **Tracker Not Visible**: Check if load has precise coordinates and truck is on route
2. **Location Accuracy Low**: Encourage load owner to use map picker for precise selection
3. **Arrival Not Detected**: Verify GPS accuracy and arrival radius settings
4. **Route Validation Fails**: Check if origin/destination coordinates are accurate

### Debug Information

The system provides detailed console logging for debugging:
- Location accuracy validation
- Route bounds checking
- Arrival detection status
- Tracker visibility decisions

