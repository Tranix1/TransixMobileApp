// components/CrossPlatformMapView.tsx

import React, { forwardRef } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useColorScheme } from "@/hooks/useColorScheme";
import { darkMapStyle } from "@/Utilities/MapDarkMode";

const CrossPlatformMapView = forwardRef((props: any, ref: any) => {
  const theme = useColorScheme();

  return (
    <MapView
      ref={ref}
      {...props}
      provider="google"
      customMapStyle={theme === "dark" ? darkMapStyle : undefined}
    >
      {props.markers?.map((marker: any, i: number) => (
        <Marker
          key={i}
          coordinate={marker.coordinate}
          title={marker.title}
          description={marker.description}
        >
          {marker.children}
        </Marker>
      ))}

      {props.polylines?.map((line: any, i: number) => (
        <Polyline
          key={i}
          coordinates={line.coordinates}
          strokeColor={line.strokeColor}
          strokeWidth={line.strokeWidth}
        />
      ))}

      {props.children}
    </MapView>
  );
});

export default CrossPlatformMapView;