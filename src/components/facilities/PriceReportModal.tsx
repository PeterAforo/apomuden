"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, X, Loader2, CheckCircle } from "lucide-react";

interface PriceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilityId: string;
  serviceId: string;
  serviceName: string;
  currentPrice: number;
}

export default function PriceReportModal({
  isOpen,
  onClose,
  facilityId,
  serviceId,
  serviceName,
  currentPrice,
}: PriceReportModalProps) {
  const [reportedPrice, setReportedPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/facilities/${facilityId}/report-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          reportedPrice: parseFloat(reportedPrice),
          description,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setReportedPrice("");
          setDescription("");
        }, 2000);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600">Your report has been submitted successfully.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Report Price Discrepancy</h3>
                <p className="text-sm text-gray-500">Help us keep prices accurate</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-gray-700">Service</Label>
                <p className="font-medium text-gray-900">{serviceName}</p>
                <p className="text-sm text-gray-500">Listed price: GH₵ {currentPrice.toFixed(2)}</p>
              </div>

              <div>
                <Label htmlFor="reportedPrice">Actual Price You Paid (GH₵)</Label>
                <Input
                  id="reportedPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={reportedPrice}
                  onChange={(e) => setReportedPrice(e.target.value)}
                  placeholder="Enter the price you were charged"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Additional Details (Optional)</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any additional information about the price difference..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  rows={3}
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !reportedPrice}
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
