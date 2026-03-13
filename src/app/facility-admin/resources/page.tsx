"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Bed, 
  Heart, 
  Droplets,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";

interface ResourceData {
  bedCount: number;
  bedsAvailable: number;
  icuBeds: number;
  icuBedsAvailable: number;
  ventilators: number;
  ventilatorsAvailable: number;
  bloodBank: {
    "A+": number;
    "A-": number;
    "B+": number;
    "B-": number;
    "AB+": number;
    "AB-": number;
    "O+": number;
    "O-": number;
  };
  lastUpdated: string;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export default function ResourceTrackerPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [resources, setResources] = useState<ResourceData>({
    bedCount: 0,
    bedsAvailable: 0,
    icuBeds: 0,
    icuBedsAvailable: 0,
    ventilators: 0,
    ventilatorsAvailable: 0,
    bloodBank: {
      "A+": 0, "A-": 0, "B+": 0, "B-": 0,
      "AB+": 0, "AB-": 0, "O+": 0, "O-": 0,
    },
    lastUpdated: new Date().toISOString(),
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch("/api/facility-admin/resources");
      if (response.ok) {
        const data = await response.json();
        if (data.resources) {
          setResources(data.resources);
        }
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/facility-admin/resources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resources),
      });

      if (response.ok) {
        setSuccess("Resources updated successfully");
        setResources(prev => ({ ...prev, lastUpdated: new Date().toISOString() }));
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update resources");
      }
    } catch (err) {
      setError("Failed to update resources");
    } finally {
      setSaving(false);
    }
  };

  const getOccupancyColor = (available: number, total: number) => {
    if (total === 0) return "text-gray-500";
    const rate = (total - available) / total;
    if (rate >= 0.9) return "text-red-600";
    if (rate >= 0.7) return "text-yellow-600";
    return "text-green-600";
  };

  const getOccupancyPercent = (available: number, total: number) => {
    if (total === 0) return 0;
    return Math.round(((total - available) / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Resource Tracker</h1>
                <p className="text-indigo-100 mt-1">Update bed, ICU, and blood bank availability</p>
              </div>
            </div>
            <div className="text-sm text-indigo-200">
              Last updated: {new Date(resources.lastUpdated).toLocaleString()}
            </div>
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bed Capacity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-indigo-600" />
                General Beds
              </CardTitle>
              <CardDescription>
                {getOccupancyPercent(resources.bedsAvailable, resources.bedCount)}% occupied
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bedCount">Total Beds</Label>
                <Input
                  id="bedCount"
                  type="number"
                  min="0"
                  value={resources.bedCount}
                  onChange={(e) => setResources(prev => ({ ...prev, bedCount: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="bedsAvailable">Available Beds</Label>
                <Input
                  id="bedsAvailable"
                  type="number"
                  min="0"
                  max={resources.bedCount}
                  value={resources.bedsAvailable}
                  onChange={(e) => setResources(prev => ({ ...prev, bedsAvailable: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Occupancy</span>
                  <span className={getOccupancyColor(resources.bedsAvailable, resources.bedCount)}>
                    {resources.bedCount - resources.bedsAvailable} / {resources.bedCount}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      getOccupancyPercent(resources.bedsAvailable, resources.bedCount) >= 90
                        ? "bg-red-500"
                        : getOccupancyPercent(resources.bedsAvailable, resources.bedCount) >= 70
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${getOccupancyPercent(resources.bedsAvailable, resources.bedCount)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ICU Capacity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                ICU Beds
              </CardTitle>
              <CardDescription>
                {getOccupancyPercent(resources.icuBedsAvailable, resources.icuBeds)}% occupied
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="icuBeds">Total ICU Beds</Label>
                <Input
                  id="icuBeds"
                  type="number"
                  min="0"
                  value={resources.icuBeds}
                  onChange={(e) => setResources(prev => ({ ...prev, icuBeds: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="icuBedsAvailable">Available ICU Beds</Label>
                <Input
                  id="icuBedsAvailable"
                  type="number"
                  min="0"
                  max={resources.icuBeds}
                  value={resources.icuBedsAvailable}
                  onChange={(e) => setResources(prev => ({ ...prev, icuBedsAvailable: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Occupancy</span>
                  <span className={getOccupancyColor(resources.icuBedsAvailable, resources.icuBeds)}>
                    {resources.icuBeds - resources.icuBedsAvailable} / {resources.icuBeds}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      getOccupancyPercent(resources.icuBedsAvailable, resources.icuBeds) >= 90
                        ? "bg-red-500"
                        : getOccupancyPercent(resources.icuBedsAvailable, resources.icuBeds) >= 70
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${getOccupancyPercent(resources.icuBedsAvailable, resources.icuBeds)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ventilators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Ventilators
              </CardTitle>
              <CardDescription>
                {getOccupancyPercent(resources.ventilatorsAvailable, resources.ventilators)}% in use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ventilators">Total Ventilators</Label>
                <Input
                  id="ventilators"
                  type="number"
                  min="0"
                  value={resources.ventilators}
                  onChange={(e) => setResources(prev => ({ ...prev, ventilators: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="ventilatorsAvailable">Available Ventilators</Label>
                <Input
                  id="ventilatorsAvailable"
                  type="number"
                  min="0"
                  max={resources.ventilators}
                  value={resources.ventilatorsAvailable}
                  onChange={(e) => setResources(prev => ({ ...prev, ventilatorsAvailable: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>In Use</span>
                  <span className={getOccupancyColor(resources.ventilatorsAvailable, resources.ventilators)}>
                    {resources.ventilators - resources.ventilatorsAvailable} / {resources.ventilators}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      getOccupancyPercent(resources.ventilatorsAvailable, resources.ventilators) >= 90
                        ? "bg-red-500"
                        : getOccupancyPercent(resources.ventilatorsAvailable, resources.ventilators) >= 70
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${getOccupancyPercent(resources.ventilatorsAvailable, resources.ventilators)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blood Bank */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-red-600" />
              Blood Bank Inventory
            </CardTitle>
            <CardDescription>Units available by blood type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {BLOOD_TYPES.map((type) => (
                <div key={type} className="text-center">
                  <Label className="text-lg font-bold text-red-600">{type}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={resources.bloodBank[type]}
                    onChange={(e) => setResources(prev => ({
                      ...prev,
                      bloodBank: {
                        ...prev.bloodBank,
                        [type]: parseInt(e.target.value) || 0,
                      },
                    }))}
                    className="text-center mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">units</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700"
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
