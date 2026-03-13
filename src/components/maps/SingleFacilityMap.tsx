"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface SingleFacilityMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
  className?: string;
}

export default function SingleFacilityMap({
  latitude,
  longitude,
  name,
  address,
  className = "",
}: SingleFacilityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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

    map.current.on("load", () => {
      setMapLoaded(true);

      // Add marker
      const el = document.createElement("div");
      el.innerHTML = `
        <div class="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
        </div>
      `;

      new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${name}</h3>
              <p class="text-sm text-gray-600">${address}</p>
            </div>
          `)
        )
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [latitude, longitude, name, address]);

  const hasToken = !!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full min-h-[200px] rounded-lg" />
      {!hasToken && (
        <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">{latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-emerald-600 hover:underline mt-1 inline-block"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
