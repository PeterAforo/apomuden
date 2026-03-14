"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  Plus, 
  Send, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  Loader2,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  Users
} from "lucide-react";

interface Alert {
  id: string;
  title: string;
  body: string;
  severity: "INFO" | "WARNING" | "CRITICAL" | "EMERGENCY";
  scope: "NATIONAL" | "REGIONAL" | "DISTRICT";
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "SENT" | "EXPIRED";
  smsMessage: string | null;
  createdAt: string;
  sentAt: string | null;
}

const SEVERITY_CONFIG = {
  INFO: { color: "bg-blue-100 text-blue-800", icon: Info },
  WARNING: { color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
  CRITICAL: { color: "bg-orange-100 text-orange-800", icon: AlertCircle },
  EMERGENCY: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
};

export default function AlertManagementPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [newAlert, setNewAlert] = useState({
    title: "",
    body: "",
    severity: "INFO" as "INFO" | "WARNING" | "CRITICAL" | "EMERGENCY",
    scope: "NATIONAL" as "NATIONAL" | "REGIONAL" | "DISTRICT",
    precautions: "",
    smsMessage: "",
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/admin/alerts");
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlert),
      });

      if (response.ok) {
        setSuccess("Alert created successfully");
        setShowCreateForm(false);
        setNewAlert({
          title: "",
          body: "",
          severity: "INFO",
          scope: "NATIONAL",
          precautions: "",
          smsMessage: "",
        });
        fetchAlerts();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create alert");
      }
    } catch (err) {
      setError("Failed to create alert");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBroadcast = async (alertId: string) => {
    try {
      const response = await fetch(`/api/admin/alerts/${alertId}/broadcast`, {
        method: "POST",
      });

      if (response.ok) {
        setSuccess("Alert broadcast initiated");
        fetchAlerts();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error broadcasting alert:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Alert Management</h1>
                <p className="text-red-100 mt-1">Create and broadcast health alerts</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-white text-red-600 hover:bg-red-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
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

        {/* Create Alert Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateForm(false)} />
            <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-auto">
              <CardHeader>
                <CardTitle>Create New Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAlert} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Alert Title</Label>
                    <Input
                      id="title"
                      value={newAlert.title}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Cholera Outbreak Warning"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="severity">Severity</Label>
                      <select
                        id="severity"
                        value={newAlert.severity}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, severity: e.target.value as typeof newAlert.severity }))}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="INFO">Info</option>
                        <option value="WARNING">Warning</option>
                        <option value="CRITICAL">Critical</option>
                        <option value="EMERGENCY">Emergency</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="scope">Scope</Label>
                      <select
                        id="scope"
                        value={newAlert.scope}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, scope: e.target.value as typeof newAlert.scope }))}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="NATIONAL">National</option>
                        <option value="REGIONAL">Regional</option>
                        <option value="DISTRICT">District</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="body">Alert Message</Label>
                    <textarea
                      id="body"
                      value={newAlert.body}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, body: e.target.value }))}
                      placeholder="Detailed alert message..."
                      rows={4}
                      className="w-full px-3 py-2 border rounded-md resize-none"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="precautions">Precautions (Optional)</Label>
                    <textarea
                      id="precautions"
                      value={newAlert.precautions}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, precautions: e.target.value }))}
                      placeholder="Recommended precautions..."
                      rows={3}
                      className="w-full px-3 py-2 border rounded-md resize-none"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sms">SMS Message (160 chars max)</Label>
                    <textarea
                      id="sms"
                      value={newAlert.smsMessage}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, smsMessage: e.target.value.slice(0, 160) }))}
                      placeholder="Short SMS version..."
                      rows={2}
                      maxLength={160}
                      className="w-full px-3 py-2 border rounded-md resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">{newAlert.smsMessage.length}/160 characters</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-1 bg-red-600 hover:bg-red-700">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Alert"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alerts List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : alerts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No alerts yet</h2>
              <p className="text-gray-500">Create your first health alert to notify citizens</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const SeverityIcon = SEVERITY_CONFIG[alert.severity].icon;
              return (
                <Card key={alert.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${SEVERITY_CONFIG[alert.severity].color}`}>
                            <SeverityIcon className="h-4 w-4 inline mr-1" />
                            {alert.severity}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            {alert.scope}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            alert.status === "SENT" ? "bg-green-100 text-green-700" :
                            alert.status === "DRAFT" ? "bg-gray-100 text-gray-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {alert.status === "SENT" ? <CheckCircle className="h-4 w-4 inline mr-1" /> : <Clock className="h-4 w-4 inline mr-1" />}
                            {alert.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                        <p className="text-gray-600 mt-1 line-clamp-2">{alert.body}</p>
                        <p className="text-sm text-gray-400 mt-2" suppressHydrationWarning>
                          Created: {new Date(alert.createdAt).toLocaleDateString('en-GB')}
                          {alert.sentAt && ` • Sent: ${new Date(alert.sentAt).toLocaleDateString('en-GB')}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {alert.status === "DRAFT" && (
                          <Button
                            onClick={() => handleBroadcast(alert.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Broadcast
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
