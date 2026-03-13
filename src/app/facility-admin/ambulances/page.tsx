"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Ambulance as AmbulanceIcon, 
  Plus, 
  MapPin, 
  Phone,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Navigation
} from "lucide-react";

interface Ambulance {
  id: string;
  registrationNumber: string;
  type: "BASIC" | "ADVANCED" | "NEONATAL";
  status: "AVAILABLE" | "ON_CALL" | "OUT_OF_SERVICE";
  driverName: string | null;
  driverPhone: string | null;
  currentLatitude: number | null;
  currentLongitude: number | null;
  lastUpdated: string;
}

interface EmergencyRequest {
  id: string;
  type: string;
  description: string | null;
  status: string;
  callbackPhone: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  citizen: { name: string };
}

const STATUS_CONFIG = {
  AVAILABLE: { color: "bg-green-100 text-green-800", label: "Available" },
  ON_CALL: { color: "bg-yellow-100 text-yellow-800", label: "On Call" },
  OUT_OF_SERVICE: { color: "bg-red-100 text-red-800", label: "Out of Service" },
};

const TYPE_CONFIG = {
  BASIC: { color: "bg-blue-100 text-blue-800", label: "Basic Life Support" },
  ADVANCED: { color: "bg-purple-100 text-purple-800", label: "Advanced Life Support" },
  NEONATAL: { color: "bg-pink-100 text-pink-800", label: "Neonatal" },
};

export default function AmbulanceManagementPage() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [newAmbulance, setNewAmbulance] = useState({
    registrationNumber: "",
    type: "BASIC" as "BASIC" | "ADVANCED" | "NEONATAL",
    driverName: "",
    driverPhone: "",
  });

  useEffect(() => {
    fetchData();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [ambulanceRes, emergencyRes] = await Promise.all([
        fetch("/api/facility-admin/ambulances"),
        fetch("/api/facility-admin/emergency-requests"),
      ]);

      if (ambulanceRes.ok) {
        const data = await ambulanceRes.json();
        setAmbulances(data.ambulances);
      }

      if (emergencyRes.ok) {
        const data = await emergencyRes.json();
        setEmergencyRequests(data.requests);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAmbulance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/facility-admin/ambulances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAmbulance),
      });

      if (response.ok) {
        setSuccess("Ambulance added successfully");
        setShowAddForm(false);
        setNewAmbulance({ registrationNumber: "", type: "BASIC", driverName: "", driverPhone: "" });
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add ambulance");
      }
    } catch (err) {
      setError("Failed to add ambulance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ambulanceId: string, status: string) => {
    try {
      const response = await fetch(`/api/facility-admin/ambulances/${ambulanceId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDispatch = async (ambulanceId: string, emergencyId: string) => {
    try {
      const response = await fetch(`/api/facility-admin/ambulances/${ambulanceId}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyRequestId: emergencyId }),
      });

      if (response.ok) {
        setSuccess("Ambulance dispatched successfully");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error dispatching ambulance:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <AmbulanceIcon className="h-8 w-8" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Ambulance Management</h1>
                <p className="text-red-100 mt-1">Manage fleet and dispatch to emergencies</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-white text-red-600 hover:bg-red-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Ambulance
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Add Ambulance Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddForm(false)} />
            <Card className="relative w-full max-w-md">
              <CardHeader>
                <CardTitle>Add New Ambulance</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddAmbulance} className="space-y-4">
                  <div>
                    <Label htmlFor="regNumber">Registration Number</Label>
                    <Input
                      id="regNumber"
                      value={newAmbulance.registrationNumber}
                      onChange={(e) => setNewAmbulance(prev => ({ ...prev, registrationNumber: e.target.value }))}
                      placeholder="e.g., GR-1234-20"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Ambulance Type</Label>
                    <select
                      id="type"
                      value={newAmbulance.type}
                      onChange={(e) => setNewAmbulance(prev => ({ ...prev, type: e.target.value as typeof newAmbulance.type }))}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="BASIC">Basic Life Support</option>
                      <option value="ADVANCED">Advanced Life Support</option>
                      <option value="NEONATAL">Neonatal</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="driverName">Driver Name</Label>
                    <Input
                      id="driverName"
                      value={newAmbulance.driverName}
                      onChange={(e) => setNewAmbulance(prev => ({ ...prev, driverName: e.target.value }))}
                      placeholder="Driver's full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="driverPhone">Driver Phone</Label>
                    <Input
                      id="driverPhone"
                      value={newAmbulance.driverPhone}
                      onChange={(e) => setNewAmbulance(prev => ({ ...prev, driverPhone: e.target.value }))}
                      placeholder="e.g., 0201234567"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-1 bg-red-600 hover:bg-red-700">
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Ambulance"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Ambulance Fleet */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ambulance Fleet ({ambulances.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {ambulances.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No ambulances registered</p>
                  ) : (
                    <div className="space-y-4">
                      {ambulances.map((ambulance) => (
                        <div key={ambulance.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-lg">{ambulance.registrationNumber}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_CONFIG[ambulance.type].color}`}>
                                  {TYPE_CONFIG[ambulance.type].label}
                                </span>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                {ambulance.driverName && (
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    {ambulance.driverName}
                                  </div>
                                )}
                                {ambulance.driverPhone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    {ambulance.driverPhone}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[ambulance.status].color}`}>
                                {STATUS_CONFIG[ambulance.status].label}
                              </span>
                              <div className="mt-3 flex gap-2">
                                {ambulance.status !== "AVAILABLE" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateStatus(ambulance.id, "AVAILABLE")}
                                  >
                                    Set Available
                                  </Button>
                                )}
                                {ambulance.status === "AVAILABLE" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateStatus(ambulance.id, "OUT_OF_SERVICE")}
                                  >
                                    Out of Service
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Pending Emergency Requests */}
            <div className="space-y-6">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    Pending Emergencies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {emergencyRequests.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No pending requests</p>
                  ) : (
                    <div className="space-y-4">
                      {emergencyRequests.map((request) => (
                        <div key={request.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-red-800">{request.type}</span>
                            <span className="text-xs text-red-600">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {new Date(request.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{request.description || "No description"}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <Phone className="h-3 w-3" />
                            {request.callbackPhone}
                          </div>
                          {ambulances.filter(a => a.status === "AVAILABLE").length > 0 && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleDispatch(e.target.value, request.id);
                                }
                              }}
                              className="w-full px-3 py-2 border rounded text-sm"
                              defaultValue=""
                            >
                              <option value="">Dispatch ambulance...</option>
                              {ambulances
                                .filter(a => a.status === "AVAILABLE")
                                .map(a => (
                                  <option key={a.id} value={a.id}>
                                    {a.registrationNumber} - {TYPE_CONFIG[a.type].label}
                                  </option>
                                ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Fleet Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Available</span>
                      <span className="font-bold text-green-600">
                        {ambulances.filter(a => a.status === "AVAILABLE").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">On Call</span>
                      <span className="font-bold text-yellow-600">
                        {ambulances.filter(a => a.status === "ON_CALL").length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Out of Service</span>
                      <span className="font-bold text-red-600">
                        {ambulances.filter(a => a.status === "OUT_OF_SERVICE").length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
