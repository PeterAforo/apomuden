"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Ambulance, Phone, MapPin, Clock, Navigation2, Star, Users,
  CheckCircle, XCircle, AlertTriangle, Search, Filter, X,
  ChevronRight, Loader2, RefreshCw, MessageSquare, Mail,
  Shield, Zap, Heart, ArrowLeft, Info, Route, Timer
} from "lucide-react";

// Initialize Mapbox
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
mapboxgl.accessToken = MAPBOX_TOKEN;

interface AmbulanceService {
  id: string;
  name: string;
  company: string;
  vehicleType: "BLS" | "ALS" | "MICU"; // Basic Life Support, Advanced Life Support, Mobile ICU
  status: "available" | "busy" | "offline";
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  contact: {
    phone: string;
    whatsapp?: string;
    email?: string;
  };
  driver: {
    name: string;
    experience: number; // years
    rating: number;
  };
  equipment: string[];
  estimatedArrival?: number; // minutes
  distance?: number; // km
  pricePerKm: number;
  rating: number;
  totalTrips: number;
  lastUpdated: string;
}

const VEHICLE_TYPES = {
  BLS: { label: "Basic Life Support", color: "bg-blue-500", icon: Ambulance },
  ALS: { label: "Advanced Life Support", color: "bg-amber-500", icon: Shield },
  MICU: { label: "Mobile ICU", color: "bg-red-500", icon: Heart },
};

