import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      licenseNumber,
      address,
      region,
      district,
      phone,
      email,
      website,
      description,
      nhisAccepted,
      emergencyCapable,
      ambulanceAvailable,
      bedCount,
      adminName,
      adminPhone,
      adminEmail,
    } = body;

    // Validate required fields
    if (!name || !type || !licenseNumber || !address || !region || !district || !phone) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if license number already exists
    const existingFacility = await db.facility.findUnique({
      where: { licenseNumber },
    });

    if (existingFacility) {
      return NextResponse.json(
        { success: false, error: "A facility with this license number already exists" },
        { status: 400 }
      );
    }

    // Get region ID
    const regionRecord = await db.region.findUnique({
      where: { code: region },
    });

    if (!regionRecord) {
      return NextResponse.json(
        { success: false, error: "Invalid region" },
        { status: 400 }
      );
    }

    // Find or create district
    let districtRecord = await db.district.findFirst({
      where: { regionId: regionRecord.id, name: district },
    });

    if (!districtRecord) {
      districtRecord = await db.district.create({
        data: { name: district, regionId: regionRecord.id },
      });
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create facility with PENDING status
    const facility = await db.facility.create({
      data: {
        name,
        slug: `${slug}-${Date.now().toString(36)}`,
        type,
        licenseNumber,
        licenseDocumentUrl: "/licenses/pending.pdf",
        status: "PENDING",
        address,
        latitude: 5.6037, // Default to Accra, will be updated during verification
        longitude: -0.187,
        regionId: regionRecord.id,
        districtId: districtRecord.id,
        phone,
        email: email || null,
        website: website || null,
        description: description || null,
        nhisAccepted: nhisAccepted || false,
        emergencyCapable: emergencyCapable || false,
        ambulanceAvailable: ambulanceAvailable || false,
        bedCount: bedCount ? parseInt(bedCount) : null,
      },
    });

    // In production, we would also:
    // 1. Create admin user account
    // 2. Send verification email
    // 3. Create audit log entry

    return NextResponse.json({
      success: true,
      data: {
        id: facility.id,
        name: facility.name,
        status: facility.status,
      },
      message: "Facility registration submitted successfully",
    });
  } catch (error) {
    console.error("Error registering facility:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register facility" },
      { status: 500 }
    );
  }
}
