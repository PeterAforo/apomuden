import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Role hierarchy - higher roles have access to lower role permissions
export const ROLE_HIERARCHY = {
  SUPER_ADMIN: 100,
  MINISTRY_ADMIN: 90,
  REGIONAL_DIRECTOR: 80,
  DISTRICT_OFFICER: 70,
  ANALYST: 60,
  FACILITY_ADMIN: 50,
  FACILITY_STAFF: 40,
  FACILITY_VIEWER: 30,
  CITIZEN: 20,
  GUEST: 10,
} as const;

export type UserRole = keyof typeof ROLE_HIERARCHY;

// Permission definitions
export const PERMISSIONS = {
  // Admin permissions
  ADMIN_DASHBOARD: ["SUPER_ADMIN", "MINISTRY_ADMIN", "REGIONAL_DIRECTOR", "DISTRICT_OFFICER", "ANALYST"],
  MANAGE_FACILITIES: ["SUPER_ADMIN", "MINISTRY_ADMIN", "REGIONAL_DIRECTOR", "DISTRICT_OFFICER"],
  APPROVE_FACILITIES: ["SUPER_ADMIN", "MINISTRY_ADMIN", "REGIONAL_DIRECTOR"],
  MANAGE_ALERTS: ["SUPER_ADMIN", "MINISTRY_ADMIN", "REGIONAL_DIRECTOR"],
  BROADCAST_ALERTS: ["SUPER_ADMIN", "MINISTRY_ADMIN"],
  VIEW_ANALYTICS: ["SUPER_ADMIN", "MINISTRY_ADMIN", "REGIONAL_DIRECTOR", "DISTRICT_OFFICER", "ANALYST"],
  VIEW_AUDIT_LOGS: ["SUPER_ADMIN", "MINISTRY_ADMIN"],
  EXPORT_DATA: ["SUPER_ADMIN", "MINISTRY_ADMIN", "ANALYST"],
  SEED_DATA: ["SUPER_ADMIN"],
  
  // Facility admin permissions
  MANAGE_OWN_FACILITY: ["SUPER_ADMIN", "MINISTRY_ADMIN", "FACILITY_ADMIN"],
  MANAGE_FACILITY_STAFF: ["SUPER_ADMIN", "MINISTRY_ADMIN", "FACILITY_ADMIN"],
  MANAGE_AMBULANCES: ["SUPER_ADMIN", "MINISTRY_ADMIN", "FACILITY_ADMIN", "FACILITY_STAFF"],
  RESPOND_EMERGENCIES: ["SUPER_ADMIN", "MINISTRY_ADMIN", "FACILITY_ADMIN", "FACILITY_STAFF"],
  SUBMIT_DIAGNOSIS: ["SUPER_ADMIN", "MINISTRY_ADMIN", "FACILITY_ADMIN", "FACILITY_STAFF"],
  
  // Citizen permissions
  CREATE_EMERGENCY: ["SUPER_ADMIN", "MINISTRY_ADMIN", "CITIZEN"],
  SUBMIT_REVIEW: ["SUPER_ADMIN", "MINISTRY_ADMIN", "CITIZEN"],
  BOOK_APPOINTMENT: ["SUPER_ADMIN", "MINISTRY_ADMIN", "CITIZEN"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly string[];
  return allowedRoles.includes(role);
}

/**
 * Check if a role meets minimum role requirement
 */
export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Get user with role from session
 */
export async function getUserWithRole(request?: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      regionId: true,
      districtId: true,
    },
  });

  return user;
}

/**
 * Require authentication middleware
 */
export async function requireAuth(): Promise<{
  authorized: boolean;
  user: Awaited<ReturnType<typeof getUserWithRole>>;
  response?: NextResponse;
}> {
  const user = await getUserWithRole();

  if (!user) {
    return {
      authorized: false,
      user: null,
      response: NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  return { authorized: true, user };
}

/**
 * Require specific permission middleware
 */
export async function requirePermission(permission: Permission): Promise<{
  authorized: boolean;
  user: Awaited<ReturnType<typeof getUserWithRole>>;
  response?: NextResponse;
}> {
  const { authorized, user, response } = await requireAuth();

  if (!authorized || !user) {
    return { authorized: false, user: null, response };
  }

  if (!hasPermission(user.role as UserRole, permission)) {
    return {
      authorized: false,
      user,
      response: NextResponse.json(
        { success: false, message: "Insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user };
}

/**
 * Require minimum role middleware
 */
export async function requireRole(minimumRole: UserRole): Promise<{
  authorized: boolean;
  user: Awaited<ReturnType<typeof getUserWithRole>>;
  response?: NextResponse;
}> {
  const { authorized, user, response } = await requireAuth();

  if (!authorized || !user) {
    return { authorized: false, user: null, response };
  }

  if (!hasMinimumRole(user.role as UserRole, minimumRole)) {
    return {
      authorized: false,
      user,
      response: NextResponse.json(
        { success: false, message: "Insufficient role privileges" },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user };
}

/**
 * Check if user can access facility
 */
export async function canAccessFacility(
  userId: string,
  facilityId: string
): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      facilityStaff: {
        where: { facilityId, isActive: true },
      },
    },
  });

  if (!user) return false;

  // Super admins and ministry admins can access all facilities
  if (["SUPER_ADMIN", "MINISTRY_ADMIN"].includes(user.role)) {
    return true;
  }

  // Regional directors can access facilities in their region
  if (user.role === "REGIONAL_DIRECTOR" && user.regionId) {
    const facility = await db.facility.findUnique({
      where: { id: facilityId },
      select: { regionId: true },
    });
    return facility?.regionId === user.regionId;
  }

  // District officers can access facilities in their district
  if (user.role === "DISTRICT_OFFICER" && user.districtId) {
    const facility = await db.facility.findUnique({
      where: { id: facilityId },
      select: { districtId: true },
    });
    return facility?.districtId === user.districtId;
  }

  // Facility staff can access their assigned facility
  return user.facilityStaff.length > 0;
}
