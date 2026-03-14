"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EMERGENCY_TYPES = [
  { value: "MEDICAL", label: "Medical Emergency", icon: "🏥", description: "Heart attack, stroke, severe illness" },
  { value: "ACCIDENT", label: "Accident/Trauma", icon: "🚗", description: "Road accident, falls, injuries" },
  { value: "MATERNITY", label: "Maternity", icon: "👶", description: "Labor, pregnancy complications" },
  { value: "FIRE_BURNS", label: "Fire/Burns", icon: "🔥", description: "Burns, fire-related injuries" },
  { value: "OTHER", label: "Other Emergency", icon: "🆘", description: "Other urgent medical needs" },
];

export default function EmergencyPage() {
  const [step, setStep] = useState(1);
  const [emergencyType, setEmergencyType] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState("");

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

  const handleSubmit = async () => {
    if (!emergencyType || !phone || !location) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: emergencyType,
          description,
          callbackPhone: phone,
          latitude: location.lat,
          longitude: location.lng,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRequestId(data.data.id);
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting emergency request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Help is on the way!</h1>
            <p className="text-gray-600 mb-6">
              Your emergency request has been received. Emergency services have been notified and will contact you shortly.
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Request ID</p>
              <p className="font-mono font-bold text-lg">{requestId.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                <strong>Keep your phone nearby.</strong> Emergency responders will call you at {phone}.
              </p>
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
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
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? "bg-red-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 ${step > s ? "bg-red-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Emergency Type */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">What type of emergency?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {EMERGENCY_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setEmergencyType(type.value);
                      setStep(2);
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      emergencyType === type.value
                        ? "border-red-600 bg-red-50"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{type.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{type.label}</p>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">Provide Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="description">Describe the emergency (optional)</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any additional details that might help responders..."
                  className="w-full mt-2 p-3 border rounded-lg resize-none h-24 text-base sm:text-sm"
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
                <p className="text-sm text-gray-500 mt-1">
                  Emergency responders will call this number
                </p>
              </div>

              <div>
                <Label>Your Location</Label>
                <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                  {location ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-green-700">Location detected</p>
                        <p className="text-sm text-gray-500">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  ) : locationError ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-red-700">Location unavailable</p>
                        <p className="text-sm text-gray-500">{locationError}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-600">Detecting your location...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!phone || !location}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">Confirm Emergency Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">
                    {EMERGENCY_TYPES.find((t) => t.value === emergencyType)?.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {EMERGENCY_TYPES.find((t) => t.value === emergencyType)?.label}
                    </p>
                    {description && <p className="text-sm text-gray-600">{description}</p>}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Callback Number:</span>
                    <span className="font-medium">{phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-medium">
                      {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> By submitting this request, you confirm this is a genuine emergency. 
                  False emergency reports may result in legal consequences.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "🚨 Request Emergency Help"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Numbers */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">For immediate assistance, call:</p>
          <div className="flex justify-center gap-4">
            <a href="tel:112" className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">
              📞 112 (Emergency)
            </a>
            <a href="tel:193" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
              🚑 193 (Ambulance)
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
