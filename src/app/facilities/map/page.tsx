"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Filter, 
  X, 
  MapPin, 
  Building2, 
  Stethoscope,
  Pill,
  Baby,
  Home,
  Microscope,
  Hospital,
  Heart,
  Navigation,
  Layers,
  Search,
  ChevronDown,
  Star,
  Phone,
  ExternalLink,
  Loader2
} from "lucide-react";

interface Facility {
  id: string;
  name: string;
  slug: string;
  type: string;
  tier: string | null;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  nhisAccepted: boolean;
  emergencyCapable: boolean;
  ambulanceAvailable: boolean;
  averageRating: number;
  totalReviews: number;
  region: {
    name: string;
    code: string;
  } | null;
  district: {
    name: string;
  } | null;
}

interface Stats {
  byRegion: Record<string, { count: number; code: string }>;
  byType: Record<string, number>;
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

const FACILITY_ICONS: Record<string, typeof Hospital> = {
  HOSPITAL: Hospital,
  CLINIC: Stethoscope,
  PHARMACY: Pill,
  DIAGNOSTIC_CENTRE: Microscope,
  POLYCLINIC: Building2,
  HEALTH_CENTRE: Heart,
  MATERNITY_HOME: Baby,
  CHPS_COMPOUND: Home,
};

const REGIONS = [
  { code: "GA", name: "Greater Accra" },
  { code: "AS", name: "Ashanti" },
  { code: "WR", name: "Western" },
  { code: "CR", name: "Central" },
  { code: "ER", name: "Eastern" },
  { code: "VR", name: "Volta" },
  { code: "NR", name: "Northern" },
  { code: "UE", name: "Upper East" },
  { code: "UW", name: "Upper West" },
  { code: "BO", name: "Bono" },
  { code: "BE", name: "Bono East" },
  { code: "AH", name: "Ahafo" },
  { code: "WN", name: "Western North" },
  { code: "OT", name: "Oti" },
  { code: "SV", name: "Savannah" },
  { code: "NE", name: "North East" },
];

const FACILITY_TYPES = [
  { value: "HOSPITAL", label: "Hospital" },
  { value: "CLINIC", label: "Clinic" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "DIAGNOSTIC_CENTRE", label: "Diagnostic Centre" },
  { value: "POLYCLINIC", label: "Polyclinic" },
  { value: "HEALTH_CENTRE", label: "Health Centre" },
  { value: "MATERNITY_HOME", label: "Maternity Home" },
  { value: "CHPS_COMPOUND", label: "CHPS Compound" },
];

export default function FacilitiesMapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [nhisOnly, setNhisOnly] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Map style
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite" | "light">("streets");
  const [showStylePicker, setShowStylePicker] = useState(false);

  const MAP_STYLES = {
    streets: "mapbox://styles/mapbox/streets-v12",
    satellite: "mapbox://styles/mapbox/satellite-streets-v12",
    light: "mapbox://styles/mapbox/light-v11",
  };

