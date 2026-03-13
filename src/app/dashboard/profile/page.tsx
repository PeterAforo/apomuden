"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Shield, 
  UserPlus, 
  Trash2, 
  Save, 
  Loader2,
  Bell,
  AlertCircle
} from "lucide-react";

interface EmergencyContact {
  id?: string;
  name: string;
  phone: string;
  relationship: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  ghanaCardId: string | null;
  nhisNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  bloodType: string | null;
  emergencyContacts: EmergencyContact[];
  notificationPreferences: {
    sms: boolean;
    email: boolean;
    push: boolean;
    healthAlerts: boolean;
    facilityUpdates: boolean;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    name: "",
    email: null,
    phone: "",
    ghanaCardId: null,
    nhisNumber: null,
    dateOfBirth: null,
    gender: null,
    bloodType: null,
    emergencyContacts: [],
    notificationPreferences: {
      sms: true,
      email: true,
      push: true,
      healthAlerts: true,
      facilityUpdates: false,
    },
  });

  const [newContact, setNewContact] = useState<EmergencyContact>({
    name: "",
    phone: "",
    relationship: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          ghanaCardId: profile.ghanaCardId,
          nhisNumber: profile.nhisNumber,
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
          bloodType: profile.bloodType,
          notificationPreferences: profile.notificationPreferences,
        }),
      });

      if (response.ok) {
        setSuccess("Profile updated successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone || !newContact.relationship) {
      setError("Please fill in all emergency contact fields");
      return;
    }

    try {
      const response = await fetch("/api/user/emergency-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContact),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({
          ...prev,
          emergencyContacts: [...prev.emergencyContacts, data.contact],
        }));
        setNewContact({ name: "", phone: "", relationship: "" });
        setSuccess("Emergency contact added");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add contact");
      }
    } catch (error) {
      setError("Failed to add contact");
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    try {
      const response = await fetch(`/api/user/emergency-contacts?id=${contactId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProfile(prev => ({
          ...prev,
          emergencyContacts: prev.emergencyContacts.filter(c => c.id !== contactId),
        }));
        setSuccess("Contact removed");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      setError("Failed to remove contact");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold">Profile Settings</h1>
          <p className="text-emerald-100 mt-1">Manage your personal information and preferences</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your basic profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Phone cannot be changed</p>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email || ""}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={profile.dateOfBirth || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={profile.gender || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <select
                      id="bloodType"
                      value={profile.bloodType || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, bloodType: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Select blood type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NHIS & Ghana Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  NHIS & Identification
                </CardTitle>
                <CardDescription>Your health insurance and ID details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nhis">NHIS Number</Label>
                    <Input
                      id="nhis"
                      value={profile.nhisNumber || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, nhisNumber: e.target.value }))}
                      placeholder="Enter your NHIS number"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used to check insurance coverage</p>
                  </div>
                  <div>
                    <Label htmlFor="ghanaCard">Ghana Card Number</Label>
                    <Input
                      id="ghanaCard"
                      value={profile.ghanaCardId || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, ghanaCardId: e.target.value }))}
                      placeholder="GHA-XXXXXXXXX-X"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Emergency Contacts
                </CardTitle>
                <CardDescription>People to contact in case of emergency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Contacts */}
                {profile.emergencyContacts.length > 0 && (
                  <div className="space-y-3">
                    {profile.emergencyContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-gray-500">
                            {contact.phone} • {contact.relationship}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => contact.id && handleRemoveContact(contact.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Contact */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">Add New Contact</p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Name"
                      value={newContact.name}
                      onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Phone"
                      value={newContact.phone}
                      onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                    />
                    <Input
                      placeholder="Relationship"
                      value={newContact.relationship}
                      onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                    />
                  </div>
                  <Button
                    onClick={handleAddContact}
                    variant="outline"
                    className="mt-3"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-emerald-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-gray-500">Receive alerts via SMS</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.notificationPreferences.sms}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      notificationPreferences: {
                        ...prev.notificationPreferences,
                        sms: e.target.checked,
                      },
                    }))}
                    className="h-5 w-5 text-emerald-600 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive alerts via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.notificationPreferences.email}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      notificationPreferences: {
                        ...prev.notificationPreferences,
                        email: e.target.checked,
                      },
                    }))}
                    className="h-5 w-5 text-emerald-600 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Health Alerts</p>
                    <p className="text-sm text-gray-500">Disease outbreaks & advisories</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.notificationPreferences.healthAlerts}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      notificationPreferences: {
                        ...prev.notificationPreferences,
                        healthAlerts: e.target.checked,
                      },
                    }))}
                    className="h-5 w-5 text-emerald-600 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Facility Updates</p>
                    <p className="text-sm text-gray-500">Updates from saved facilities</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.notificationPreferences.facilityUpdates}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      notificationPreferences: {
                        ...prev.notificationPreferences,
                        facilityUpdates: e.target.checked,
                      },
                    }))}
                    className="h-5 w-5 text-emerald-600 rounded"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
