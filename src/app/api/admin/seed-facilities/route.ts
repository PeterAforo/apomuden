import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Greater Accra and Tema Healthcare Facilities
const FACILITIES = [
  // Hospitals in Greater Accra
  {
    name: "Korle Bu Teaching Hospital",
    slug: "korle-bu-teaching-hospital",
    type: "HOSPITAL",
    phone: "0302665401",
    email: "info@kfrh.gov.gh",
    address: "Guggisberg Avenue",
    city: "Accra",
    districtName: "Accra Metropolitan",
    latitude: 5.5344,
    longitude: -0.2251,
    nhisAccredited: true,
    emergencyCapable: true,
    ambulanceAvailable: true,
    bedCount: 2000,
    icuBedsAvailable: 50,
    description: "Ghana's premier teaching hospital and the third largest hospital in Africa.",
  },
  {
    name: "37 Military Hospital",
    slug: "37-military-hospital",
    type: "HOSPITAL",
    phone: "0302776111",
    email: "info@37milhosp.gov.gh",
    address: "Liberation Road",
    city: "Accra",
    districtName: "Accra Metropolitan",
    latitude: 5.5797,
    longitude: -0.1849,
    nhisAccredited: true,
    emergencyCapable: true,
    ambulanceAvailable: true,
    bedCount: 600,
    icuBedsAvailable: 30,
    description: "A military hospital that also serves civilians. Known for excellent trauma care.",
  },
  {
    name: "Ridge Hospital",
    slug: "ridge-hospital",
    type: "HOSPITAL",
    phone: "0302228315",
    email: "info@ridgehospital.gov.gh",
    address: "Castle Road, Ridge",
    city: "Accra",
    districtName: "Accra Metropolitan",
    latitude: 5.5628,
    longitude: -0.1969,
    nhisAccredited: true,
    emergencyCapable: true,
    ambulanceAvailable: true,
    bedCount: 420,
    icuBedsAvailable: 20,
    description: "A major government hospital in the heart of Accra.",
  },
  {
    name: "Tema General Hospital",
    slug: "tema-general-hospital",
    type: "HOSPITAL",
    phone: "0303212222",
    email: "info@temageneralhospital.gov.gh",
    address: "Hospital Road, Community 1",
    city: "Tema",
    districtName: "Tema Metropolitan",
    latitude: 5.6698,
    longitude: -0.0166,
    nhisAccredited: true,
    emergencyCapable: true,
    ambulanceAvailable: true,
    bedCount: 350,
    icuBedsAvailable: 15,
    description: "The main government hospital serving Tema and surrounding communities.",
  },
  {
    name: "Lekma Hospital",
    slug: "lekma-hospital",
    type: "HOSPITAL",
    phone: "0302813456",
    email: "info@lekmahospital.gov.gh",
    address: "Teshie-Nungua",
    city: "Accra",
    districtName: "Ledzokuku-Krowor",
    latitude: 5.5922,
    longitude: -0.0975,
    nhisAccredited: true,
    emergencyCapable: true,
    ambulanceAvailable: true,
    bedCount: 200,
    icuBedsAvailable: 10,
    description: "A district hospital serving the Ledzokuku-Krowor Municipality.",
  },
  {
    name: "Nyaho Medical Centre",
    slug: "nyaho-medical-centre",
    type: "HOSPITAL",
    phone: "0302775341",
    email: "info@nyahomedical.com",
    address: "7th Avenue, Ridge",
    city: "Accra",
    districtName: "Accra Metropolitan",
    latitude: 5.5612,
    longitude: -0.1891,
    nhisAccredited: true,
    emergencyCapable: true,
    ambulanceAvailable: true,
    bedCount: 80,
    icuBedsAvailable: 8,
    description: "A leading private hospital offering world-class healthcare services.",
  },
  {
    name: "Trust Hospital Osu",
    slug: "trust-hospital-osu",
    type: "HOSPITAL",
    phone: "0302761974",
    email: "info@trusthospitals.com",
    address: "Osu, Oxford Street",
    city: "Accra",
    districtName: "Accra Metropolitan",
    latitude: 5.5571,
    longitude: -0.1818,
    nhisAccredited: true,
    emergencyCapable: true,
    ambulanceAvailable: true,
    bedCount: 60,
    icuBedsAvailable: 6,
    description: "A trusted private hospital chain with multiple locations across Accra.",
  },
  // Polyclinics
  {
    name: "Mamprobi Polyclinic",
    slug: "mamprobi-polyclinic",
    type: "POLYCLINIC",
    phone: "0302223456",
    email: "mamprobi.polyclinic@ghs.gov.gh",
    address: "Mamprobi",
    city: "Accra",
    districtName: "Accra Metropolitan",
    latitude: 5.5389,
    longitude: -0.2356,
    nhisAccredited: true,
    emergencyCapable: true,
    ambulanceAvailable: false,
    bedCount: 40,
    icuBedsAvailable: 0,
    description: "A government polyclinic providing primary healthcare services.",
  },
  {
    name: "Tema Polyclinic",
    slug: "tema-polyclinic",
    type: "POLYCLINIC",
    phone: "0303215678",
    email: "tema.polyclinic@ghs.gov.gh",
    address: "Community 2",
    city: "Tema",
    districtName: "Tema Metropolitan",
    latitude: 5.6712,
    longitude: -0.0234,
    nhisAccredited: true,
    emergencyCapable: true,
    ambulanceAvailable: false,
    bedCount: 35,
    icuBedsAvailable: 0,
    description: "A government polyclinic serving the Tema community.",
  },
  {
    name: "La General Hospital",
    slug: "la-general-hospital",
    type: "POLYCLINIC",
    phone: "0302772345",
    email: "la.general@ghs.gov.gh",
    address: "La, Trade Fair",
    city: "Accra",
    districtName: "La Dade-Kotopon",
    latitude: 5.5756,
    longitude: -0.1567,
    nhisAccredited: true,
    emergencyCapable: true,
    ambulanceAvailable: true,
    bedCount: 100,
    icuBedsAvailable: 5,
    description: "A major polyclinic serving the La community.",
  },
  {
    name: "Ashaiman Polyclinic",
    slug: "ashaiman-polyclinic",
    type: "POLYCLINIC",
    phone: "0303305678",
    email: "ashaiman.polyclinic@ghs.gov.gh",
    address: "Ashaiman",
    city: "Ashaiman",
    districtName: "Ashaiman Municipal",
    latitude: 5.6912,
    longitude: -0.0345,
    nhisAccredited: true,
    emergencyCapable: true,
    ambulanceAvailable: true,
    bedCount: 50,
    icuBedsAvailable: 2,
    description: "The main government health facility serving Ashaiman Municipality.",
  },
  // Clinics
  {
    name: "Tema Community 5 Clinic",
    slug: "tema-community-5-clinic",
    type: "CLINIC",
    phone: "0303218901",
    email: "c5clinic@ghs.gov.gh",
    address: "Community 5",
    city: "Tema",
    districtName: "Tema Metropolitan",
    latitude: 5.6634,
    longitude: -0.0089,
    nhisAccredited: true,
    emergencyCapable: false,
    ambulanceAvailable: false,
    bedCount: 10,
    icuBedsAvailable: 0,
    description: "A community clinic providing basic healthcare services.",
  },
  {
    name: "Bethel Clinic Tema",
    slug: "bethel-clinic-tema",
    type: "CLINIC",
    phone: "0303219876",
    email: "info@bethelclinic.com",
    address: "Community 11",
    city: "Tema",
    districtName: "Tema Metropolitan",
    latitude: 5.6589,
    longitude: 0.0012,
    nhisAccredited: true,
    emergencyCapable: false,
    ambulanceAvailable: false,
    bedCount: 15,
    icuBedsAvailable: 0,
    description: "A private clinic offering quality healthcare services.",
  },
  // Health Centres
  {
    name: "Sakumono Health Centre",
    slug: "sakumono-health-centre",
    type: "HEALTH_CENTRE",
    phone: "0303456789",
    email: "sakumono.hc@ghs.gov.gh",
    address: "Sakumono Estate",
    city: "Tema",
    districtName: "Tema Metropolitan",
    latitude: 5.6234,
    longitude: -0.0456,
    nhisAccredited: true,
    emergencyCapable: false,
    ambulanceAvailable: false,
    bedCount: 8,
    icuBedsAvailable: 0,
    description: "A health centre providing primary healthcare to Sakumono residents.",
  },
  {
    name: "Lashibi Health Centre",
    slug: "lashibi-health-centre",
    type: "HEALTH_CENTRE",
    phone: "0303467890",
    email: "lashibi.hc@ghs.gov.gh",
    address: "Lashibi",
    city: "Tema",
    districtName: "Tema Metropolitan",
    latitude: 5.6345,
    longitude: -0.0567,
    nhisAccredited: true,
    emergencyCapable: false,
    ambulanceAvailable: false,
    bedCount: 6,
    icuBedsAvailable: 0,
    description: "A community health centre serving the Lashibi area.",
  },
  // Pharmacies
  {
    name: "Ernest Chemist Tema",
    slug: "ernest-chemist-tema",
    type: "PHARMACY",
    phone: "0303220123",
    email: "tema@ernestchemist.com",
    address: "Community 1, Main Road",
    city: "Tema",
    districtName: "Tema Metropolitan",
    latitude: 5.6701,
    longitude: -0.0178,
    nhisAccredited: false,
    emergencyCapable: false,
    ambulanceAvailable: false,
    bedCount: 0,
    icuBedsAvailable: 0,
    description: "A leading pharmacy chain providing quality medicines.",
  },
  {
    name: "Kama Pharmacy 24hr",
    slug: "kama-pharmacy-accra",
    type: "PHARMACY",
    phone: "0302789012",
    email: "info@kamapharmacy.com",
    address: "Osu, Cantonments",
    city: "Accra",
    districtName: "Accra Metropolitan",
    latitude: 5.5612,
    longitude: -0.1756,
    nhisAccredited: false,
    emergencyCapable: false,
    ambulanceAvailable: false,
    bedCount: 0,
    icuBedsAvailable: 0,
    description: "A 24-hour pharmacy providing medicines and pharmaceutical services.",
  },
  // Diagnostic Centres
  {
    name: "Medlab Ghana Tema",
    slug: "medlab-ghana-tema",
    type: "DIAGNOSTIC_CENTRE",
    phone: "0303221234",
    email: "tema@medlabghana.com",
    address: "Community 2",
    city: "Tema",
    districtName: "Tema Metropolitan",
    latitude: 5.6723,
    longitude: -0.0212,
    nhisAccredited: true,
    emergencyCapable: false,
    ambulanceAvailable: false,
    bedCount: 0,
    icuBedsAvailable: 0,
    description: "A modern diagnostic centre offering laboratory and imaging services.",
  },
  {
    name: "Nyaho Diagnostic Centre",
    slug: "nyaho-diagnostic-centre",
    type: "DIAGNOSTIC_CENTRE",
    phone: "0302775342",
    email: "diagnostics@nyahomedical.com",
    address: "Airport Residential",
    city: "Accra",
    districtName: "Accra Metropolitan",
    latitude: 5.5734,
    longitude: -0.1823,
    nhisAccredited: true,
    emergencyCapable: false,
    ambulanceAvailable: false,
    bedCount: 0,
    icuBedsAvailable: 0,
    description: "State-of-the-art diagnostic facility with advanced imaging services.",
  },
  // Maternity Homes
  {
    name: "Tema Maternity Home",
    slug: "tema-maternity-home",
    type: "MATERNITY_HOME",
    phone: "0303222345",
    email: "temamaternity@ghs.gov.gh",
    address: "Community 3",
    city: "Tema",
    districtName: "Tema Metropolitan",
    latitude: 5.6678,
    longitude: -0.0145,
    nhisAccredited: true,
    emergencyCapable: true,
    ambulanceAvailable: false,
    bedCount: 25,
    icuBedsAvailable: 2,
    description: "A specialized maternity facility providing antenatal and delivery care.",
  },
  {
    name: "Marie Stopes Accra",
    slug: "marie-stopes-accra",
    type: "MATERNITY_HOME",
    phone: "0302234567",
    email: "accra@mariestopes.org.gh",
    address: "Asylum Down",
    city: "Accra",
    districtName: "Accra Metropolitan",
    latitude: 5.5567,
    longitude: -0.2123,
    nhisAccredited: true,
    emergencyCapable: false,
    ambulanceAvailable: false,
    bedCount: 15,
    icuBedsAvailable: 0,
    description: "Reproductive health clinic offering family planning and maternal health.",
  },
];

