"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Ambulance, 
  MapPin, 
  Phone, 
  Clock, 
  Navigation,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react";

interface AmbulanceLocation {
  id: string;
  registrationNumber: string;
  driverName: string;
  driverPhone: string;
  latitude: number;
  longitude: number;
  eta: number; // minutes
  status: "EN_ROUTE" | "ARRIVED" | "RETURNING";
  lastUpdated: string;
}

interface EmergencyRequest {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  ambulance?: AmbulanceLocation;
}

export default function TrackAmbulancePage() {
  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    fetchEmergencyRequest();
    
    // Simulate real-time updates every 5 seconds
    const interval = setInterval(() => {
      if (request?.ambulance && request.ambulance.status === "EN_ROUTE") {
        simulateLocationUpdate();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchEmergencyRequest = async () => {
    try {
      const response = await fetch("/api/emergency/active");
      if (response.ok) {
        const data = await response.json();
        setRequest(data.request);
      } else {
        setError("No active emergency request found");
      }
    } catch (err) {
      setError("Failed to fetch emergency request");
    } finally {
      setLoading(false);
    }
  };

  const simulateLocationUpdate = () => {
    if (!request?.ambulance) return;

    // Simulate ambulance moving closer
    setRequest(prev => {
      if (!prev?.ambulance) return prev;
      
      const newEta = Math.max(0, prev.ambulance.eta - 1);
      const newStatus = newEta === 0 ? "ARRIVED" : "EN_ROUTE";
      
      return {
        ...prev,
        ambulance: {
          ...prev.ambulance,
          eta: newEta,
          status: newStatus as "EN_ROUTE" | "ARRIVED" | "RETURNING",
          latitude: prev.ambulance.latitude + (Math.random() - 0.5) * 0.001,
          longitude: prev.ambulance.longitude + (Math.random() - 0.5) * 0.001,
          lastUpdated: new Date().toISOString(),
        },
      };
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EN_ROUTE": return "bg-yellow-100 text-yellow-800";
      case "ARRIVED": return "bg-green-100 text-green-800";
      case "RETURNING": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "EN_ROUTE": return "On the way";
      case "ARRIVED": return "Arrived";
      case "RETURNING": return "Returning to base";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Ambulance className="h-8 w-8" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Track Ambulance</h1>
              <p className="text-red-100 mt-1">Real-time ambulance location tracking</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : error ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">{error}</h2>
              <p className="text-gray-500 mb-4">You don't have an active emergency request with an ambulance dispatched.</p>
              <Button onClick={() => window.location.href = "/emergency"} className="bg-red-600 hover:bg-red-700">
                Request Emergency Help
              </Button>
            </CardContent>
          </Card>
        ) : request?.ambulance ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <Card className="h-[500px]">
                <CardContent className="p-0 h-full relative">
                  <div 
                    ref={mapRef}
                    className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center"
                  >
                    {/* Map placeholder - In production, use Mapbox */}
                    <div className="text-center p-8">
                      <Navigation className="h-16 w-16 mx-auto text-red-500 mb-4 animate-pulse" />
                      <p className="text-gray-600 font-medium">Live Map View</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Ambulance Location: {request.ambulance.latitude.toFixed(4)}, {request.ambulance.longitude.toFixed(4)}
                      </p>
                      <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center justify-center gap-2 text-red-600">
                          <Ambulance className="h-5 w-5" />
                          <span className="font-semibold">{request.ambulance.registrationNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* ETA Overlay */}
                  <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Estimated Arrival</p>
                      <p className="text-3xl font-bold text-red-600">
                        {request.ambulance.eta} min
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ambulance Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Ambulance Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(request.ambulance.status)}`}>
                      {getStatusText(request.ambulance.status)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Ambulance className="h-10 w-10 text-red-600" />
                    <div>
                      <p className="font-semibold">{request.ambulance.registrationNumber}</p>
                      <p className="text-sm text-gray-500">Advanced Life Support</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Driver</p>
                        <p className="font-medium">{request.ambulance.driverName}</p>
                      </div>
                    </div>

                    <a href={`tel:${request.ambulance.driverPhone}`}>
                      <Button variant="outline" className="w-full">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Driver: {request.ambulance.driverPhone}
                      </Button>
                    </a>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      Last updated: {new Date(request.ambulance.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {request.ambulance.status === "ARRIVED" && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-green-800">Ambulance Has Arrived!</h3>
                    <p className="text-green-600 mt-1">The medical team is at your location</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Emergency Numbers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a href="tel:112" className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    <span className="font-medium text-red-700">National Emergency</span>
                    <span className="text-red-600 font-bold">112</span>
                  </a>
                  <a href="tel:193" className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    <span className="font-medium text-red-700">Ambulance Service</span>
                    <span className="text-red-600 font-bold">193</span>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Ambulance className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No ambulance dispatched yet</h2>
              <p className="text-gray-500">Your emergency request is being processed</p>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