const STATUS_CONFIG = {
  available: { label: "Available", color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-100" },
  busy: { label: "On Call", color: "bg-amber-500", textColor: "text-amber-700", bgLight: "bg-amber-100" },
  offline: { label: "Offline", color: "bg-gray-400", textColor: "text-gray-600", bgLight: "bg-gray-100" },
};

// Status colors for map markers
const STATUS_COLORS = {
  available: "#22c55e",
  busy: "#f59e0b", 
  offline: "#9ca3af",
};

export default function AmbulancePage() {
  const [ambulances, setAmbulances] = useState<AmbulanceService[]>([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState<AmbulanceService | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "busy">("all");
  const [filterType, setFilterType] = useState<"all" | "BLS" | "ALS" | "MICU">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [requestingAmbulance, setRequestingAmbulance] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    setLastUpdate(new Date());
  }, []);

  // Map refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Fetch ambulances from API
  const fetchAmbulances = useCallback(async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        maxDistance: "50",
      });
      
      const response = await fetch(`/api/ambulances?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAmbulances(data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Error fetching ambulances:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
          fetchAmbulances(loc.lat, loc.lng);
        },
        () => {
          // Default to Accra center if location denied
          const defaultLoc = { lat: 5.6037, lng: -0.1870 };
          setUserLocation(defaultLoc);
          fetchAmbulances(defaultLoc.lat, defaultLoc.lng);
        }
      );
    } else {
      const defaultLoc = { lat: 5.6037, lng: -0.1870 };
      setUserLocation(defaultLoc);
      fetchAmbulances(defaultLoc.lat, defaultLoc.lng);
    }
  }, [fetchAmbulances]);

  // Initialize map
  useEffect(() => {
    if (!mounted || !mapContainer.current || map.current || !userLocation || !MAPBOX_TOKEN) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [userLocation.lng, userLocation.lat],
        zoom: 13,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        "top-right"
      );

      map.current.on("load", () => {
        setMapLoaded(true);
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
      });
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mounted, userLocation]);

  // Add user location marker
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const el = document.createElement("div");
    el.className = "user-marker";
    el.innerHTML = `
      <div class="relative">
        <div class="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div class="absolute -inset-2 bg-blue-400/30 rounded-full animate-ping"></div>
      </div>
    `;

    userMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML("<strong>Your Location</strong>"))
      .addTo(map.current);
  }, [mapLoaded, userLocation]);

  // Update ambulance markers on map
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add new markers for each ambulance
    ambulances.forEach((amb) => {
      const el = document.createElement("div");
      el.className = "ambulance-marker cursor-pointer";
      const statusColor = STATUS_COLORS[amb.status];
      const isSelected = selectedAmbulance?.id === amb.id;
      
      el.innerHTML = `
        <div class="relative transform transition-transform ${isSelected ? "scale-125" : "hover:scale-110"}">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white" 
               style="background-color: ${statusColor}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 10H6"/>
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/>
              <path d="M8 8v4"/>
              <circle cx="17" cy="18" r="2"/>
              <circle cx="7" cy="18" r="2"/>
            </svg>
          </div>
          ${amb.status === "available" ? `<div class="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>` : ""}
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span class="text-xs font-medium bg-white/95 px-2 py-0.5 rounded shadow-sm">
              ${amb.estimatedArrival ? `${amb.estimatedArrival}m` : "N/A"}
            </span>
          </div>
        </div>
      `;

      el.addEventListener("click", () => {
        setSelectedAmbulance(amb);
        map.current?.flyTo({
          center: [amb.location.lng, amb.location.lat],
          zoom: 15,
          duration: 1000,
        });
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([amb.location.lng, amb.location.lat])
        .addTo(map.current!);

      markersRef.current[amb.id] = marker;
    });
  }, [ambulances, mapLoaded, selectedAmbulance]);

  // Auto-refresh ambulance data every 30 seconds
  useEffect(() => {
    if (!userLocation) return;

    const interval = setInterval(() => {
      fetchAmbulances(userLocation.lat, userLocation.lng);
    }, 30000);

    return () => clearInterval(interval);
  }, [userLocation, fetchAmbulances]);

  // Filter ambulances
  const filteredAmbulances = ambulances.filter((amb) => {
    const matchesSearch = amb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      amb.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || amb.status === filterStatus;
    const matchesType = filterType === "all" || amb.vehicleType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort by availability and distance
  const sortedAmbulances = [...filteredAmbulances].sort((a, b) => {
    if (a.status === "available" && b.status !== "available") return -1;
    if (a.status !== "available" && b.status === "available") return 1;
    return (a.distance || 999) - (b.distance || 999);
  });

  const refreshAmbulances = useCallback(() => {
    if (userLocation) {
      fetchAmbulances(userLocation.lat, userLocation.lng);
    }
  }, [userLocation, fetchAmbulances]);

  const requestAmbulance = async (ambulance: AmbulanceService) => {
    setRequestingAmbulance(true);
    try {
      const response = await fetch("/api/ambulances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ambulanceId: ambulance.id,
          userLocation,
          phone: "+233000000000", // In production, get from user profile
          emergencyType: "medical",
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setRequestSuccess(true);
        // Refresh ambulance list to update statuses
        refreshAmbulances();
      }
    } catch (error) {
      console.error("Error requesting ambulance:", error);
    } finally {
      setRequestingAmbulance(false);
    }
  };

  const getDirectionsUrl = (ambulance: AmbulanceService) => {
    if (!userLocation) return "#";
    return `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${ambulance.location.lat},${ambulance.location.lng}`;
  };

  const availableCount = ambulances.filter((a) => a.status === "available").length;
  const busyCount = ambulances.filter((a) => a.status === "busy").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Ambulance className="w-6 h-6" />
                  Find Ambulance
                </h1>
                <p className="text-red-100 text-sm">Real-time ambulance availability near you</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshAmbulances}
                disabled={loading}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>
              <a
                href="tel:193"
                className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Call 193</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700">{availableCount} Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <span className="text-sm font-medium text-gray-700">{busyCount} On Call</span>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showFilters ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search ambulance or company..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Status:</span>
                  {(["all", "available", "busy"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filterStatus === status
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {status === "all" ? "All" : status === "available" ? "Available" : "On Call"}
                    </button>
                  ))}
                </div>

                {/* Type Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Type:</span>
                  {(["all", "BLS", "ALS", "MICU"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        filterType === type
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {type === "all" ? "All" : type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="relative h-[500px]">
                {/* Real Mapbox Map */}
                <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ minHeight: '500px' }} />
                
                {/* Loading overlay or missing token message */}
                {!MAPBOX_TOKEN ? (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                    <div className="text-center p-6">
                      <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">Map Configuration Required</p>
                      <p className="text-xs text-gray-500">
                        The map service is not configured. Please contact support.
                      </p>
                    </div>
                  </div>
                ) : (!mapLoaded || loading) && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {!mapLoaded ? "Loading map..." : "Fetching ambulances..."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Map Legend</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full" />
                      <span className="text-xs text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-amber-500 rounded-full" />
                      <span className="text-xs text-gray-600">On Call</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-400 rounded-full" />
                      <span className="text-xs text-gray-600">Offline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 rounded-full" />
                      <span className="text-xs text-gray-600">Your Location</span>
                    </div>
                  </div>
                </div>

                {/* Last updated indicator */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg z-10">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Live tracking • Updated {lastUpdate ? lastUpdate.toLocaleTimeString() : "--:--:--"}</span>
                  </div>
                </div>

                {/* Center on user button */}
                {userLocation && map.current && (
                  <button
                    onClick={() => {
                      map.current?.flyTo({
                        center: [userLocation.lng, userLocation.lat],
                        zoom: 13,
                        duration: 1000,
                      });
                    }}
                    className="absolute bottom-4 right-4 bg-white rounded-lg p-2 shadow-lg z-10 hover:bg-gray-50 transition-colors"
                    title="Center on my location"
                  >
                    <Navigation2 className="w-5 h-5 text-blue-600" />
                  </button>
                )}
              </div>
            </Card>
          </div>

          {/* Ambulance List / Details Panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedAmbulance ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{selectedAmbulance.name}</CardTitle>
                          <p className="text-sm text-gray-500">{selectedAmbulance.company}</p>
                        </div>
                        <button
                          onClick={() => setSelectedAmbulance(null)}
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <X className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Status & Type */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            STATUS_CONFIG[selectedAmbulance.status].bgLight
                          } ${STATUS_CONFIG[selectedAmbulance.status].textColor}`}
                        >
                          {STATUS_CONFIG[selectedAmbulance.status].label}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                            VEHICLE_TYPES[selectedAmbulance.vehicleType].color
                          }`}
                        >
                          {VEHICLE_TYPES[selectedAmbulance.vehicleType].label}
                        </span>
                      </div>

                      {/* ETA & Distance */}
                      {selectedAmbulance.status === "available" && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-green-50 rounded-lg text-center">
                            <Timer className="w-5 h-5 text-green-600 mx-auto mb-1" />
                            <p className="text-2xl font-bold text-green-700">
                              {selectedAmbulance.estimatedArrival}
                            </p>
                            <p className="text-xs text-green-600">min ETA</p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg text-center">
                            <Route className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                            <p className="text-2xl font-bold text-blue-700">
                              {selectedAmbulance.distance}
                            </p>
                            <p className="text-xs text-blue-600">km away</p>
                          </div>
                        </div>
                      )}

                      {/* Location */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Current Location</p>
                            <p className="text-sm text-gray-500">{selectedAmbulance.location.address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Driver Info */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium mb-2">DRIVER</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{selectedAmbulance.driver.name}</p>
                              <p className="text-xs text-gray-500">
                                {selectedAmbulance.driver.experience} years experience
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-4 h-4 fill-amber-500" />
                            <span className="font-medium">{selectedAmbulance.driver.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Equipment */}
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-2">EQUIPMENT</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedAmbulance.equipment.map((item) => (
                            <span
                              key={item}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Contact Buttons */}
                      <div className="space-y-2">
                        <a
                          href={`tel:${selectedAmbulance.contact.phone}`}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          Call Now
                        </a>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedAmbulance.contact.whatsapp && (
                            <a
                              href={`https://wa.me/${selectedAmbulance.contact.whatsapp}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                              WhatsApp
                            </a>
                          )}
                          <a
                            href={getDirectionsUrl(selectedAmbulance)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            <Navigation2 className="w-4 h-4" />
                            Directions
                          </a>
                        </div>
                      </div>

                      {/* Request Button */}
                      {selectedAmbulance.status === "available" && !requestSuccess && (
                        <Button
                          onClick={() => requestAmbulance(selectedAmbulance)}
                          disabled={requestingAmbulance}
                          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 py-6 text-lg"
                        >
                          {requestingAmbulance ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Requesting...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Zap className="w-5 h-5" />
                              Request This Ambulance
                            </span>
                          )}
                        </Button>
                      )}

                      {requestSuccess && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="font-semibold text-green-800">Request Sent!</p>
                          <p className="text-sm text-green-600">
                            The ambulance has been notified and is on the way.
                          </p>
                        </div>
                      )}

                      {/* Price Info */}
                      <div className="text-center text-sm text-gray-500">
                        <p>Estimated cost: GH₵ {selectedAmbulance.pricePerKm}/km</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg">Nearby Ambulances</CardTitle>
                      <p className="text-sm text-gray-500">
                        {sortedAmbulances.length} ambulances found
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                        {sortedAmbulances.map((amb) => (
                          <button
                            key={amb.id}
                            onClick={() => setSelectedAmbulance(amb)}
                            className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  STATUS_CONFIG[amb.status].color
                                }`}
                              >
                                <Ambulance className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-gray-900 truncate">{amb.name}</p>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      STATUS_CONFIG[amb.status].bgLight
                                    } ${STATUS_CONFIG[amb.status].textColor}`}
                                  >
                                    {STATUS_CONFIG[amb.status].label}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{amb.company}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  {amb.estimatedArrival && (
                                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {amb.estimatedArrival} min
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-400">{amb.distance} km</span>
                                  <span
                                    className={`text-xs px-1.5 py-0.5 rounded text-white ${
                                      VEHICLE_TYPES[amb.vehicleType].color
                                    }`}
                                  >
                                    {amb.vehicleType}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            </div>
                          </button>
                        ))}

                        {sortedAmbulances.length === 0 && (
                          <div className="text-center py-8">
                            <Ambulance className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No ambulances match your filters</p>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setFilterStatus("all");
                                setFilterType("all");
                                setSearchQuery("");
                              }}
                              className="mt-3"
                            >
                              Clear Filters
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">BLS - Basic Life Support</h3>
                  <p className="text-sm text-blue-700">
                    Standard emergency transport with basic medical equipment and trained EMTs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900">ALS - Advanced Life Support</h3>
                  <p className="text-sm text-amber-700">
                    Advanced equipment including cardiac monitors, defibrillators, and paramedics.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">MICU - Mobile ICU</h3>
                  <p className="text-sm text-red-700">
                    Full ICU capabilities including ventilators, IV pumps, and critical care staff.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
