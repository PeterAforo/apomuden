import { NextRequest, NextResponse } from "next/server";

interface AmbulanceService {
  id: string;
  name: string;
  company: string;
  vehicleType: "BLS" | "ALS" | "MICU";
  status: "available" | "busy" | "offline";
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  contact: {
    phone: string;
    whatsapp?: string;
    email?: string;
  };
  driver: {
    name: string;
    experience: number;
    rating: number;
  };
  equipment: string[];
  estimatedArrival?: number;
  distance?: number;
  pricePerKm: number;
  rating: number;
  totalTrips: number;
  lastUpdated: string;
}

// Mock ambulance data - in production, this would come from database
const AMBULANCES: AmbulanceService[] = [
  {
    id: "amb-001",
    name: "Rapid Response Unit 1",
    company: "Ghana Ambulance Service",
    vehicleType: "ALS",
    status: "available",
    location: { lat: 5.6037, lng: -0.1870, address: "Accra Central, Near Makola Market" },
    contact: { phone: "+233 30 277 7777", whatsapp: "+233244000001", email: "dispatch@gas.gov.gh" },
    driver: { name: "Kwame Mensah", experience: 8, rating: 4.9 },
    equipment: ["Defibrillator", "Oxygen", "Stretcher", "First Aid Kit", "Cardiac Monitor"],
    pricePerKm: 15,
    rating: 4.8,
    totalTrips: 1245,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "amb-002",
    name: "Emergency Unit 7",
    company: "National Ambulance Service",
    vehicleType: "MICU",
    status: "available",
    location: { lat: 5.5913, lng: -0.2200, address: "Korle Bu, Near Teaching Hospital" },
    contact: { phone: "+233 30 278 8888", whatsapp: "+233244000002" },
    driver: { name: "Ama Owusu", experience: 12, rating: 4.95 },
    equipment: ["Ventilator", "Defibrillator", "IV Pumps", "Cardiac Monitor", "Suction Unit", "Oxygen"],
    pricePerKm: 25,
    rating: 4.9,
    totalTrips: 2156,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "amb-003",
    name: "Quick Response 3",
    company: "Private Medical Transport",
    vehicleType: "BLS",
    status: "busy",
    location: { lat: 5.6145, lng: -0.2050, address: "Osu, Oxford Street Area" },
    contact: { phone: "+233 24 555 1234", whatsapp: "+233245551234" },
    driver: { name: "Kofi Asante", experience: 5, rating: 4.7 },
    equipment: ["Stretcher", "First Aid Kit", "Oxygen", "Wheelchair"],
    pricePerKm: 10,
    rating: 4.6,
    totalTrips: 567,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "amb-004",
    name: "Life Saver Unit 2",
    company: "Ghana Ambulance Service",
    vehicleType: "ALS",
    status: "available",
    location: { lat: 5.6350, lng: -0.1750, address: "East Legon, Near A&C Mall" },
    contact: { phone: "+233 30 277 9999", whatsapp: "+233244000004" },
    driver: { name: "Yaw Boateng", experience: 6, rating: 4.8 },
    equipment: ["Defibrillator", "Oxygen", "Stretcher", "Cardiac Monitor", "Suction Unit"],
    pricePerKm: 15,
    rating: 4.7,
    totalTrips: 890,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "amb-005",
    name: "Critical Care Mobile",
    company: "Trust Hospital Ambulance",
    vehicleType: "MICU",
    status: "offline",
    location: { lat: 5.5800, lng: -0.1950, address: "Osu, Near Trust Hospital" },
    contact: { phone: "+233 30 276 5555" },
    driver: { name: "Efua Darko", experience: 10, rating: 4.85 },
    equipment: ["Ventilator", "Defibrillator", "IV Pumps", "Incubator", "Cardiac Monitor"],
    pricePerKm: 30,
    rating: 4.9,
    totalTrips: 1567,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "amb-006",
    name: "Community Response 5",
    company: "Ridge Hospital Services",
    vehicleType: "BLS",
    status: "available",
    location: { lat: 5.5550, lng: -0.2100, address: "Ridge, Near Ridge Hospital" },
    contact: { phone: "+233 30 222 3333", whatsapp: "+233244000006" },
    driver: { name: "Abena Sarpong", experience: 4, rating: 4.6 },
    equipment: ["Stretcher", "First Aid Kit", "Oxygen", "AED"],
    pricePerKm: 12,
    rating: 4.5,
    totalTrips: 423,
    lastUpdated: new Date().toISOString(),
  },
];

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function estimateArrivalTime(distance: number): number {
  // Assume average speed of 30 km/h in urban areas
  const avgSpeed = 30;
  return Math.round((distance / avgSpeed) * 60);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "5.6037");
    const lng = parseFloat(searchParams.get("lng") || "-0.1870");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const maxDistance = parseFloat(searchParams.get("maxDistance") || "50");

    let ambulances = AMBULANCES.map((amb) => {
      const distance = calculateDistance(lat, lng, amb.location.lat, amb.location.lng);
      const estimatedArrival = amb.status === "available" ? estimateArrivalTime(distance) : undefined;
      return {
        ...amb,
        distance,
        estimatedArrival,
        lastUpdated: new Date().toISOString(),
      };
    });

    // Filter by status
    if (status && status !== "all") {
      ambulances = ambulances.filter((amb) => amb.status === status);
    }

    // Filter by type
    if (type && type !== "all") {
      ambulances = ambulances.filter((amb) => amb.vehicleType === type);
    }

    // Filter by max distance
    ambulances = ambulances.filter((amb) => amb.distance <= maxDistance);

    // Sort by availability and distance
    ambulances.sort((a, b) => {
      if (a.status === "available" && b.status !== "available") return -1;
      if (a.status !== "available" && b.status === "available") return 1;
      return a.distance - b.distance;
    });

    return NextResponse.json({
      success: true,
      data: ambulances,
      meta: {
        total: ambulances.length,
        available: ambulances.filter((a) => a.status === "available").length,
        busy: ambulances.filter((a) => a.status === "busy").length,
        offline: ambulances.filter((a) => a.status === "offline").length,
      },
    });
  } catch (error) {
    console.error("Error fetching ambulances:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ambulances" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ambulanceId, userLocation, phone, emergencyType, description } = body;

    if (!ambulanceId || !phone) {
      return NextResponse.json(
        { success: false, error: "Ambulance ID and phone number are required" },
        { status: 400 }
      );
    }

    const ambulance = AMBULANCES.find((a) => a.id === ambulanceId);
    if (!ambulance) {
      return NextResponse.json(
        { success: false, error: "Ambulance not found" },
        { status: 404 }
      );
    }

    if (ambulance.status !== "available") {
      return NextResponse.json(
        { success: false, error: "Ambulance is not available" },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Create a dispatch record in the database
    // 2. Send notification to the ambulance driver
    // 3. Send SMS/WhatsApp to the user with ETA
    // 4. Update ambulance status to "busy"

    const requestId = `REQ-${Date.now()}`;
    const distance = userLocation
      ? calculateDistance(
          userLocation.lat,
          userLocation.lng,
          ambulance.location.lat,
          ambulance.location.lng
        )
      : 5;
    const eta = estimateArrivalTime(distance);

    return NextResponse.json({
      success: true,
      data: {
        requestId,
        ambulance: {
          id: ambulance.id,
          name: ambulance.name,
          driver: ambulance.driver.name,
          phone: ambulance.contact.phone,
        },
        eta,
        distance,
        status: "dispatched",
        message: `Ambulance ${ambulance.name} has been dispatched. ETA: ${eta} minutes.`,
      },
    });
  } catch (error) {
    console.error("Error requesting ambulance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to request ambulance" },
      { status: 500 }
    );
  }
}
