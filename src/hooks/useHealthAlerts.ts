"use client";

import { useState, useEffect, useCallback } from "react";
import type { HealthAlert } from "@/components/alerts/HealthAlertPopup";

interface LocationData {
  district: string;
  region: string;
  coordinates: { lat: number; lng: number };
}

// Demo disease data by region/district
const REGIONAL_DISEASES: Record<string, Array<{
  name: string;
  risk: "low" | "medium" | "high";
  prevention: string[];
  symptoms: string[];
}>> = {
  "Greater Accra": [
    {
      name: "Malaria",
      risk: "high",
      prevention: ["Use mosquito nets", "Apply insect repellent", "Eliminate stagnant water"],
      symptoms: ["Fever", "Chills", "Headache", "Body aches"],
    },
    {
      name: "Cholera",
      risk: "medium",
      prevention: ["Drink clean water", "Wash hands frequently", "Cook food thoroughly"],
      symptoms: ["Severe diarrhea", "Vomiting", "Dehydration", "Leg cramps"],
    },
    {
      name: "Typhoid Fever",
      risk: "medium",
      prevention: ["Avoid street food", "Drink bottled water", "Get vaccinated"],
      symptoms: ["High fever", "Weakness", "Stomach pain", "Loss of appetite"],
    },
  ],
  "Ashanti": [
    {
      name: "Malaria",
      risk: "high",
      prevention: ["Sleep under treated nets", "Use repellents", "Clear bushes around homes"],
      symptoms: ["High fever", "Sweating", "Headache", "Nausea"],
    },
    {
      name: "Respiratory Infections",
      risk: "medium",
      prevention: ["Wear masks in crowded areas", "Maintain good ventilation", "Avoid sick contacts"],
      symptoms: ["Cough", "Sore throat", "Runny nose", "Difficulty breathing"],
    },
  ],
  "Western": [
    {
      name: "Malaria",
      risk: "high",
      prevention: ["Use insecticide-treated nets", "Indoor residual spraying", "Prophylaxis for travelers"],
      symptoms: ["Fever", "Chills", "Sweats", "Headache"],
    },
    {
      name: "Cholera",
      risk: "high",
      prevention: ["Boil drinking water", "Proper sanitation", "Hand hygiene"],
      symptoms: ["Watery diarrhea", "Vomiting", "Rapid dehydration"],
    },
  ],
  "default": [
    {
      name: "Malaria",
      risk: "medium",
      prevention: ["Use mosquito nets", "Apply repellent", "Seek early treatment"],
      symptoms: ["Fever", "Chills", "Headache"],
    },
  ],
};

// Demo epidemic/pandemic alerts
const DEMO_ALERTS: HealthAlert[] = [
  {
    id: "epidemic-cholera-2024",
    type: "epidemic",
    severity: "warning",
    title: "Cholera Outbreak Alert",
    message: "An increase in cholera cases has been reported in parts of Greater Accra Region. The Ghana Health Service is monitoring the situation closely.",
    location: "Greater Accra",
    district: "Accra Metropolitan",
    region: "Greater Accra",
    diseases: [{
      name: "Cholera",
      risk: "high",
      prevention: ["Drink only treated or boiled water", "Wash hands with soap", "Avoid raw foods"],
      symptoms: ["Severe watery diarrhea", "Vomiting", "Rapid dehydration", "Muscle cramps"],
    }],
    recommendations: [
      "Drink only boiled or treated water",
      "Wash hands thoroughly before eating and after using the toilet",
      "Avoid eating raw or undercooked seafood",
      "Seek immediate medical attention if you experience symptoms",
      "Report suspected cases to the nearest health facility",
    ],
    source: "Ghana Health Service",
    timestamp: new Date(),
  },
];

