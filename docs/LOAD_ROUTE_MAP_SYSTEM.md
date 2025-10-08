# Load Route Map System

## Overview

The Load Route Map System provides a dedicated, reliable way to view load routes on a map. This system replaces the generic map functionality with a specialized component that handles load-specific route visualization.

## Components

### 1. ViewLoadRoutes.tsx
**Location:** `app/Map/ViewLoadRoutes.tsx`

A dedicated React Native component for displaying load routes with the following features:

- **Route Visualization**: Shows origin and destination markers with route polylines
- **Load Information**: Displays load details including commodity, rate, and company information
- **Route Details**: Shows distance, duration, and traffic information
- **Error Handling**: Comprehensive error handling with retry functionality
- **Responsive UI**: Collapsible details overlay and intuitive controls

### 2. Coordinate Utilities
**Location:** `Utilities/coordinateUtils.ts`

Utility functions for robust coordinate handling:

- `parseCoordinateString()`: Safely parses coordinate strings
- `isValidCoordinate()`: Validates coordinate objects
- `calculateDistance()`: Calculates distance between coordinates
- `createRegionFromCoordinates()`: Creates map regions from coordinates
- `DEFAULT_COORDINATES`: Fallback coordinates (Harare, Zimbabwe)

## Usage

### Basic Usage

```typescript
import { router } from 'expo-router';
import { parseCoordinateString, isValidCoordinate, DEFAULT_COORDINATES } from '@/Utilities/coordinateUtils';

// Navigate to load route view
const viewLoadRoute = (load: Load) => {
  const originCoords = parseCoordinateString(load.origin || '');
  const destinationCoords = parseCoordinateString(load.destination || '');

  if (isValidCoordinate(originCoords) && isValidCoordinate(destinationCoords)) {
    router.push({
      pathname: "/Map/ViewLoadRoutes",
      params: {
        loadData: JSON.stringify(load),
        originCoords: JSON.stringify(originCoords),
        destinationCoords: JSON.stringify(destinationCoords),
        ...(load.routePolyline && { routePolyline: load.routePolyline }),
        ...(load.bounds && { bounds: JSON.stringify(load.bounds) }),
        ...(load.distance && { distance: load.distance }),
        ...(load.duration && { duration: load.duration }),
        ...(load.durationInTraffic && { durationInTraffic: load.durationInTraffic }),
      }
    });
  } else {
    // Fallback for invalid coordinates
    router.push({
      pathname: "/Map/ViewLoadRoutes",
      params: {
        loadData: JSON.stringify(load),
        destinationCoords: JSON.stringify(DEFAULT_COORDINATES),
      }
    });
  }
};
```

### Integration Points

The ViewLoadRoutes component is integrated into:

1. **LoadComponent.tsx**: Individual load cards show "View On Map" button
2. **LoadHomePage.tsx**: Load details bottom sheet includes "View On Map" button

## Features

### Route Display
- **Origin Marker**: Blue gradient marker with dot icon
- **Destination Marker**: Green gradient marker with truck icon
- **Route Polyline**: Dual-layer polyline for better visibility
- **Auto-fitting**: Automatically fits map to show entire route

### Load Information Overlay
- **Collapsible Design**: Tap to show/hide details
- **Load Details**: Commodity, route, rate information
- **Route Metrics**: Distance, duration, traffic duration
- **Company Info**: Company name and contact details

### Error Handling
- **Coordinate Validation**: Validates all coordinate inputs
- **API Error Handling**: Graceful handling of Google Maps API errors
- **Fallback Options**: Default coordinates when data is invalid
- **Retry Functionality**: Users can retry failed operations

### User Experience
- **Loading States**: Clear loading indicators
- **Error Messages**: User-friendly error messages
- **Navigation**: Back button and refresh functionality
- **Responsive**: Adapts to different screen sizes

## API Integration

### Google Maps Directions API
- **Endpoint**: `https://maps.googleapis.com/maps/api/directions/json`
- **API Key**: Configured in the component
- **Parameters**: Origin, destination, API key
- **Response**: Route polyline, distance, duration, traffic info

### Route Data Caching
- **Polyline Caching**: Reuses existing route polylines when available
- **Bounds Caching**: Uses cached map bounds for optimal display
- **Reduced API Calls**: Minimizes API usage by reusing existing data

## Configuration

### Required Parameters
- `loadData`: JSON string of Load object
- `originCoords`: JSON string of origin coordinates
- `destinationCoords`: JSON string of destination coordinates

### Optional Parameters
- `routePolyline`: Encoded polyline string
- `bounds`: Map bounds object
- `distance`: Route distance
- `duration`: Route duration
- `durationInTraffic`: Route duration with traffic

## Error Scenarios

1. **Invalid Coordinates**: Falls back to default coordinates
2. **API Failures**: Shows error message with retry option
3. **Missing Data**: Gracefully handles missing load information
4. **Network Issues**: Provides retry functionality

## Performance Optimizations

- **Coordinate Validation**: Pre-validates coordinates before API calls
- **Polyline Reuse**: Reuses existing polylines when available
- **Efficient Rendering**: Optimized map rendering and marker placement
- **Memory Management**: Proper cleanup of map resources

## Future Enhancements

- **Offline Support**: Cache routes for offline viewing
- **Multiple Routes**: Support for alternative routes
- **Real-time Updates**: Live route updates
- **Custom Markers**: User-defined marker styles
- **Route Sharing**: Share routes with other users
