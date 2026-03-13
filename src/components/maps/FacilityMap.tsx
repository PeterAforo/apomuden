"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Facility {
  id: string;
  name: string;
  slug: string;
  type: string;
  latitude: number;
  longitude: number;
  address: string;
  nhisAccepted: boolean;
  emergencyCapable: boolean;
}

interface FacilityMapProps {
  facilities: Facility[];
  center?: [number, number];
  zoom?: number;
  onFacilityClick?: (facility: Facility) => void;
  selectedFacilityId?: string;
  showUserLocation?: boolean;
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

export default function FacilityMap({
  facilities,
  center = [-1.0232, 7.9465], // Ghana center [lng, lat]
  zoom = 6,
  onFacilityClick,
  selectedFacilityId,
  showUserLocation = false,
  className = "",
}: FacilityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.warn("Mapbox token not configured");
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: center,
      zoom: zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Get user location
  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.warn("Could not get user location:", error);
        }
      );
    }
  }, [showUserLocation]);

  // Add user location marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return;

    const el = document.createElement("div");
    el.className = "user-location-marker";
    el.innerHTML = `
      <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
    `;

    new mapboxgl.Marker(el)
      .setLngLat(userLocation)
      .setPopup(new mapboxgl.Popup().setHTML("<p class='font-medium'>Your Location</p>"))
      .addTo(map.current);
  }, [mapLoaded, userLocation]);

  // Add facility markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    facilities.forEach((facility) => {
      const color = FACILITY_COLORS[facility.type] || "#6b7280";
      const isSelected = facility.id === selectedFacilityId;

      const el = document.createElement("div");
      el.className = "facility-marker cursor-pointer";
      el.innerHTML = `
        <div class="relative">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform ${
            isSelected ? "scale-125" : "hover:scale-110"
          }" style="background-color: ${color}">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
          </div>
          ${facility.emergencyCapable ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>' : ""}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2 min-w-[200px]">
          <h3 class="font-semibold text-gray-900">${facility.name}</h3>
          <p class="text-sm text-gray-600">${facility.type.replace("_", " ")}</p>
          <p class="text-xs text-gray-500 mt-1">${facility.address}</p>
          <div class="flex gap-1 mt-2">
            ${facility.nhisAccepted ? '<span class="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">NHIS</span>' : ""}
            ${facility.emergencyCapable ? '<span class="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">Emergency</span>' : ""}
          </div>
          <a href="/facilities/${facility.slug}" class="block mt-2 text-sm text-emerald-600 hover:underline">View Details →</a>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([facility.longitude, facility.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener("click", () => {
        onFacilityClick?.(facility);
      });

      markers.current.push(marker);
    });

    // Fit bounds to show all facilities
    if (facilities.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      facilities.forEach((f) => bounds.extend([f.longitude, f.latitude]));
      if (userLocation) bounds.extend(userLocation);
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    } else if (facilities.length === 1) {
      map.current.flyTo({
        center: [facilities[0].longitude, facilities[0].latitude],
        zoom: 14,
      });
    }
  }, [facilities, mapLoaded, selectedFacilityId, onFacilityClick, userLocation]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full min-h-[400px] rounded-lg" />
      {!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && (
        <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-gray-600 font-medium">Map not available</p>
            <p className="text-sm text-gray-500">Configure MAPBOX_ACCESS_TOKEN to enable maps</p>
          </div>
        </div>
      )}
    </div>
  );
}