type FacilityType = "HOSPITAL" | "CLINIC" | "PHARMACY" | "DIAGNOSTIC_CENTRE" | "MATERNITY_HOME" | "CHPS_COMPOUND" | "POLYCLINIC" | "HEALTH_CENTRE";

export async function POST() {
  try {
    const session = await auth();

    // Allow seeding without auth for initial setup, or require admin
    // if (session?.user?.role !== "MINISTRY_ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Get or create Greater Accra region
    let greaterAccra = await db.region.findFirst({
      where: { name: "Greater Accra" },
    });

    if (!greaterAccra) {
      greaterAccra = await db.region.create({
        data: { name: "Greater Accra", code: "GA" },
      });
    }

    // Create districts
    const districts = [
      "Accra Metropolitan",
      "Tema Metropolitan",
      "Ledzokuku-Krowor",
      "La Dade-Kotopon",
      "Ashaiman Municipal",
    ];

    const districtMap: Record<string, string> = {};

    for (const districtName of districts) {
      let district = await db.district.findFirst({
        where: { name: districtName, regionId: greaterAccra.id },
      });

      if (!district) {
        district = await db.district.create({
          data: { name: districtName, regionId: greaterAccra.id },
        });
      }
      districtMap[districtName] = district.id;
    }

    // Seed facilities
    let created = 0;
    let skipped = 0;

    for (const facility of FACILITIES) {
      const existing = await db.facility.findFirst({
        where: { slug: facility.slug },
      });

      if (existing) {
        skipped++;
        continue;
      }

      const districtId = districtMap[facility.districtName];
      if (!districtId) continue;

      await db.facility.create({
        data: {
          name: facility.name,
          slug: facility.slug,
          type: facility.type as FacilityType,
          phone: facility.phone,
          email: facility.email,
          address: facility.address,
          city: facility.city,
          regionId: greaterAccra.id,
          districtId: districtId,
          latitude: facility.latitude,
          longitude: facility.longitude,
          nhisAccredited: facility.nhisAccredited,
          emergencyCapable: facility.emergencyCapable,
          ambulanceAvailable: facility.ambulanceAvailable,
          bedCount: facility.bedCount,
          icuBedsAvailable: facility.icuBedsAvailable,
          operatingHours: { open: "00:00", close: "23:59", is24Hours: facility.type === "HOSPITAL" },
          description: facility.description,
          status: "APPROVED",
          tier: facility.type === "HOSPITAL" ? 4 : facility.type === "POLYCLINIC" ? 3 : 2,
          rating: 4.0 + Math.random() * 0.9,
          reviewCount: Math.floor(Math.random() * 50) + 10,
        },
      });

      created++;
    }

    return NextResponse.json({
      message: "Facilities seeded successfully",
      created,
      skipped,
      total: FACILITIES.length,
    });
  } catch (error) {
    console.error("Error seeding facilities:", error);
    return NextResponse.json(
      { error: "Failed to seed facilities" },
      { status: 500 }
    );
  }
}
