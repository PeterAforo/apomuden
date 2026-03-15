"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Ambulance, Phone, MapPin, Clock, Navigation2, Star, Users,
  CheckCircle, XCircle, AlertTriangle, Search, Filter, X,
  ChevronRight, Loader2, RefreshCw, MessageSquare, Mail,
  Shield, Zap, Heart, ArrowLeft, Info, Route, Timer
} from "lucide-react";

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

// Mock ambulance data
const MOCK_AMBULANCES: AmbulanceService[] = [
  {
    id: "amb-001",
    name: "Rapid Response Unit 1",
    company: "Ghana Ambulance Service",
    vehicleType: "ALS",
    status: "available",
    location: { lat: 5.6037, lng: -0.1870, address: "Accra Central, Near Makola Market" },
    contact: { phone: "+233 30 277 7777", whatsapp: "+233244000001", email: "dispatch@gas.gov.gh" },
    driver: { name: "Kwame Mensah", experience: 8, rating: 4.9 },
    equipment: ["Defibrillator", "Oxygen", "Stretcher", "First Aid Kit", "Cardiac Monitor"],
    estimatedArrival: 5,
    distance: 2.3,
    pricePerKm: 15,
    rating: 4.8,
    totalTrips: 1245,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "amb-002",
    name: "Emergency Unit 7",
    company: "National Ambulance Service",
    vehicleType: "MICU",
    status: "available",
    location: { lat: 5.5913, lng: -0.2200, address: "Korle Bu, Near Teaching Hospital" },
    contact: { phone: "+233 30 278 8888", whatsapp: "+233244000002" },
    driver: { name: "Ama Owusu", experience: 12, rating: 4.95 },
    equipment: ["Ventilator", "Defibrillator", "IV Pumps", "Cardiac Monitor", "Suction Unit", "Oxygen"],
    estimatedArrival: 8,
    distance: 4.1,
    pricePerKm: 25,
    rating: 4.9,
    totalTrips: 2156,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "amb-003",
    name: "Quick Response 3",
    company: "Private Medical Transport",
    vehicleType: "BLS",
    status: "busy",
    location: { lat: 5.6145, lng: -0.2050, address: "Osu, Oxford Street Area" },
    contact: { phone: "+233 24 555 1234", whatsapp: "+233245551234" },
    driver: { name: "Kofi Asante", experience: 5, rating: 4.7 },
    equipment: ["Stretcher", "First Aid Kit", "Oxygen", "Wheelchair"],
    estimatedArrival: 12,
    distance: 5.8,
    pricePerKm: 10,
    rating: 4.6,
    totalTrips: 567,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "amb-004",
    name: "Life Saver Unit 2",
    company: "Ghana Ambulance Service",
    vehicleType: "ALS",
    status: "available",
    location: { lat: 5.6350, lng: -0.1750, address: "East Legon, Near A&C Mall" },
    contact: { phone: "+233 30 277 9999", whatsapp: "+233244000004" },
    driver: { name: "Yaw Boateng", experience: 6, rating: 4.8 },
    equipment: ["Defibrillator", "Oxygen", "Stretcher", "Cardiac Monitor", "Suction Unit"],
    estimatedArrival: 7,
    distance: 3.2,
    pricePerKm: 15,
    rating: 4.7,
    totalTrips: 890,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "amb-005",
    name: "Critical Care Mobile",
    company: "Trust Hospital Ambulance",
    vehicleType: "MICU",
    status: "offline",
    location: { lat: 5.5800, lng: -0.1950, address: "Osu, Near Trust Hospital" },
    contact: { phone: "+233 30 276 5555" },
    driver: { name: "Efua Darko", experience: 10, rating: 4.85 },
    equipment: ["Ventilator", "Defibrillator", "IV Pumps", "Incubator", "Cardiac Monitor"],
    estimatedArrival: undefined,
    distance: 3.5,
    pricePerKm: 30,
    rating: 4.9,
    totalTrips: 1567,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "amb-006",
    name: "Community Response 5",
    company: "Ridge Hospital Services",
    vehicleType: "BLS",
    status: "available",
    location: { lat: 5.5550, lng: -0.2100, address: "Ridge, Near Ridge Hospital" },
    contact: { phone: "+233 30 222 3333", whatsapp: "+233244000006" },
    driver: { name: "Abena Sarpong", experience: 4, rating: 4.6 },
    equipment: ["Stretcher", "First Aid Kit", "Oxygen", "AED"],
    estimatedArrival: 10,
    distance: 4.8,
    pricePerKm: 12,
    rating: 4.5,
    totalTrips: 423,
    lastUpdated: new Date().toISOString(),
  },
];

export default function AmbulancePage() {
  const [ambulances, setAmbulances] = useState<AmbulanceService[]>(MOCK_AMBULANCES);
  const [selectedAmbulance, setSelectedAmbulance] = useState<AmbulanceService | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "busy">("all");
  const [filterType, setFilterType] = useState<"all" | "BLS" | "ALS" | "MICU">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [requestingAmbulance, setRequestingAmbulance] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Accra center if location denied
          setUserLocation({ lat: 5.6037, lng: -0.1870 });
        }
      );
    }
  }, []);

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
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Randomly update some statuses for demo
      setAmbulances((prev) =>
        prev.map((amb) => ({
          ...amb,
          lastUpdated: new Date().toISOString(),
        }))
      );
      setLoading(false);
    }, 1000);
  }, []);

  const requestAmbulance = async (ambulance: AmbulanceService) => {
    setRequestingAmbulance(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setRequestingAmbulance(false);
    setRequestSuccess(true);
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
              <div className="relative h-[500px] bg-gradient-to-br from-emerald-50 to-blue-50">
                {/* Map Placeholder with ambulance markers */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Grid pattern for map feel */}
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full">
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>

                    {/* User location marker */}
                    {userLocation && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="relative">
                          <div className="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg" />
                          <div className="absolute -inset-3 bg-blue-400/30 rounded-full animate-ping" />
                        </div>
                        <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-blue-700 whitespace-nowrap">
                          You are here
                        </p>
                      </div>
                    )}

                    {/* Ambulance markers */}
                    {sortedAmbulances.map((amb, idx) => {
                      const angle = (idx / sortedAmbulances.length) * 2 * Math.PI;
                      const radius = 80 + (amb.distance || 3) * 20;
                      const x = 50 + Math.cos(angle) * (radius / 5);
                      const y = 50 + Math.sin(angle) * (radius / 5);

                      return (
                        <button
                          key={amb.id}
                          onClick={() => setSelectedAmbulance(amb)}
                          className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 z-${
                            selectedAmbulance?.id === amb.id ? 20 : 5
                          }`}
                          style={{ left: `${x}%`, top: `${y}%` }}
                        >
                          <div className="relative">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all ${
                                amb.status === "available"
                                  ? "bg-green-500"
                                  : amb.status === "busy"
                                  ? "bg-amber-500"
                                  : "bg-gray-400"
                              } ${selectedAmbulance?.id === amb.id ? "ring-4 ring-red-300 scale-125" : ""}`}
                            >
                              <Ambulance className="w-5 h-5 text-white" />
                            </div>
                            {amb.status === "available" && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                            )}
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                              <span className="text-[10px] font-medium bg-white/90 px-1.5 py-0.5 rounded shadow">
                                {amb.estimatedArrival ? `${amb.estimatedArrival}m` : "N/A"}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
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

                    {/* Map attribution */}
                    <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                      Interactive Map View
                    </div>
                  </div>
                </div>
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
