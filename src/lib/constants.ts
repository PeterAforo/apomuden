// Ghana Regions
export const REGIONS = [
  { id: "greater-accra", name: "Greater Accra", code: "GA" },
  { id: "ashanti", name: "Ashanti", code: "AS" },
  { id: "western", name: "Western", code: "WR" },
  { id: "central", name: "Central", code: "CR" },
  { id: "eastern", name: "Eastern", code: "ER" },
  { id: "volta", name: "Volta", code: "VR" },
  { id: "northern", name: "Northern", code: "NR" },
  { id: "upper-east", name: "Upper East", code: "UE" },
  { id: "upper-west", name: "Upper West", code: "UW" },
  { id: "bono", name: "Bono", code: "BO" },
  { id: "bono-east", name: "Bono East", code: "BE" },
  { id: "ahafo", name: "Ahafo", code: "AH" },
  { id: "western-north", name: "Western North", code: "WN" },
  { id: "oti", name: "Oti", code: "OT" },
  { id: "savannah", name: "Savannah", code: "SV" },
  { id: "north-east", name: "North East", code: "NE" },
] as const;

// Facility Types
export const FACILITY_TYPES = [
  { value: "HOSPITAL", label: "Hospital" },
  { value: "CLINIC", label: "Clinic" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "DIAGNOSTIC_CENTRE", label: "Diagnostic Centre" },
  { value: "MATERNITY_HOME", label: "Maternity Home" },
  { value: "CHPS_COMPOUND", label: "CHPS Compound" },
  { value: "POLYCLINIC", label: "Polyclinic" },
  { value: "HEALTH_CENTRE", label: "Health Centre" },
] as const;

// Facility Tiers
export const FACILITY_TIERS = [
  { value: "FIVE_STAR", label: "5 Star", stars: 5 },
  { value: "FOUR_STAR", label: "4 Star", stars: 4 },
  { value: "THREE_STAR", label: "3 Star", stars: 3 },
  { value: "TWO_STAR", label: "2 Star", stars: 2 },
  { value: "ONE_STAR", label: "1 Star", stars: 1 },
] as const;

// Service Categories
export const SERVICE_CATEGORIES = [
  "General Consultation",
  "Emergency Care",
  "Surgery",
  "Maternity & Obstetrics",
  "Paediatrics",
  "Dental Care",
  "Eye Care",
  "Mental Health",
  "Laboratory & Diagnostics",
  "Imaging & Radiology",
  "Pharmacy",
  "Physiotherapy",
  "Dermatology",
  "ENT",
  "Cardiology",
  "Orthopaedics",
  "Immunization",
  "Family Planning",
  "HIV/AIDS Services",
  "Tuberculosis Services",
  "Nutrition Services",
  "Health Education",
] as const;

// Emergency Types
export const EMERGENCY_TYPES = [
  { value: "MEDICAL", label: "Medical Emergency", icon: "heart-pulse" },
  { value: "ACCIDENT", label: "Accident/Trauma", icon: "car" },
  { value: "MATERNITY", label: "Maternity/Childbirth", icon: "baby" },
  { value: "FIRE_BURNS", label: "Fire/Burns", icon: "flame" },
  { value: "OTHER", label: "Other Emergency", icon: "alert-triangle" },
] as const;

// Alert Severities
export const ALERT_SEVERITIES = [
  { value: "INFO", label: "Information", color: "blue" },
  { value: "WARNING", label: "Warning", color: "amber" },
  { value: "CRITICAL", label: "Critical", color: "orange" },
  { value: "EMERGENCY", label: "Emergency", color: "red" },
] as const;

// Common Diseases in Ghana (for diagnosis reporting)
export const COMMON_DISEASES = [
  { code: "B54", name: "Malaria" },
  { code: "J06.9", name: "Upper Respiratory Tract Infection" },
  { code: "A09", name: "Diarrhoeal diseases" },
  { code: "L30.9", name: "Skin diseases" },
  { code: "I10", name: "Hypertension" },
  { code: "E11", name: "Diabetes" },
  { code: "A01.0", name: "Typhoid fever" },
  { code: "N39.0", name: "Urinary Tract Infection" },
  { code: "D64.9", name: "Anaemia" },
  { code: "M79.0", name: "Rheumatism" },
  { code: "J18.9", name: "Pneumonia" },
  { code: "B20", name: "HIV/AIDS" },
  { code: "A15", name: "Tuberculosis" },
  { code: "A00", name: "Cholera" },
  { code: "A39", name: "Meningitis" },
  { code: "B72", name: "Guinea Worm Disease" },
  { code: "B65", name: "Bilharzia" },
  { code: "B18.1", name: "Hepatitis B" },
] as const;

// Days of the week
export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

// Default operating hours
export const DEFAULT_OPERATING_HOURS = {
  monday: { open: "08:00", close: "17:00" },
  tuesday: { open: "08:00", close: "17:00" },
  wednesday: { open: "08:00", close: "17:00" },
  thursday: { open: "08:00", close: "17:00" },
  friday: { open: "08:00", close: "17:00" },
  saturday: { open: "09:00", close: "13:00" },
  sunday: { open: "", close: "" },
};

// Map defaults (centered on Ghana)
export const MAP_DEFAULTS = {
  center: { lat: 7.9465, lng: -1.0232 },
  zoom: 7,
  style: "mapbox://styles/mapbox/streets-v12",
};

// Pagination defaults
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
};

// File upload limits
export const FILE_LIMITS = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
  allowedDocumentTypes: ["application/pdf", "image/jpeg", "image/png"],
};
