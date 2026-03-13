import type {
  User,
  Facility,
  Service,
  Region,
  District,
  Alert,
  Review,
  EmergencyRequest,
  DiagnosisReport,
} from "@prisma/client";

// Extended types with relations
export type FacilityWithRelations = Facility & {
  region: Region;
  district: District;
  services?: Service[];
  reviews?: Review[];
};

export type ServiceWithFacility = Service & {
  facility: Facility;
};

export type AlertWithCreator = Alert & {
  createdBy: Pick<User, "id" | "name">;
  approvedBy?: Pick<User, "id" | "name"> | null;
};

export type ReviewWithUser = Review & {
  citizen: Pick<User, "id" | "name" | "avatarUrl">;
};

export type EmergencyRequestWithRelations = EmergencyRequest & {
  citizen: Pick<User, "id" | "name" | "phone">;
  assignedFacility?: Facility | null;
};

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Search and filter types
export interface FacilitySearchParams {
  query?: string;
  type?: string;
  tier?: string;
  region?: string;
  district?: string;
  nhisAccepted?: boolean;
  emergencyCapable?: boolean;
  openNow?: boolean;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minRating?: number;
  page?: number;
  pageSize?: number;
  sortBy?: "distance" | "rating" | "name";
  sortOrder?: "asc" | "desc";
}

export interface ServiceSearchParams {
  query?: string;
  category?: string;
  facilityId?: string;
  minPrice?: number;
  maxPrice?: number;
  nhisCovered?: boolean;
  page?: number;
  pageSize?: number;
}

// Form types
export interface FacilityRegistrationForm {
  name: string;
  type: string;
  licenseNumber: string;
  licenseDocument: File;
  address: string;
  latitude: number;
  longitude: number;
  regionId: string;
  districtId: string;
  phone: string;
  email?: string;
  website?: string;
  nhisAccepted: boolean;
  emergencyCapable: boolean;
  ambulanceAvailable: boolean;
  operatingHours: Record<string, { open: string; close: string }>;
  description?: string;
}

export interface CitizenRegistrationForm {
  phone: string;
  name: string;
  email?: string;
  ghanaCardId?: string;
  nhisNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  regionId?: string;
  districtId?: string;
}

export interface EmergencyRequestForm {
  type: string;
  description?: string;
  latitude: number;
  longitude: number;
  callbackPhone: string;
}

// Map types
export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  type: "facility" | "emergency" | "ambulance";
  data: Record<string, unknown>;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Dashboard stats
export interface NationalStats {
  totalFacilities: number;
  pendingApprovals: number;
  activeAlerts: number;
  emergencyRequestsToday: number;
  totalCitizens: number;
  facilitiesByType: Record<string, number>;
  facilitiesByRegion: Record<string, number>;
}

export interface FacilityStats {
  totalServices: number;
  totalReviews: number;
  averageRating: number;
  monthlyViews: number;
  diagnosisReportsSubmitted: number;
}
