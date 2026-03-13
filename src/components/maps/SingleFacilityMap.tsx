"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface NearbyFacility {
  id: string;
  name: string;
  slug: string;
  type: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface SingleFacilityMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
  facilityType?: string;
  nearbyFacilities?: NearbyFacility[];
  showDirections?: boolean;
  className?: string;
}

const FACILITY_COLORS: Record<string, string> = {
  HOSPITAL: "#059669",
  CLINIC: "#0891b2",
  PHARMACY: "#7c3aed",
  DIAGNOSTIC_CENTRE: "#ea580c",
  POLYCLINIC: "#2563eb",
  HEALTH_CENTRE: "#16a34a",
  MATERNITY_HOME: "#db2777",
  CHPS_COMPOUND: "#65a30d",
};

export default function SingleFacilityMap({
  latitude,
  longitude,
  name,
  address,
  facilityType = "HOSPITAL",
  nearbyFacilities = [],
  showDirections = true,
  className = "",
}: SingleFacilityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showNearby, setShowNearby] = useState(false);
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets");
  const nearbyMarkers = useRef<mapboxgl.Marker[]>([]);

  // Get user location
  useEffect(() => {
    if (showDirections && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => console.warn("Could not get user location:", error)
      );
    }
  }, [showDirections]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [longitude, latitude],
      zoom: 15,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

    map.current.on("load", () => {
      setMapLoaded(true);

      // Add main facility marker with animation
      const color = FACILITY_COLORS[facilityType] || "#059669";
      const el = document.createElement("div");
      el.innerHTML = `
        <div class="relative">
          <div class="w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-3 border-white animate-bounce" style="background-color: ${color}">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45" style="background-color: ${color}"></div>
        </div>
      `;

      new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 35 }).setHTML(`
            <div class="p-3 min-w-[220px]">
              <h3 class="font-bold text-gray-900 text-lg">${name}</h3>
              <p class="text-sm text-gray-600 mt-1">${address}</p>
              <div class="flex gap-2 mt-3">
                <a href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}" 
                   target="_blank" 
                   class="flex-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg text-center hover:bg-emerald-700">
                  Get Directions
                </a>
              </div>
            </div>
          `)
        )
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [latitude, longitude, name, address, facilityType]);

  // Add nearby facility markers
  useEffect(() => {
    if (!map.current || !mapLoaded || !showNearby) return;

    // Clear existing nearby markers
    nearbyMarkers.current.forEach(m => m.remove());
    nearbyMarkers.current = [];

    nearbyFacilities.forEach((facility) => {
      const color = FACILITY_COLORS[facility.type] || "#6b7280";
      const el = document.createElement("div");
      el.innerHTML = `
        <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white opacity-80 hover:opacity-100 transition-opacity cursor-pointer" style="background-color: ${color}">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([facility.longitude, facility.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h4 class="font-semibold text-gray-900">${facility.name}</h4>
              <p class="text-xs text-gray-500">${facility.type.replace("_", " ")}</p>
              ${facility.distance ? `<p class="text-xs text-emerald-600 mt-1">${facility.distance.toFixed(1)} km away</p>` : ""}
              <a href="/facilities/${facility.slug}" class="text-xs text-emerald-600 hover:underline mt-2 block">View Details →</a>
            </div>
          `)
        )
        .addTo(map.current!);

      nearbyMarkers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (nearbyFacilities.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([longitude, latitude]);
      nearbyFacilities.forEach(f => bounds.extend([f.longitude, f.latitude]));
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 14 });
    }
  }, [mapLoaded, showNearby, nearbyFacilities, longitude, latitude]);

  // Add user location marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return;

    const el = document.createElement("div");
    el.innerHTML = `
      <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg">
        <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
      </div>
    `;

    new mapboxgl.Marker(el)
      .setLngLat(userLocation)
      .setPopup(new mapboxgl.Popup().setHTML("<p class='font-medium p-1'>Your Location</p>"))
      .addTo(map.current);
  }, [mapLoaded, userLocation]);

  const hasToken = !!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const toggleMapStyle = useCallback(() => {
    if (map.current) {
      const newStyle = mapStyle === "streets" ? "satellite" : "streets";
      map.current.setStyle(
        newStyle === "streets" 
          ? "mapbox://styles/mapbox/streets-v12"
          : "mapbox://styles/mapbox/satellite-streets-v12"
      );
      setMapStyle(newStyle);
    }
  }, [mapStyle]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full min-h-[300px] rounded-xl shadow-lg" />
      
      {/* Map Controls */}
      {hasToken && (
        <>
          {/* Style Toggle */}
          <button
            onClick={toggleMapStyle}
            className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors z-10"
          >
            {mapStyle === "streets" ? "🛰️ Satellite" : "🗺️ Streets"}
          </button>

          {/* Nearby Facilities Toggle */}
          {nearbyFacilities.length > 0 && (
            <button
              onClick={() => setShowNearby(!showNearby)}
              className={`absolute top-4 left-28 rounded-lg shadow-lg px-3 py-2 text-xs font-medium transition-colors z-10 ${
                showNearby 
                  ? "bg-emerald-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {showNearby ? "Hide" : "Show"} Nearby ({nearbyFacilities.length})
            </button>
          )}

          {/* Directions Button */}
          {showDirections && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 left-4 bg-emerald-600 text-white rounded-lg shadow-lg px-4 py-2 text-sm font-medium hover:bg-emerald-700 transition-colors z-10 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Get Directions
            </a>
          )}

          {/* Center on Facility */}
          <button
            onClick={() => map.current?.flyTo({ center: [longitude, latitude], zoom: 15 })}
            className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50 transition-colors z-10"
            title="Center on facility"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </>
      )}

      {/* No Token Fallback */}
      {!hasToken && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">{name}</h4>
            <p className="text-sm text-gray-600 mb-2">{address}</p>
            <p className="text-xs text-gray-500 mb-3">{latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Get Directions
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
