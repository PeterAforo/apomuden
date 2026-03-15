"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, X, MapPin, Shield, Activity, Bell,
  Volume2, VolumeX, ChevronRight, Info, Thermometer,
  Bug, Heart, Droplets, Wind, Sun, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HealthAlert {
  id: string;
  type: "welcome" | "disease" | "epidemic" | "pandemic" | "ministry";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  location?: string;
  district?: string;
  region?: string;
  diseases?: Array<{
    name: string;
    risk: "low" | "medium" | "high";
    prevention: string[];
    symptoms: string[];
  }>;
  recommendations?: string[];
  source?: string;
  timestamp: Date;
  expiresAt?: Date;
}

interface HealthAlertPopupProps {
  alerts: HealthAlert[];
  onDismiss: (alertId: string) => void;
  onDismissAll: () => void;
}

const SEVERITY_CONFIG = {
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Info,
    iconColor: "text-blue-600",
    headerBg: "bg-blue-600",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    headerBg: "bg-amber-600",
  },
  critical: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: AlertCircle,
    iconColor: "text-red-600",
    headerBg: "bg-red-600",
  },
};

const RISK_COLORS = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

const DISEASE_ICONS: Record<string, React.ElementType> = {
  Malaria: Bug,
  Cholera: Droplets,
  "Typhoid Fever": Thermometer,
  "COVID-19": Shield,
  "Respiratory Infections": Wind,
  "Heat Stroke": Sun,
  default: Activity,
};

export function HealthAlertPopup({ alerts, onDismiss, onDismissAll }: HealthAlertPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentAlert = alerts[currentIndex];

  // Play alert sound
  const playAlertSound = useCallback(() => {
    if (isMuted || hasPlayedSound) return;
    
    try {
      // Create audio context for alert sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Alert sound pattern
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
      oscillator.frequency.setValueAtTime(988, audioContext.currentTime + 0.1); // B5
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2); // A5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      setHasPlayedSound(true);
    } catch (error) {
      console.log("[Alert] Could not play sound:", error);
    }
  }, [isMuted, hasPlayedSound]);

  useEffect(() => {
    if (alerts.length > 0 && !hasPlayedSound) {
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        playAlertSound();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [alerts, playAlertSound, hasPlayedSound]);

  // Reset sound played state when alerts change
  useEffect(() => {
    if (alerts.length === 0) {
      setHasPlayedSound(false);
    }
  }, [alerts.length]);

  if (!currentAlert || alerts.length === 0) return null;

  const config = SEVERITY_CONFIG[currentAlert.severity];
  const IconComponent = config.icon;

  const handleNext = () => {
    if (currentIndex < alerts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDismiss = () => {
    onDismiss(currentAlert.id);
    if (currentIndex >= alerts.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`w-full max-w-lg ${config.bg} ${config.border} border-2 rounded-2xl shadow-2xl overflow-hidden`}
        >
          {/* Header */}
          <div className={`${config.headerBg} text-white px-4 py-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{currentAlert.title}</h3>
                  {currentAlert.location && (
                    <p className="text-sm text-white/80 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {currentAlert.district}, {currentAlert.region}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {/* Welcome Message */}
            {currentAlert.type === "welcome" && (
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">{currentAlert.message}</p>
                
                {currentAlert.diseases && currentAlert.diseases.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Common Diseases in Your Area
                    </h4>
                    <div className="space-y-3">
                      {currentAlert.diseases.map((disease, idx) => {
                        const DiseaseIcon = DISEASE_ICONS[disease.name] || DISEASE_ICONS.default;
                        return (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <DiseaseIcon className="w-4 h-4 text-gray-600" />
                                <span className="font-medium text-gray-900">{disease.name}</span>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${RISK_COLORS[disease.risk]}`}>
                                {disease.risk.toUpperCase()} RISK
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p className="mb-1"><strong>Symptoms:</strong> {disease.symptoms.join(", ")}</p>
                              <p><strong>Prevention:</strong> {disease.prevention.join(", ")}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Epidemic/Pandemic Alert */}
            {(currentAlert.type === "epidemic" || currentAlert.type === "pandemic") && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${currentAlert.type === "pandemic" ? "bg-red-100" : "bg-amber-100"}`}>
                  <p className="text-gray-800 font-medium">{currentAlert.message}</p>
                </div>

                {currentAlert.diseases && currentAlert.diseases[0] && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {currentAlert.diseases[0].name}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-500 font-medium">Symptoms to watch for:</p>
                        <ul className="list-disc list-inside text-gray-700">
                          {currentAlert.diseases[0].symptoms.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {currentAlert.recommendations && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Recommended Actions
                    </h4>
                    <ul className="space-y-2">
                      {currentAlert.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <ChevronRight className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentAlert.source && (
                  <p className="text-xs text-gray-500 mt-4">
                    Source: {currentAlert.source}
                  </p>
                )}
              </div>
            )}

            {/* Ministry Alert */}
            {currentAlert.type === "ministry" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <Shield className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="font-medium text-emerald-800">Official Ministry of Health Notice</p>
                    <p className="text-sm text-emerald-600">Ghana Health Service</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{currentAlert.message}</p>
                
                {currentAlert.recommendations && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Guidelines:</h4>
                    <ul className="space-y-1">
                      {currentAlert.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-emerald-600">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {/* Pagination */}
              {alerts.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <span className="text-sm text-gray-600">
                    {currentIndex + 1} of {alerts.length}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === alerts.length - 1}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                {alerts.length > 1 && (
                  <Button variant="outline" size="sm" onClick={onDismissAll}>
                    Dismiss All
                  </Button>
                )}
                <Button size="sm" onClick={handleDismiss} className="bg-emerald-600 hover:bg-emerald-700">
                  Got It
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
