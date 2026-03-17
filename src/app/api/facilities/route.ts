import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Mock facilities data for fallback when database is unavailable
const MOCK_FACILITIES = [
  {
    id: "mock-1",
    name: "Korle Bu Teaching Hospital",
    type: "HOSPITAL",
    tier: "TERTIARY",
    address: "Guggisberg Avenue, Accra",
    phone: "+233 30 267 0411",
    email: "info@kfrth.org",
    latitude: 5.5347,
    longitude: -0.2275,
    nhisAccepted: true,
    emergencyCapable: true,
    icuBeds: 50,
    averageRating: 4.5,
    totalReviews: 1250,
    photos: ["/img/001.jpg"],
    region: { name: "Greater Accra", code: "GAR" },
    district: { name: "Accra Metropolitan" },
    status: "APPROVED",
  },
  {
    id: "mock-2",
    name: "Ridge Hospital",
    type: "HOSPITAL",
    tier: "TERTIARY",
    address: "Castle Road, Ridge, Accra",
    phone: "+233 30 222 6969",
    email: "info@ridgehospital.gov.gh",
    latitude: 5.5600,
    longitude: -0.2050,
    nhisAccepted: true,
    emergencyCapable: true,
    icuBeds: 30,
    averageRating: 4.3,
    totalReviews: 890,
    photos: ["/img/002.jpg"],
    region: { name: "Greater Accra", code: "GAR" },
    district: { name: "Accra Metropolitan" },
    status: "APPROVED",
  },
  {
    id: "mock-3",
    name: "37 Military Hospital",
    type: "HOSPITAL",
    tier: "TERTIARY",
    address: "Liberation Road, Accra",
    phone: "+233 30 277 6111",
    email: "info@37milhosp.mil.gh",
    latitude: 5.5970,
    longitude: -0.1870,
    nhisAccepted: true,
    emergencyCapable: true,
    icuBeds: 45,
    averageRating: 4.6,
    totalReviews: 1100,
    photos: ["/img/005.jpg"],
    region: { name: "Greater Accra", code: "GAR" },
    district: { name: "Accra Metropolitan" },
    status: "APPROVED",
  },
  {
    id: "mock-4",
    name: "Trust Hospital",
    type: "HOSPITAL",
    tier: "SECONDARY",
    address: "Osu, Accra",
    phone: "+233 30 276 1974",
    email: "info@trusthospital.com.gh",
    latitude: 5.5550,
    longitude: -0.1850,
    nhisAccepted: true,
    emergencyCapable: true,
    icuBeds: 15,
    averageRating: 4.4,
    totalReviews: 650,
    photos: ["/img/003.jpg"],
    region: { name: "Greater Accra", code: "GAR" },
    district: { name: "Osu Klottey" },
    status: "APPROVED",
  },
  {
    id: "mock-5",
    name: "Nyaho Medical Centre",
    type: "HOSPITAL",
    tier: "SECONDARY",
    address: "Airport Residential Area, Accra",
    phone: "+233 30 277 5341",
    email: "info@nyahomedical.com",
    latitude: 5.6050,
    longitude: -0.1750,
    nhisAccepted: false,
    emergencyCapable: true,
    icuBeds: 10,
    averageRating: 4.7,
    totalReviews: 520,
    photos: ["/img/004.jpg"],
    region: { name: "Greater Accra", code: "GAR" },
    district: { name: "Ayawaso West" },
    status: "APPROVED",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get("query") || "";
    const type = searchParams.get("type") || "";
    const region = searchParams.get("region") || "";
    const nhisOnly = searchParams.get("nhis") === "true";
    const emergencyOnly = searchParams.get("emergency") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    // Try database first
    try {
      const where: any = {
        status: "APPROVED",
      };

      if (query) {
        where.OR = [
          { name: { contains: query, mode: "insensitive" } },
          { address: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ];
      }

      if (type) {
        where.type = type;
      }

      if (region) {
        where.region = { code: region };
      }

      if (nhisOnly) {
        where.nhisAccepted = true;
      }

      if (emergencyOnly) {
        where.emergencyCapable = true;
      }

      const [facilities, total] = await Promise.all([
        db.facility.findMany({
          where,
          include: {
            region: true,
            district: true,
          },
          orderBy: [
            { name: "asc" },
          ],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        db.facility.count({ where }),
      ]);

      // Add imageUrl from photos array
      const facilitiesWithImages = facilities.map((facility: { photos?: string[] }) => ({
        ...facility,
        imageUrl: facility.photos && facility.photos.length > 0 ? facility.photos[0] : null,
      }));

      return NextResponse.json({
        success: true,
        data: {
          items: facilitiesWithImages,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (dbError) {
      console.error("Database error, using mock data:", dbError);
      
      // Filter mock data based on query params
      let filtered = [...MOCK_FACILITIES];
      
      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(f => 
          f.name.toLowerCase().includes(q) || 
          f.address.toLowerCase().includes(q)
        );
      }
      
      if (emergencyOnly) {
        filtered = filtered.filter(f => f.emergencyCapable);
      }
      
      if (nhisOnly) {
        filtered = filtered.filter(f => f.nhisAccepted);
      }

      const facilitiesWithImages = filtered.map(f => ({
        ...f,
        imageUrl: f.photos[0],
      }));

      return NextResponse.json({
        success: true,
        data: {
          items: facilitiesWithImages.slice((page - 1) * pageSize, page * pageSize),
          total: filtered.length,
          page,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize),
        },
        _mock: true,
      });
    }
  } catch (error) {
    console.error("Error fetching facilities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch facilities" },
      { status: 500 }
    );
  }
}
