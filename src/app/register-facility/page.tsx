"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const FACILITY_TYPES = [
  { value: "HOSPITAL", label: "Hospital" },
  { value: "CLINIC", label: "Clinic" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "DIAGNOSTIC_CENTRE", label: "Diagnostic Centre" },
  { value: "MATERNITY_HOME", label: "Maternity Home" },
  { value: "CHPS_COMPOUND", label: "CHPS Compound" },
  { value: "POLYCLINIC", label: "Polyclinic" },
  { value: "HEALTH_CENTRE", label: "Health Centre" },
];

const REGIONS = [
  { value: "GA", label: "Greater Accra" },
  { value: "AS", label: "Ashanti" },
  { value: "WR", label: "Western" },
  { value: "CR", label: "Central" },
  { value: "ER", label: "Eastern" },
  { value: "VR", label: "Volta" },
  { value: "NR", label: "Northern" },
  { value: "UE", label: "Upper East" },
  { value: "UW", label: "Upper West" },
  { value: "BO", label: "Bono" },
  { value: "BE", label: "Bono East" },
  { value: "AH", label: "Ahafo" },
  { value: "WN", label: "Western North" },
  { value: "OT", label: "Oti" },
  { value: "SV", label: "Savannah" },
  { value: "NE", label: "North East" },
];

interface FormData {
  name: string;
  type: string;
  licenseNumber: string;
  address: string;
  region: string;
  district: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  nhisAccepted: boolean;
  emergencyCapable: boolean;
  ambulanceAvailable: boolean;
  bedCount: string;
  adminName: string;
  adminPhone: string;
  adminEmail: string;
}

export default function RegisterFacilityPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "",
    licenseNumber: "",
    address: "",
    region: "",
    district: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    nhisAccepted: false,
    emergencyCapable: false,
    ambulanceAvailable: false,
    bedCount: "",
    adminName: "",
    adminPhone: "",
    adminEmail: "",
  });

  const updateForm = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/facilities/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Error registering facility:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Your facility registration has been submitted for review. The Ministry of Health will verify your information and contact you within 5-7 business days.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-amber-800">
                <strong>Next Steps:</strong>
              </p>
              <ul className="text-sm text-amber-700 mt-2 space-y-1">
                <li>• Verification team will review your license documents</li>
                <li>• You may be contacted for additional information</li>
                <li>• Once approved, you can manage your facility profile</li>
              </ul>
            </div>
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-3xl flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register Your Healthcare Facility</h1>
          <p className="text-gray-600">
            Join Ghana's national health platform and connect with citizens seeking healthcare services.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-lg p-4">
          {[
            { num: 1, label: "Basic Info" },
            { num: 2, label: "Location" },
            { num: 3, label: "Services" },
            { num: 4, label: "Admin" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s.num ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > s.num ? "✓" : s.num}
                </div>
                <span className="text-xs mt-1 text-gray-600">{s.label}</span>
              </div>
              {i < 3 && (
                <div className={`w-full h-1 mx-2 ${step > s.num ? "bg-emerald-600" : "bg-gray-200"}`} style={{ width: "60px" }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Facility Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="e.g., Korle Bu Teaching Hospital"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="type">Facility Type *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => updateForm("type", e.target.value)}
                  className="w-full mt-2 p-3 border rounded-lg"
                >
                  <option value="">Select facility type</option>
                  {FACILITY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="licenseNumber">License Number *</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => updateForm("licenseNumber", e.target.value)}
                  placeholder="GHS-HOS-XXXXX"
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Your Ghana Health Service registration number
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Brief description of your facility and services..."
                  className="w-full mt-2 p-3 border rounded-lg resize-none h-24"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!formData.name || !formData.type || !formData.licenseNumber}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Location & Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                  placeholder="e.g., Guggisberg Avenue, Korle Bu"
                  className="mt-2"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="region">Region *</Label>
                  <select
                    id="region"
                    value={formData.region}
                    onChange={(e) => updateForm("region", e.target.value)}
                    className="w-full mt-2 p-3 border rounded-lg"
                  >
                    <option value="">Select region</option>
                    {REGIONS.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="district">District *</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => updateForm("district", e.target.value)}
                    placeholder="e.g., Accra Metropolitan"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  placeholder="+233 XX XXX XXXX"
                  className="mt-2"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    placeholder="info@facility.com"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateForm("website", e.target.value)}
                    placeholder="https://www.facility.com"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!formData.address || !formData.region || !formData.district || !formData.phone}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Services & Capabilities */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Services & Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Facility Capabilities</Label>
                
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.nhisAccepted}
                    onChange={(e) => updateForm("nhisAccepted", e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <p className="font-medium">NHIS Accepted</p>
                    <p className="text-sm text-gray-500">Accept National Health Insurance Scheme</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.emergencyCapable}
                    onChange={(e) => updateForm("emergencyCapable", e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <p className="font-medium">Emergency Services</p>
                    <p className="text-sm text-gray-500">24/7 emergency care available</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.ambulanceAvailable}
                    onChange={(e) => updateForm("ambulanceAvailable", e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <p className="font-medium">Ambulance Service</p>
                    <p className="text-sm text-gray-500">Own or affiliated ambulance service</p>
                  </div>
                </label>
              </div>

              <div>
                <Label htmlFor="bedCount">Number of Beds</Label>
                <Input
                  id="bedCount"
                  type="number"
                  value={formData.bedCount}
                  onChange={(e) => updateForm("bedCount", e.target.value)}
                  placeholder="e.g., 100"
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Admin Contact */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Administrator Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-600">
                Provide details of the person who will manage this facility's profile on Apomuden.
              </p>

              <div>
                <Label htmlFor="adminName">Full Name *</Label>
                <Input
                  id="adminName"
                  value={formData.adminName}
                  onChange={(e) => updateForm("adminName", e.target.value)}
                  placeholder="e.g., Dr. Kwame Asante"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="adminPhone">Phone Number *</Label>
                <Input
                  id="adminPhone"
                  type="tel"
                  value={formData.adminPhone}
                  onChange={(e) => updateForm("adminPhone", e.target.value)}
                  placeholder="+233 XX XXX XXXX"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="adminEmail">Email Address *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => updateForm("adminEmail", e.target.value)}
                  placeholder="admin@facility.com"
                  className="mt-2"
                />
              </div>

              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="font-medium mb-3">Registration Summary</h4>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Facility:</span> {formData.name}</div>
                  <div><span className="text-gray-500">Type:</span> {formData.type}</div>
                  <div><span className="text-gray-500">License:</span> {formData.licenseNumber}</div>
                  <div><span className="text-gray-500">Region:</span> {REGIONS.find(r => r.value === formData.region)?.label}</div>
                  <div><span className="text-gray-500">Phone:</span> {formData.phone}</div>
                  <div><span className="text-gray-500">NHIS:</span> {formData.nhisAccepted ? "Yes" : "No"}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.adminName || !formData.adminPhone || !formData.adminEmail}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
