"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Search, 
  Plus, 
  Loader2, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

const COMMON_DISEASES = [
  { code: "B54", name: "Malaria" },
  { code: "J06.9", name: "Upper Respiratory Tract Infection" },
  { code: "A09", name: "Diarrhoeal diseases" },
  { code: "L30.9", name: "Skin diseases" },
  { code: "I10", name: "Hypertension" },
  { code: "E11", name: "Type 2 Diabetes" },
  { code: "A01.0", name: "Typhoid fever" },
  { code: "N39.0", name: "Urinary Tract Infection" },
  { code: "D64.9", name: "Anaemia" },
  { code: "J18.9", name: "Pneumonia" },
  { code: "B20", name: "HIV/AIDS" },
  { code: "A15", name: "Tuberculosis" },
  { code: "A00", name: "Cholera" },
  { code: "A39", name: "Meningitis" },
];

const AGE_GROUPS = ["0-4", "5-14", "15-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const SEVERITY_LEVELS = ["mild", "moderate", "severe", "critical"];
const OUTCOMES = ["recovered", "admitted", "referred", "deceased"];

interface DiagnosisEntry {
  diseaseCode: string;
  diseaseName: string;
  caseCount: number;
  demographics: Record<string, number>;
  genderBreakdown: { male: number; female: number };
  severity: Record<string, number>;
  outcomes: Record<string, number>;
}

export default function DiagnosisReportsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [report, setReport] = useState<DiagnosisEntry>({
    diseaseCode: "",
    diseaseName: "",
    caseCount: 0,
    demographics: Object.fromEntries(AGE_GROUPS.map(g => [g, 0])),
    genderBreakdown: { male: 0, female: 0 },
    severity: Object.fromEntries(SEVERITY_LEVELS.map(s => [s, 0])),
    outcomes: Object.fromEntries(OUTCOMES.map(o => [o, 0])),
  });

  const [periodType, setPeriodType] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("WEEKLY");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const filteredDiseases = COMMON_DISEASES.filter(
    d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectDisease = (code: string, name: string) => {
    setReport(prev => ({ ...prev, diseaseCode: code, diseaseName: name }));
    setSearchTerm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/diagnosis-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...report,
          periodType,
          periodStart,
          periodEnd,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        // Reset form
        setReport({
          diseaseCode: "",
          diseaseName: "",
          caseCount: 0,
          demographics: Object.fromEntries(AGE_GROUPS.map(g => [g, 0])),
          genderBreakdown: { male: 0, female: 0 },
          severity: Object.fromEntries(SEVERITY_LEVELS.map(s => [s, 0])),
          outcomes: Object.fromEntries(OUTCOMES.map(o => [o, 0])),
        });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to submit report");
      }
    } catch (err) {
      setError("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Diagnosis Reporting</h1>
              <p className="text-blue-100 mt-1">Submit disease surveillance data</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Report submitted successfully!
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Disease Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Disease Information</CardTitle>
                  <CardDescription>Select the disease and enter case count</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Label>Search Disease (ICD-10)</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by disease name or ICD-10 code..."
                        className="pl-10"
                      />
                    </div>
                    {searchTerm && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredDiseases.map((disease) => (
                          <button
                            key={disease.code}
                            type="button"
                            onClick={() => selectDisease(disease.code, disease.name)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between"
                          >
                            <span>{disease.name}</span>
                            <span className="text-gray-500 text-sm">{disease.code}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {report.diseaseCode && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-900">{report.diseaseName}</p>
                      <p className="text-sm text-blue-700">ICD-10: {report.diseaseCode}</p>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="caseCount">Total Case Count</Label>
                    <Input
                      id="caseCount"
                      type="number"
                      min="0"
                      value={report.caseCount}
                      onChange={(e) => setReport(prev => ({ ...prev, caseCount: parseInt(e.target.value) || 0 }))}
                      className="max-w-xs"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Demographics */}
              <Card>
                <CardHeader>
                  <CardTitle>Demographics Breakdown</CardTitle>
                  <CardDescription>Cases by age group and gender</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-3 block">Age Groups</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {AGE_GROUPS.map((group) => (
                        <div key={group}>
                          <Label className="text-xs text-gray-500">{group}</Label>
                          <Input
                            type="number"
                            min="0"
                            value={report.demographics[group]}
                            onChange={(e) => setReport(prev => ({
                              ...prev,
                              demographics: {
                                ...prev.demographics,
                                [group]: parseInt(e.target.value) || 0,
                              },
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Gender</Label>
                    <div className="grid grid-cols-2 gap-3 max-w-xs">
                      <div>
                        <Label className="text-xs text-gray-500">Male</Label>
                        <Input
                          type="number"
                          min="0"
                          value={report.genderBreakdown.male}
                          onChange={(e) => setReport(prev => ({
                            ...prev,
                            genderBreakdown: {
                              ...prev.genderBreakdown,
                              male: parseInt(e.target.value) || 0,
                            },
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Female</Label>
                        <Input
                          type="number"
                          min="0"
                          value={report.genderBreakdown.female}
                          onChange={(e) => setReport(prev => ({
                            ...prev,
                            genderBreakdown: {
                              ...prev.genderBreakdown,
                              female: parseInt(e.target.value) || 0,
                            },
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Severity & Outcomes */}
              <Card>
                <CardHeader>
                  <CardTitle>Severity & Outcomes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-3 block">Severity Distribution</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {SEVERITY_LEVELS.map((level) => (
                        <div key={level}>
                          <Label className="text-xs text-gray-500 capitalize">{level}</Label>
                          <Input
                            type="number"
                            min="0"
                            value={report.severity[level]}
                            onChange={(e) => setReport(prev => ({
                              ...prev,
                              severity: {
                                ...prev.severity,
                                [level]: parseInt(e.target.value) || 0,
                              },
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Outcomes</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {OUTCOMES.map((outcome) => (
                        <div key={outcome}>
                          <Label className="text-xs text-gray-500 capitalize">{outcome}</Label>
                          <Input
                            type="number"
                            min="0"
                            value={report.outcomes[outcome]}
                            onChange={(e) => setReport(prev => ({
                              ...prev,
                              outcomes: {
                                ...prev.outcomes,
                                [outcome]: parseInt(e.target.value) || 0,
                              },
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Reporting Period */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Reporting Period
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Period Type</Label>
                    <select
                      value={periodType}
                      onChange={(e) => setPeriodType(e.target.value as "DAILY" | "WEEKLY" | "MONTHLY")}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting || !report.diseaseCode || !periodStart || !periodEnd}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>

              {/* Recent Submissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent submissions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
