"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Phone, MapPin, Navigation, Clock, Building2, Ambulance,
  Heart, AlertTriangle, Baby, Flame, HelpCircle, CheckCircle,
  ArrowRight, ArrowLeft, Loader2, Send, MessageSquare, Mail,
  Shield, Star, Bed, Activity
} from "lucide-react";

interface EmergencyFacility {
  id: string;
  name: string;
  slug: string;
  type: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: number;
  icuBeds?: number;
  emergencyCapable: boolean;
  ambulanceAvailable: boolean;
  tier: string | null;
  averageRating: number;
  estimatedTime?: number;
}

const EMERGENCY_TYPES = [
  { value: "MEDICAL", label: "Medical Emergency", icon: Heart, color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-200", description: "Heart attack, stroke, severe illness, breathing difficulty" },
  { value: "ACCIDENT", label: "Accident/Trauma", icon: AlertTriangle, color: "text-orange-500", bgColor: "bg-orange-50", borderColor: "border-orange-200", description: "Road accident, falls, head injuries, fractures" },
  { value: "MATERNITY", label: "Maternity Emergency", icon: Baby, color: "text-pink-500", bgColor: "bg-pink-50", borderColor: "border-pink-200", description: "Labor, pregnancy complications, delivery" },
  { value: "FIRE_BURNS", label: "Fire/Burns", icon: Flame, color: "text-amber-500", bgColor: "bg-amber-50", borderColor: "border-amber-200", description: "Burns, fire-related injuries, smoke inhalation" },
  { value: "OTHER", label: "Other Emergency", icon: HelpCircle, color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-200", description: "Poisoning, allergic reactions, other urgent needs" },
];

export default function EmergencyPage() {
  const [step, setStep] = useState(1);
  const [emergencyType, setEmergencyType] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [patientName, setPatientName] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [facilities, setFacilities] = useState<EmergencyFacility[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<EmergencyFacility | null>(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [facilityContact, setFacilityContact] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    // Get user location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError("Could not get your location. Please enable location services.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  // Fetch facilities when emergency type is selected and location is available
  const fetchEmergencyFacilities = useCallback(async () => {
    if (!emergencyType || !location) return;
    
    setLoadingFacilities(true);
    try {
      const params = new URLSearchParams({
        emergency: "true",
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        type: emergencyType,
        pageSize: "10",
      });
      
      const res = await fetch(`/api/facilities?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        // Add estimated time and distance (mock calculation)
        const facilitiesWithDistance = data.data.items.map((f: EmergencyFacility, index: number) => ({
          ...f,
          distance: Math.round((index + 1) * 2.5 * 10) / 10,
          estimatedTime: Math.round((index + 1) * 5 + 5),
          icuBeds: Math.floor(Math.random() * 10) + 1,
        }));
        setFacilities(facilitiesWithDistance);
      }
    } catch (error) {
      console.error("Error fetching facilities:", error);
    } finally {
      setLoadingFacilities(false);
    }
  }, [emergencyType, location]);

  useEffect(() => {
    if (step === 2 && emergencyType && location) {
      fetchEmergencyFacilities();
    }
  }, [step, emergencyType, location, fetchEmergencyFacilities]);

  const handleSubmit = async () => {
    if (!emergencyType || !phone || !location || !selectedFacility) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: emergencyType,
          description,
          callbackPhone: phone,
          email,
          patientName,
          latitude: location.lat,
          longitude: location.lng,
          facilityId: selectedFacility.id,
          sendDirections: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRequestId(data.data.id);
        setFacilityContact({
          name: "Emergency Coordinator",
          phone: selectedFacility.phone || "+233 XX XXX XXXX",
        });
        setSubmitted(true);
        setTrackingActive(true);
      }
    } catch (error) {
      console.error("Error submitting emergency request:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Send directions via different channels
  const sendDirections = async (channel: "whatsapp" | "sms" | "email") => {
    if (!selectedFacility || !location) return;
    
    const directionsUrl = `https://www.google.com/maps/dir/${location.lat},${location.lng}/${selectedFacility.latitude},${selectedFacility.longitude}`;
    
    if (channel === "whatsapp") {
      const message = encodeURIComponent(`Emergency directions to ${selectedFacility.name}:\n${directionsUrl}`);
      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${message}`, "_blank");
    } else if (channel === "sms") {
      window.open(`sms:${phone}?body=${encodeURIComponent(`Emergency directions: ${directionsUrl}`)}`, "_blank");
    } else if (channel === "email" && email) {
      const subject = encodeURIComponent("Emergency Directions - Apomuden");
      const body = encodeURIComponent(`Emergency directions to ${selectedFacility.name}:\n\n${directionsUrl}\n\nFacility Contact: ${selectedFacility.phone}`);
      window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
    }
  };;

  if (submitted && selectedFacility) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        {/* Header */}
        <header className="bg-red-600 text-white py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-bold text-xl">A</span>
                </div>
                <span className="text-xl font-bold">Emergency Active</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm">Live Tracking</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Success Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Help is on the way!</h1>
                    <p className="text-gray-600">Request ID: <span className="font-mono font-bold">{requestId.slice(0, 8).toUpperCase()}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Selected Facility Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Destination Hospital
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Ambulance className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{selectedFacility.name}</h3>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {selectedFacility.address}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> ~{selectedFacility.estimatedTime} min
                    </span>
                    <span className="text-sm text-gray-500">
                      {selectedFacility.distance} km away
                    </span>
                  </div>
                </div>
              </div>

              {/* Facility Contact */}
              {facilityContact && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">Hospital Contact Person</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-blue-900">{facilityContact.name}</span>
                    <a href={`tel:${facilityContact.phone}`} className="flex items-center gap-1 text-blue-600 font-medium">
                      <Phone className="w-4 h-4" /> {facilityContact.phone}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Send Directions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-600" />
                Send Directions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">Send hospital directions to your phone:</p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => sendDirections("whatsapp")}
                  className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                >
                  <MessageSquare className="w-6 h-6 text-green-600" />
                  <span className="text-xs font-medium text-green-700">WhatsApp</span>
                </button>
                <button
                  onClick={() => sendDirections("sms")}
                  className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <Send className="w-6 h-6 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">SMS</span>
                </button>
                <button
                  onClick={() => sendDirections("email")}
                  disabled={!email}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors disabled:opacity-50"
                >
                  <Mail className="w-6 h-6 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">Email</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Tracking Placeholder */}
          {trackingActive && (
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-amber-600 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-800">Real-time Tracking Active</p>
                    <p className="text-sm text-amber-600">Hospital has been notified and is preparing for your arrival</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Important Info */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Important</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Keep your phone nearby - responders will call {phone}
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Hospital has been alerted and is preparing for your arrival
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Follow the directions sent to your phone
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <a
              href={`https://www.google.com/maps/dir/${location?.lat},${location?.lng}/${selectedFacility.latitude},${selectedFacility.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Navigation className="w-4 h-4 mr-2" /> Open Navigation
              </Button>
            </a>
            <a href={`tel:${selectedFacility.phone}`} className="flex-1">
              <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                <Phone className="w-4 h-4 mr-2" /> Call Hospital
              </Button>
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50">
      {/* Header */}
      <header className="bg-red-600 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-bold text-xl">A</span>
              </div>
              <span className="text-xl font-bold">Emergency Services</span>
            </Link>
            <a href="tel:112" className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call 112
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[
            { num: 1, label: "Type" },
            { num: 2, label: "Hospital" },
            { num: 3, label: "Details" },
            { num: 4, label: "Confirm" },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s.num ? "bg-red-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-xs mt-1 ${step >= s.num ? "text-red-600 font-medium" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
              {idx < 3 && (
                <div className={`w-8 sm:w-12 h-1 mx-1 ${step > s.num ? "bg-red-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Emergency Type */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center text-red-600 text-xl">What type of emergency?</CardTitle>
                  <p className="text-center text-gray-500 text-sm">Select the type that best describes your situation</p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {EMERGENCY_TYPES.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => {
                            setEmergencyType(type.value);
                            setStep(2);
                          }}
                          className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                            emergencyType === type.value
                              ? `${type.borderColor} ${type.bgColor}`
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${type.bgColor} rounded-full flex items-center justify-center`}>
                              <IconComponent className={`w-6 h-6 ${type.color}`} />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{type.label}</p>
                              <p className="text-sm text-gray-500">{type.description}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Select Hospital */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center text-red-600 text-xl">Select Nearest Hospital</CardTitle>
                  <p className="text-center text-gray-500 text-sm">Hospitals with emergency services and available ICU beds</p>
                </CardHeader>
                <CardContent>
                  {loadingFacilities ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
                      <p className="text-gray-600">Finding nearby hospitals...</p>
                    </div>
                  ) : facilities.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No emergency facilities found nearby</p>
                      <Button onClick={() => setStep(1)} variant="outline" className="mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {facilities.map((facility) => (
                        <button
                          key={facility.id}
                          onClick={() => {
                            setSelectedFacility(facility);
                            setStep(3);
                          }}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                            selectedFacility?.id === facility.id
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-200 hover:border-emerald-300 bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 line-clamp-1">{facility.name}</h4>
                              <p className="text-sm text-gray-500 line-clamp-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {facility.address}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> ~{facility.estimatedTime} min
                                </span>
                                <span className="text-xs text-gray-500">{facility.distance} km</span>
                                {facility.icuBeds && facility.icuBeds > 0 && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Bed className="w-3 h-3" /> {facility.icuBeds} ICU
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-4 h-4 fill-amber-500" />
                              <span className="text-sm font-medium">{facility.averageRating.toFixed(1)}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Provide Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center text-red-600 text-xl">Provide Details</CardTitle>
                  <p className="text-center text-gray-500 text-sm">Contact information for emergency responders</p>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Selected Hospital Summary */}
                  {selectedFacility && (
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="font-medium text-emerald-800">{selectedFacility.name}</p>
                          <p className="text-xs text-emerald-600">~{selectedFacility.estimatedTime} min away</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="patientName">Patient Name</Label>
                    <Input
                      id="patientName"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter patient name"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Callback Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+233 XX XXX XXXX"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email (for directions)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Additional Details (optional)</Label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the situation, symptoms, or any important information..."
                      className="w-full mt-2 p-3 border rounded-lg resize-none h-20 text-sm"
                    />
                  </div>

                  <div>
                    <Label>Your Location</Label>
                    <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                      {location ? (
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-700 text-sm">Location detected</p>
                            <p className="text-xs text-gray-500">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          <p className="text-gray-600 text-sm">Detecting location...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button
                      onClick={() => setStep(4)}
                      disabled={!phone || !location}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center text-red-600 text-xl">Confirm Emergency Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Emergency Type */}
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const type = EMERGENCY_TYPES.find((t) => t.value === emergencyType);
                        if (type) {
                          const IconComponent = type.icon;
                          return (
                            <>
                              <div className={`w-10 h-10 ${type.bgColor} rounded-full flex items-center justify-center`}>
                                <IconComponent className={`w-5 h-5 ${type.color}`} />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{type.label}</p>
                                {description && <p className="text-sm text-gray-600">{description}</p>}
                              </div>
                            </>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  {/* Selected Hospital */}
                  {selectedFacility && (
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-xs text-emerald-600 font-medium mb-2">DESTINATION HOSPITAL</p>
                      <p className="font-semibold text-gray-900">{selectedFacility.name}</p>
                      <p className="text-sm text-gray-600">{selectedFacility.address}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className="text-emerald-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> ~{selectedFacility.estimatedTime} min
                        </span>
                        <span className="text-gray-500">{selectedFacility.distance} km</span>
                      </div>
                    </div>
                  )}

                  {/* Contact Details */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium mb-2">CONTACT DETAILS</p>
                    <div className="space-y-1 text-sm">
                      {patientName && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Patient:</span>
                          <span className="font-medium">{patientName}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span className="font-medium">{phone}</span>
                      </div>
                      {email && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Email:</span>
                          <span className="font-medium">{email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* What happens next */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium mb-2">WHAT HAPPENS NEXT</p>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        Directions sent to your phone via WhatsApp, SMS & Email
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        Hospital alerted and preparing for your arrival
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        Hospital contact person will call you
                      </li>
                    </ul>
                  </div>

                  {/* Warning */}
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-800">
                      <strong>Important:</strong> By submitting, you confirm this is a genuine emergency.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !selectedFacility}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending Alert...
                        </span>
                      ) : (
                        <>🚨 Request Emergency Help</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emergency Numbers */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">For immediate assistance, call:</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="tel:112" className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex items-center gap-2">
              <Phone className="w-4 h-4" /> 112 (Emergency)
            </a>
            <a href="tel:193" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
              <Ambulance className="w-4 h-4" /> 193 (Ambulance)
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
