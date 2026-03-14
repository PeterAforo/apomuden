/**
 * NHIS (National Health Insurance Scheme) Integration
 * 
 * This module provides integration with Ghana's NHIA (National Health Insurance Authority)
 * API for verifying member status and coverage.
 * 
 * In production, set NHIS_API_URL and NHIS_API_KEY environment variables.
 * Without these, the module operates in mock mode for development/testing.
 */

export interface NHISMember {
  nhisNumber: string;
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "INVALID";
  memberName: string;
  memberType: "INFORMAL" | "SSNIT" | "EXEMPT" | "INDIGENT";
  expiryDate: string;
  dependents: number;
  coverageLevel: "BASIC" | "PREMIUM";
  region?: string;
  district?: string;
}

export interface NHISVerificationResult {
  success: boolean;
  verified: boolean;
  member?: NHISMember;
  error?: string;
}

export interface NHISCoverageResult {
  success: boolean;
  isCovered: boolean;
  coverageType: "YES" | "PARTIAL" | "NO";
  coveragePercent: number;
  estimatedPatientCost: number;
  error?: string;
}

// Mock data for development
const MOCK_MEMBERS: Record<string, NHISMember> = {
  "GHA-123456789-0": {
    nhisNumber: "GHA-123456789-0",
    status: "ACTIVE",
    memberName: "Kwame Asante",
    memberType: "SSNIT",
    expiryDate: "2025-12-31",
    dependents: 3,
    coverageLevel: "PREMIUM",
    region: "Greater Accra",
    district: "Accra Metropolitan",
  },
  "GHA-987654321-0": {
    nhisNumber: "GHA-987654321-0",
    status: "EXPIRED",
    memberName: "Ama Serwaa",
    memberType: "INFORMAL",
    expiryDate: "2024-06-30",
    dependents: 0,
    coverageLevel: "BASIC",
    region: "Ashanti",
    district: "Kumasi Metropolitan",
  },
  "GHA-111222333-0": {
    nhisNumber: "GHA-111222333-0",
    status: "SUSPENDED",
    memberName: "Kofi Mensah",
    memberType: "INFORMAL",
    expiryDate: "2025-03-15",
    dependents: 2,
    coverageLevel: "BASIC",
    region: "Greater Accra",
    district: "Tema Metropolitan",
  },
};

// NHIS covered services and their coverage percentages
const NHIS_COVERAGE_RATES: Record<string, number> = {
  // Fully covered (100%)
  "outpatient_consultation": 100,
  "inpatient_care": 100,
  "maternity_care": 100,
  "emergency_care": 100,
  "oral_health": 100,
  "eye_care": 100,
  "mental_health": 100,
  
  // Partially covered (70%)
  "laboratory_tests": 70,
  "imaging_xray": 70,
  "imaging_ultrasound": 70,
  "physiotherapy": 70,
  
  // Limited coverage (50%)
  "dental_prosthetics": 50,
  "optical_lenses": 50,
  
  // Not covered (0%)
  "cosmetic_surgery": 0,
  "fertility_treatment": 0,
  "organ_transplant": 0,
};

/**
 * Validate NHIS number format
 * Format: GHA-XXXXXXXXX-X (where X is a digit)
 */
export function validateNHISNumber(nhisNumber: string): boolean {
  const pattern = /^GHA-\d{9}-\d$/;
  return pattern.test(nhisNumber);
}

/**
 * Check if NHIS API is configured for production use
 */
function isProductionMode(): boolean {
  return !!(process.env.NHIS_API_URL && process.env.NHIS_API_KEY);
}

/**
 * Verify NHIS member status
 */
