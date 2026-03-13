"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  ambulanceAvailable?: boolean;
  averageRating?: number;
  totalReviews?: number;
}

interface FacilityMapProps {
  facilities: Facility[];
  center?: [number, number];
  zoom?: number;
  onFacilityClick?: (facility: Facility) => void;
  selectedFacilityId?: string;
  showUserLocation?: boolean;
  showLegend?: boolean;
  showSearch?: boolean;
  showClusters?: boolean;
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

const FACILITY_ICONS: Record<string, string> = {
  HOSPITAL: "🏥",
  CLINIC: "🩺",
  PHARMACY: "💊",
  DIAGNOSTIC_CENTRE: "🔬",
  POLYCLINIC: "🏨",
  HEALTH_CENTRE: "⚕️",
  MATERNITY_HOME: "👶",
  CHPS_COMPOUND: "🏠",
};

export default function FacilityMap({
  facilities,
  center = [-1.0232, 7.9465], // Ghana center [lng, lat]
  zoom = 6,
  onFacilityClick,
  selectedFacilityId,
  showUserLocation = false,
  showLegend = true,
  showSearch = false,
  className = "",
}: FacilityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite" | "light">("streets");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [hoveredFacility, setHoveredFacility] = useState<Facility | null>(null);

  const MAP_STYLES = {
    streets: "mapbox://styles/mapbox/streets-v12",
    satellite: "mapbox://styles/mapbox/satellite-streets-v12",
    light: "mapbox://styles/mapbox/light-v11",
  };

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

  // Change map style
  const changeMapStyle = useCallback((style: "streets" | "satellite" | "light") => {
    if (map.current) {
      map.current.setStyle(MAP_STYLES[style]);
      setMapStyle(style);
    }
  }, []);

  // Filter facilities by type
  const filteredFacilities = filterType 
    ? facilities.filter(f => f.type === filterType)
    : facilities;

  // Get unique facility types for legend
  const facilityTypes = Array.from(new Set(facilities.map(f => f.type)));

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full min-h-[400px] rounded-xl shadow-lg" />
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        {/* Style Switcher */}
        <div className="bg-white rounded-lg shadow-lg p-1 flex gap-1">
          {(["streets", "satellite", "light"] as const).map((style) => (
            <button
              key={style}
              onClick={() => changeMapStyle(style)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mapStyle === style
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      {showLegend && facilityTypes.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 max-w-[200px] z-10">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Facility Types</h4>
          <div className="space-y-2">
            {facilityTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(filterType === type ? null : type)}
                className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded-lg transition-colors ${
                  filterType === type 
                    ? "bg-emerald-50 ring-1 ring-emerald-500" 
                    : filterType && filterType !== type 
                      ? "opacity-50" 
                      : "hover:bg-gray-50"
                }`}
              >
                <span 
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]"
                  style={{ backgroundColor: FACILITY_COLORS[type] || "#6b7280" }}
                >
                  <span className="text-white">{FACILITY_ICONS[type]?.charAt(0) || "•"}</span>
                </span>
                <span className="text-xs text-gray-700">{type.replace("_", " ")}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {facilities.filter(f => f.type === type).length}
                </span>
              </button>
            ))}
          </div>
          {filterType && (
            <button
              onClick={() => setFilterType(null)}
              className="mt-3 w-full text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* Facility Count Badge */}
      <div className="absolute top-4 right-16 bg-white rounded-lg shadow-lg px-3 py-2 z-10">
        <span className="text-sm font-medium text-gray-900">
          {filteredFacilities.length} {filteredFacilities.length === 1 ? "facility" : "facilities"}
        </span>
      </div>

      {/* Hovered Facility Info */}
      {hoveredFacility && (
        <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-lg p-4 max-w-[280px] z-10 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
              style={{ backgroundColor: FACILITY_COLORS[hoveredFacility.type] || "#6b7280" }}
            >
              {FACILITY_ICONS[hoveredFacility.type] || "🏥"}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{hoveredFacility.name}</h4>
              <p className="text-xs text-gray-500">{hoveredFacility.type.replace("_", " ")}</p>
              {hoveredFacility.averageRating && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium">{hoveredFacility.averageRating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({hoveredFacility.totalReviews} reviews)</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {hoveredFacility.nhisAccepted && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">NHIS</span>
            )}
            {hoveredFacility.emergencyCapable && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Emergency</span>
            )}
            {hoveredFacility.ambulanceAvailable && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Ambulance</span>
            )}
          </div>
        </div>
      )}

      {/* User Location Button */}
      {showUserLocation && (
        <button
          onClick={() => {
            if (userLocation && map.current) {
              map.current.flyTo({ center: userLocation, zoom: 14 });
            }
          }}
          className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 hover:bg-gray-50 transition-colors z-10"
          title="Go to my location"
        >
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      {/* No Token Fallback */}
      {!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium mb-1">Map not available</p>
            <p className="text-sm text-gray-500">Configure MAPBOX_ACCESS_TOKEN to enable maps</p>
          </div>
        </div>
      )}
    </div>
  );
}
