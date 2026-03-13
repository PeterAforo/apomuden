"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Stethoscope, 
  Send, 
  Loader2, 
  AlertTriangle,
  CheckCircle,
  MapPin,
  Phone,
  ArrowRight,
  RefreshCw,
  Info
} from "lucide-react";

interface SymptomResult {
  possibleConditions: {
    name: string;
    probability: "HIGH" | "MEDIUM" | "LOW";
    description: string;
  }[];
  urgencyLevel: "LOW" | "MODERATE" | "HIGH" | "EMERGENCY";
  recommendations: string[];
  firstAid: string[];
  suggestedFacilityTypes: string[];
  disclaimer: string;
}

interface RecommendedFacility {
  id: string;
  name: string;
  slug: string;
  type: string;
  distance: number;
  phone: string;
  emergencyCapable: boolean;
}

const URGENCY_CONFIG = {
  LOW: { color: "bg-green-100 text-green-800 border-green-200", label: "Low Urgency" },
  MODERATE: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Moderate Urgency" },
  HIGH: { color: "bg-orange-100 text-orange-800 border-orange-200", label: "High Urgency" },
  EMERGENCY: { color: "bg-red-100 text-red-800 border-red-200", label: "Emergency - Seek Immediate Care" },
};

const PROBABILITY_COLORS = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-gray-100 text-gray-700",
};

export default function SymptomCheckerPage() {
  const { status } = useSession();
  const router = useRouter();
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [facilities, setFacilities] = useState<RecommendedFacility[]>([]);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/ai/symptom-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms, duration, severity }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.analysis);
        setFacilities(data.recommendedFacilities || []);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to analyze symptoms");
      }
    } catch (err) {
      setError("Failed to connect to the symptom checker");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSymptoms("");
    setDuration("");
    setSeverity("moderate");
    setResult(null);
    setFacilities([]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-8 w-8" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">AI Symptom Checker</h1>
              <p className="text-teal-100 mt-1">Get preliminary health guidance based on your symptoms</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Disclaimer Banner */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Important Disclaimer</p>
            <p>This tool provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-2">
            {!result ? (
              <Card>
                <CardHeader>
                  <CardTitle>Describe Your Symptoms</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAnalyze} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What symptoms are you experiencing?
                      </label>
                      <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Describe your symptoms in detail. For example: 'I have a headache, fever, and body aches that started yesterday. I also feel very tired and have a sore throat.'"
                        rows={5}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          How long have you had these symptoms?
                        </label>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg"
                        >
                          <option value="">Select duration</option>
                          <option value="hours">Less than 24 hours</option>
                          <option value="1-3days">1-3 days</option>
                          <option value="4-7days">4-7 days</option>
                          <option value="1-2weeks">1-2 weeks</option>
                          <option value="2+weeks">More than 2 weeks</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          How severe are your symptoms?
                        </label>
                        <select
                          value={severity}
                          onChange={(e) => setSeverity(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg"
                        >
                          <option value="mild">Mild - Manageable</option>
                          <option value="moderate">Moderate - Uncomfortable</option>
                          <option value="severe">Severe - Very difficult</option>
                        </select>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isAnalyzing || !symptoms.trim()}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Analyzing Symptoms...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Analyze Symptoms
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Urgency Level */}
                <Card className={`border-2 ${URGENCY_CONFIG[result.urgencyLevel].color}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium opacity-75">Urgency Assessment</p>
                        <p className="text-2xl font-bold">{URGENCY_CONFIG[result.urgencyLevel].label}</p>
                      </div>
                      {result.urgencyLevel === "EMERGENCY" && (
                        <Link href="/emergency">
                          <Button className="bg-red-600 hover:bg-red-700">
                            <Phone className="h-4 w-4 mr-2" />
                            Emergency Help
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Possible Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Possible Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.possibleConditions.map((condition, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{condition.name}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${PROBABILITY_COLORS[condition.probability]}`}>
                              {condition.probability} likelihood
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{condition.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-teal-600" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ArrowRight className="h-4 w-4 text-teal-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* First Aid */}
                {result.firstAid.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        First Aid Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.firstAid.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                              {index + 1}
                            </span>
                            <span className="text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Reset Button */}
                <Button onClick={handleReset} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check New Symptoms
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar - Recommended Facilities */}
          <div className="space-y-6">
            {result && facilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-teal-600" />
                    Recommended Facilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {facilities.map((facility) => (
                      <div key={facility.id} className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">{facility.name}</h4>
                        <p className="text-sm text-teal-600">{facility.type.replace("_", " ")}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-500">{facility.distance.toFixed(1)} km away</span>
                          {facility.emergencyCapable && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Emergency</span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <a href={`tel:${facility.phone}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                          </a>
                          <Link href={`/facilities/${facility.slug}`} className="flex-1">
                            <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/emergency" className="block">
                  <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                    <Phone className="h-4 w-4 mr-2" />
                    Emergency Services
                  </Button>
                </Link>
                <Link href="/facilities" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    Find Nearby Facilities
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