export async function verifyNHISMember(nhisNumber: string): Promise<NHISVerificationResult> {
  // Validate format first
  if (!validateNHISNumber(nhisNumber)) {
    return {
      success: false,
      verified: false,
      error: "Invalid NHIS number format. Expected: GHA-XXXXXXXXX-X",
    };
  }

  // Production mode - call actual NHIA API
  if (isProductionMode()) {
    try {
      const response = await fetch(`${process.env.NHIS_API_URL}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NHIS_API_KEY}`,
          "X-API-Version": "1.0",
        },
        body: JSON.stringify({ nhisNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          verified: false,
          error: errorData.message || `NHIA API error: ${response.status}`,
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        verified: data.status === "ACTIVE",
        member: {
          nhisNumber: data.membershipNumber,
          status: data.status,
          memberName: data.fullName,
          memberType: data.membershipType,
          expiryDate: data.expiryDate,
          dependents: data.numberOfDependents || 0,
          coverageLevel: data.coverageLevel || "BASIC",
          region: data.region,
          district: data.district,
        },
      };
    } catch (error) {
      console.error("NHIA API error:", error);
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : "Failed to connect to NHIA API",
      };
    }
  }

  // Mock mode - use local data
  console.log("[NHIS Mock] Verifying:", nhisNumber);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Check mock data
  const mockMember = MOCK_MEMBERS[nhisNumber];
  
  if (mockMember) {
    return {
      success: true,
      verified: mockMember.status === "ACTIVE",
      member: mockMember,
    };
  }

  // For valid format but unknown number, simulate as new member
  return {
    success: true,
    verified: true,
    member: {
      nhisNumber,
      status: "ACTIVE",
      memberName: "NHIS Member",
      memberType: "INFORMAL",
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      dependents: 0,
      coverageLevel: "BASIC",
    },
  };
}

/**
 * Check NHIS coverage for a specific service
 */
export async function checkServiceCoverage(
  nhisNumber: string,
  serviceCode: string,
  servicePriceGhs: number
): Promise<NHISCoverageResult> {
  // First verify the member is active
  const verification = await verifyNHISMember(nhisNumber);
  
  if (!verification.success || !verification.verified) {
    return {
      success: false,
      isCovered: false,
      coverageType: "NO",
      coveragePercent: 0,
      estimatedPatientCost: servicePriceGhs,
      error: verification.error || "NHIS membership not active",
    };
  }

  // Get coverage rate for service
  const coveragePercent = NHIS_COVERAGE_RATES[serviceCode.toLowerCase()] ?? 0;
  
  let coverageType: "YES" | "PARTIAL" | "NO";
  if (coveragePercent === 100) {
    coverageType = "YES";
  } else if (coveragePercent > 0) {
    coverageType = "PARTIAL";
  } else {
    coverageType = "NO";
  }

  const estimatedPatientCost = servicePriceGhs * (1 - coveragePercent / 100);

  return {
    success: true,
    isCovered: coveragePercent > 0,
    coverageType,
    coveragePercent,
    estimatedPatientCost: Math.round(estimatedPatientCost * 100) / 100,
  };
}

/**
 * Get list of NHIS covered services
 */
export function getNHISCoveredServices(): { code: string; name: string; coverage: number }[] {
  return [
    { code: "outpatient_consultation", name: "Outpatient Consultation", coverage: 100 },
    { code: "inpatient_care", name: "Inpatient Care", coverage: 100 },
    { code: "maternity_care", name: "Maternity Care", coverage: 100 },
    { code: "emergency_care", name: "Emergency Care", coverage: 100 },
    { code: "oral_health", name: "Oral Health Services", coverage: 100 },
    { code: "eye_care", name: "Eye Care Services", coverage: 100 },
    { code: "mental_health", name: "Mental Health Services", coverage: 100 },
    { code: "laboratory_tests", name: "Laboratory Tests", coverage: 70 },
    { code: "imaging_xray", name: "X-Ray Imaging", coverage: 70 },
    { code: "imaging_ultrasound", name: "Ultrasound Imaging", coverage: 70 },
    { code: "physiotherapy", name: "Physiotherapy", coverage: 70 },
    { code: "dental_prosthetics", name: "Dental Prosthetics", coverage: 50 },
    { code: "optical_lenses", name: "Optical Lenses", coverage: 50 },
  ];
}

/**
 * Check if a service is covered by NHIS
 */
export function isServiceCovered(serviceCode: string): boolean {
  return (NHIS_COVERAGE_RATES[serviceCode.toLowerCase()] ?? 0) > 0;
}
