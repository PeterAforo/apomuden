import { NextRequest, NextResponse } from "next/server";

const MOCK_DOCTORS = [
  {
    id: "doc-1",
    name: "Dr. Kwame Asante",
    specialty: "General Practice",
    facility: "Korle Bu Teaching Hospital",
    rating: 4.8,
    consultationFee: 50,
    availableSlots: ["09:00", "10:00", "11:00", "14:00", "15:00"],
    imageUrl: null,
    bio: "Experienced general practitioner with 15 years of experience.",
  },
  {
    id: "doc-2",
    name: "Dr. Ama Mensah",
    specialty: "Pediatrics",
    facility: "Ridge Hospital",
    rating: 4.9,
    consultationFee: 60,
    availableSlots: ["09:30", "10:30", "14:30", "16:00"],
    imageUrl: null,
    bio: "Specialist in child healthcare and development.",
  },
  {
    id: "doc-3",
    name: "Dr. Kofi Owusu",
    specialty: "Internal Medicine",
    facility: "37 Military Hospital",
    rating: 4.7,
    consultationFee: 70,
    availableSlots: ["08:00", "09:00", "13:00", "14:00", "15:00"],
    imageUrl: null,
    bio: "Expert in diagnosing and treating adult diseases.",
  },
  {
    id: "doc-4",
    name: "Dr. Efua Darko",
    specialty: "Dermatology",
    facility: "Nyaho Medical Centre",
    rating: 4.6,
    consultationFee: 80,
    availableSlots: ["10:00", "11:00", "15:00", "16:00"],
    imageUrl: null,
    bio: "Skin care specialist with expertise in tropical dermatology.",
  },
  {
    id: "doc-5",
    name: "Dr. Yaw Boateng",
    specialty: "Cardiology",
    facility: "Tema General Hospital",
    rating: 4.9,
    consultationFee: 100,
    availableSlots: ["09:00", "11:00", "14:00"],
    imageUrl: null,
    bio: "Heart specialist with advanced training in cardiac care.",
  },
  {
    id: "doc-6",
    name: "Dr. Akosua Frimpong",
    specialty: "Obstetrics & Gynecology",
    facility: "Ridge Hospital",
    rating: 4.8,
    consultationFee: 75,
    availableSlots: ["08:30", "10:30", "13:30", "15:30"],
    imageUrl: null,
    bio: "Women's health specialist with focus on maternal care.",
  },
  {
    id: "doc-7",
    name: "Dr. Nana Adjei",
    specialty: "General Practice",
    facility: "Trust Hospital",
    rating: 4.5,
    consultationFee: 45,
    availableSlots: ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"],
    imageUrl: null,
    bio: "Family medicine practitioner serving the community.",
  },
  {
    id: "doc-8",
    name: "Dr. Abena Osei",
    specialty: "Psychiatry",
    facility: "Korle Bu Teaching Hospital",
    rating: 4.7,
    consultationFee: 90,
    availableSlots: ["10:00", "14:00", "16:00"],
    imageUrl: null,
    bio: "Mental health specialist providing compassionate care.",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get("specialty");

    const doctors = specialty
      ? MOCK_DOCTORS.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()))
      : MOCK_DOCTORS;

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}
