"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Navigation, Layers, Locate } from "lucide-react";

interface FacilityLocationMapProps {
  latitude: number;
  longitude: number;
  facilityName: string;
  facilityType: string;
  address: string;
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

export default function FacilityLocationMap({
  latitude,
  longitude,
  facilityName,
  facilityType,
  address,
}: FacilityLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets");
  const [mapLoaded, setMapLoaded] = useState(false);

  const markerColor = FACILITY_COLORS[facilityType] || "#059669";

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
      center: [longitude, latitude],
      zoom: 15,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    // Create custom marker element
    const el = document.createElement("div");
    el.className = "facility-marker";
    el.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        background: ${markerColor};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 18px;
        ">🏥</span>
      </div>
    `;

    // Add marker with popup
    marker.current = new mapboxgl.Marker({ element: el, anchor: "bottom" })
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setHTML(`
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: #111;">${facilityName}</h3>
              <p style="font-size: 12px; color: #666; margin: 0;">${address}</p>
            </div>
          `)
      )
      .addTo(map.current);

    // Show popup by default
    marker.current.togglePopup();

    map.current.on("load", () => {
      setMapLoaded(true);
      
      // Add a pulsing dot effect around the marker
      if (map.current) {
        map.current.addSource("pulse", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            properties: {},
          },
        });

        map.current.addLayer({
          id: "pulse-layer",
          type: "circle",
          source: "pulse",
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["get", "radius"],
              0, 20,
              1, 40,
            ],
            "circle-color": markerColor,
            "circle-opacity": 0.3,
            "circle-stroke-width": 2,
            "circle-stroke-color": markerColor,
            "circle-stroke-opacity": 0.5,
          },
        });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, facilityName, address, markerColor]);

  // Handle style change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    const styles = {
      streets: "mapbox://styles/mapbox/streets-v12",
      satellite: "mapbox://styles/mapbox/satellite-streets-v12",
    };
    
    map.current.setStyle(styles[mapStyle]);
  }, [mapStyle, mapLoaded]);

  const handleGetDirections = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
      "_blank"
    );
  };

  const handleCenterMap = () => {
    if (map.current) {
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        duration: 1000,
      });
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-64 md:h-80" />

      {/* Map Controls */}
      <div className="absolute top-3 left-3 flex flex-col gap-2">
        <button
          onClick={() => setMapStyle(mapStyle === "streets" ? "satellite" : "streets")}
          className="w-9 h-9 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Toggle map style"
        >
          <Layers className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={handleCenterMap}
          className="w-9 h-9 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Center on facility"
        >
          <Locate className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      {/* Get Directions Button */}
      <button
        onClick={handleGetDirections}
        className="absolute bottom-3 left-3 right-3 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors font-medium"
      >
        <Navigation className="w-4 h-4" />
        Get Directions
      </button>

      {/* Coordinates Badge */}
      <div className="absolute top-3 right-12 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600">
        {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </div>
    </div>
  );
}