  // Fetch facilities
  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedType) params.set("type", selectedType);
        if (selectedRegion) params.set("region", selectedRegion);
        if (nhisOnly) params.set("nhis", "true");
        if (emergencyOnly) params.set("emergency", "true");

        const res = await fetch(`/api/facilities/map?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setFacilities(data.data.facilities);
          setStats(data.data.stats);
        }
      } catch (error) {
        console.error("Error fetching facilities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [selectedType, selectedRegion, nhisOnly, emergencyOnly]);

  // Initialize map
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
      style: MAP_STYLES.streets,
      center: [-1.0232, 7.9465], // Ghana center
      zoom: 6.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.current.addControl(new mapboxgl.FullscreenControl(), "bottom-right");
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "bottom-right"
    );

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when facilities change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Filter by search query
    const filteredFacilities = searchQuery
      ? facilities.filter(f => 
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.address.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : facilities;

    filteredFacilities.forEach((facility) => {
      const color = FACILITY_COLORS[facility.type] || "#6b7280";
      const IconComponent = FACILITY_ICONS[facility.type] || MapPin;

      const el = document.createElement("div");
      el.className = "facility-marker cursor-pointer transition-transform hover:scale-110";
      el.innerHTML = `
        <div class="relative group">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white" 
               style="background-color: ${color}">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          ${facility.emergencyCapable ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>' : ""}
        </div>
      `;

      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: "320px"
      }).setHTML(`
        <div class="p-3">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" 
                 style="background-color: ${color}">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 text-sm leading-tight">${facility.name}</h3>
              <p class="text-xs text-gray-500 mt-0.5">${facility.type.replace(/_/g, " ")}</p>
              ${facility.averageRating ? `
                <div class="flex items-center gap-1 mt-1">
                  <span class="text-yellow-500 text-xs">★</span>
                  <span class="text-xs font-medium">${facility.averageRating.toFixed(1)}</span>
                  <span class="text-xs text-gray-400">(${facility.totalReviews})</span>
                </div>
              ` : ""}
            </div>
          </div>
          <p class="text-xs text-gray-600 mt-2 flex items-start gap-1">
            <svg class="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            ${facility.address}
          </p>
          ${facility.phone ? `
            <p class="text-xs text-gray-600 mt-1 flex items-center gap-1">
              <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href="tel:${facility.phone}" class="text-emerald-600 hover:underline">${facility.phone}</a>
            </p>
          ` : ""}
          <div class="flex flex-wrap gap-1 mt-2">
            ${facility.nhisAccepted ? '<span class="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded font-medium">NHIS</span>' : ""}
            ${facility.emergencyCapable ? '<span class="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] rounded font-medium">24/7 Emergency</span>' : ""}
            ${facility.ambulanceAvailable ? '<span class="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-medium">Ambulance</span>' : ""}
          </div>
          <a href="/facilities/${facility.slug}" 
             class="mt-3 w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors">
            View Details
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([facility.longitude, facility.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener("click", () => {
        setSelectedFacility(facility);
      });

      markers.current.push(marker);
    });

    // Fit bounds if we have facilities
    if (filteredFacilities.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredFacilities.forEach((f) => bounds.extend([f.longitude, f.latitude]));
      map.current.fitBounds(bounds, { padding: 80, maxZoom: 12 });
    }
  }, [facilities, mapLoaded, searchQuery]);

  // Change map style
  const changeMapStyle = useCallback((style: "streets" | "satellite" | "light") => {
    if (map.current) {
      map.current.setStyle(MAP_STYLES[style]);
      setMapStyle(style);
      setShowStylePicker(false);
      
      // Re-add markers after style change
      map.current.once("style.load", () => {
        setMapLoaded(true);
      });
    }
  }, []);

  // Clear filters
  const clearFilters = () => {
    setSelectedType("");
    setSelectedRegion("");
    setNhisOnly(false);
    setEmergencyOnly(false);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedType || selectedRegion || nhisOnly || emergencyOnly || searchQuery;

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/facilities">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Ghana Healthcare Map</h1>
            <p className="text-xs text-gray-500">
              {loading ? "Loading..." : `${facilities.length} facilities`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search facilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Filter Button */}
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
                {[selectedType, selectedRegion, nhisOnly, emergencyOnly].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-4 py-4 z-10 flex-shrink-0">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Mobile Search */}
            <div className="w-full md:hidden">
              <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search facilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">Facility Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Types</option>
                {FACILITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-gray-700 mb-1">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Regions</option>
                {REGIONS.map((region) => (
                  <option key={region.code} value={region.code}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nhisOnly}
                  onChange={(e) => setNhisOnly(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">NHIS Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emergencyOnly}
                  onChange={(e) => setEmergencyOnly(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Emergency</span>
              </label>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm text-gray-600">Loading facilities...</p>
            </div>
          </div>
        )}

        {/* Map Style Picker */}
        <div className="absolute top-4 left-4 z-10">
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowStylePicker(!showStylePicker)}
              className="bg-white shadow-lg"
            >
              <Layers className="w-4 h-4 mr-1" />
              {mapStyle.charAt(0).toUpperCase() + mapStyle.slice(1)}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            {showStylePicker && (
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                {(["streets", "satellite", "light"] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => changeMapStyle(style)}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                      mapStyle === style ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                    }`}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 max-w-[220px] z-10 hidden md:block">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Facility Types</h4>
          <div className="space-y-1.5">
            {FACILITY_TYPES.map((type) => {
              const count = stats?.byType[type.value] || 0;
              const IconComponent = FACILITY_ICONS[type.value] || MapPin;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(selectedType === type.value ? "" : type.value)}
                  className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg transition-colors ${
                    selectedType === type.value
                      ? "bg-emerald-50 ring-1 ring-emerald-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: FACILITY_COLORS[type.value] }}
                  >
                    <IconComponent className="w-3 h-3 text-white" />
                  </span>
                  <span className="text-xs text-gray-700 flex-1">{type.label}</span>
                  <span className="text-xs text-gray-400">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Card */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 z-10 hidden lg:block">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Coverage by Region</h4>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {stats && Object.entries(stats.byRegion)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([region, data]) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(selectedRegion === data.code ? "" : data.code)}
                  className={`flex items-center justify-between w-full px-2 py-1 rounded text-xs ${
                    selectedRegion === data.code
                      ? "bg-emerald-50 text-emerald-700"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <span>{region}</span>
                  <span className="font-medium">{data.count}</span>
                </button>
              ))}
          </div>
        </div>

        {/* No Mapbox Token Fallback */}
        {!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center p-6 max-w-md">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-gray-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Map Not Available</h2>
              <p className="text-gray-600 mb-4">
                Configure NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment variables to enable the interactive map.
              </p>
              <Link href="/facilities">
                <Button>View Facilities List</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