// Simulated district detection based on coordinates
function detectDistrict(lat: number, lng: number): LocationData {
  // Greater Accra area
  if (lat >= 5.5 && lat <= 5.7 && lng >= -0.3 && lng <= -0.1) {
    return {
      district: "Accra Metropolitan",
      region: "Greater Accra",
      coordinates: { lat, lng },
    };
  }
  // Kumasi area
  if (lat >= 6.6 && lat <= 6.8 && lng >= -1.7 && lng <= -1.5) {
    return {
      district: "Kumasi Metropolitan",
      region: "Ashanti",
      coordinates: { lat, lng },
    };
  }
  // Takoradi area
  if (lat >= 4.8 && lat <= 5.0 && lng >= -1.8 && lng <= -1.7) {
    return {
      district: "Sekondi-Takoradi",
      region: "Western",
      coordinates: { lat, lng },
    };
  }
  // Default to Accra for demo
  return {
    district: "Accra Metropolitan",
    region: "Greater Accra",
    coordinates: { lat, lng },
  };
}

export function useHealthAlerts() {
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  // Get user location and generate welcome alert
  useEffect(() => {
    const checkShownStatus = localStorage.getItem("health-alerts-shown-today");
    const today = new Date().toDateString();
    
    if (checkShownStatus === today) {
      setHasShownWelcome(true);
      setIsLoading(false);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationData = detectDistrict(latitude, longitude);
          setLocation(locationData);
          
          // Generate welcome alert with local diseases
          const regionalDiseases = REGIONAL_DISEASES[locationData.region] || REGIONAL_DISEASES.default;
          
          const welcomeAlert: HealthAlert = {
            id: `welcome-${Date.now()}`,
            type: "welcome",
            severity: "info",
            title: `Welcome to ${locationData.district}!`,
            message: `You are currently in ${locationData.district}, ${locationData.region} Region. Here are some health advisories for your area. Stay informed and stay healthy!`,
            location: locationData.district,
            district: locationData.district,
            region: locationData.region,
            diseases: regionalDiseases,
            timestamp: new Date(),
          };

          // Check for any active epidemic/pandemic alerts for this region
          const activeAlerts = DEMO_ALERTS.filter(
            alert => alert.region === locationData.region || alert.region === "National"
          );

          setAlerts([welcomeAlert, ...activeAlerts]);
          setIsLoading(false);
          localStorage.setItem("health-alerts-shown-today", today);
        },
        (error) => {
          console.log("[HealthAlerts] Location error:", error);
          // Default to Accra for demo
          const defaultLocation: LocationData = {
            district: "Accra Metropolitan",
            region: "Greater Accra",
            coordinates: { lat: 5.6037, lng: -0.1870 },
          };
          setLocation(defaultLocation);
          
          const regionalDiseases = REGIONAL_DISEASES["Greater Accra"];
          
          const welcomeAlert: HealthAlert = {
            id: `welcome-${Date.now()}`,
            type: "welcome",
            severity: "info",
            title: `Welcome to ${defaultLocation.district}!`,
            message: `You are currently in ${defaultLocation.district}, ${defaultLocation.region} Region. Here are some health advisories for your area. Stay informed and stay healthy!`,
            location: defaultLocation.district,
            district: defaultLocation.district,
            region: defaultLocation.region,
            diseases: regionalDiseases,
            timestamp: new Date(),
          };

          setAlerts([welcomeAlert, ...DEMO_ALERTS]);
          setIsLoading(false);
          localStorage.setItem("health-alerts-shown-today", today);
        }
      );
    } else {
      setIsLoading(false);
    }
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  const dismissAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const addAlert = useCallback((alert: HealthAlert) => {
    setAlerts((prev) => [alert, ...prev]);
  }, []);

  const resetAlerts = useCallback(() => {
    localStorage.removeItem("health-alerts-shown-today");
    setHasShownWelcome(false);
    window.location.reload();
  }, []);

  return {
    alerts,
    location,
    isLoading,
    hasShownWelcome,
    dismissAlert,
    dismissAllAlerts,
    addAlert,
    resetAlerts,
  };
}
