import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Use string literals matching the schema enum values
const FacilityType = {
  HOSPITAL: "HOSPITAL",
  CLINIC: "CLINIC",
  DIAGNOSTIC_CENTRE: "DIAGNOSTIC_CENTRE",
  MATERNITY_HOME: "MATERNITY_HOME",
} as const;

const FacilityTier = {
  FIVE_STAR: "FIVE_STAR",
  FOUR_STAR: "FOUR_STAR",
  THREE_STAR: "THREE_STAR",
  TWO_STAR: "TWO_STAR",
  ONE_STAR: "ONE_STAR",
} as const;

const FacilityOwnership = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
  MISSION: "MISSION",
  QUASI_GOVERNMENT: "QUASI_GOVERNMENT",
} as const;

const NHISCoverage = {
  YES: "YES",
  PARTIAL: "PARTIAL",
  NO: "NO",
} as const;

const FacilityStatus = {
  APPROVED: "APPROVED",
} as const;

// Private hospitals and facilities to add
const privateFacilities = [
  // Greater Accra - Private Hospitals
  {
    name: "Nyaho Medical Centre",
    type: FacilityType.HOSPITAL,
    tier: FacilityTier.FOUR_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "GA",
    district: "Accra Metropolitan",
    address: "7 Tetteh Quarshie Avenue, Airport Residential Area, Accra",
    phone: "+233302785041",
    email: "info@nyahomedical.com",
    website: "https://www.nyahomedical.com",
    latitude: 5.5913,
    longitude: -0.1743,
    bedCount: 120,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: true,
    nhis: NHISCoverage.YES,
    description: "Premier private healthcare facility offering comprehensive medical services including diagnostics, surgery, and specialist consultations.",
  },
  {
    name: "The Trust Hospital",
    type: FacilityType.HOSPITAL,
    tier: FacilityTier.FOUR_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "GA",
    district: "Accra Metropolitan",
    address: "Osu Badu Street, Accra",
    phone: "+233302761974",
    email: "info@thetrusthospital.com",
    website: "https://www.thetrusthospital.com",
    latitude: 5.5560,
    longitude: -0.1870,
    bedCount: 100,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: true,
    nhis: NHISCoverage.YES,
    description: "Leading private hospital providing quality healthcare services with modern facilities and experienced medical professionals.",
  },
  {
    name: "Lister Hospital and Fertility Centre",
    type: FacilityType.HOSPITAL,
    tier: FacilityTier.FOUR_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "GA",
    district: "Accra Metropolitan",
    address: "North Airport Road, Airport Residential Area, Accra",
    phone: "+233302784772",
    email: "info@listerhospital.com.gh",
    website: "https://www.listerhospital.com.gh",
    latitude: 5.5950,
    longitude: -0.1680,
    bedCount: 80,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: true,
    nhis: NHISCoverage.YES,
    description: "Specialized private hospital known for fertility treatments, obstetrics, and comprehensive healthcare services.",
  },
  {
    name: "Medifem Multi-Specialist Hospital",
    type: FacilityType.HOSPITAL,
    tier: FacilityTier.THREE_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "GA",
    district: "Accra Metropolitan",
    address: "East Legon, Accra",
    phone: "+233302518533",
    email: "info@medifemhospital.com",
    latitude: 5.6350,
    longitude: -0.1580,
    bedCount: 60,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: true,
    nhis: NHISCoverage.YES,
    description: "Multi-specialist private hospital offering a wide range of medical services including surgery, maternity, and pediatric care.",
  },
  {
    name: "Rabito Clinic",
    type: FacilityType.CLINIC,
    tier: FacilityTier.TWO_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "GA",
    district: "Accra Metropolitan",
    address: "Osu, Oxford Street, Accra",
    phone: "+233302773360",
    email: "info@rabitoclinic.com",
    latitude: 5.5520,
    longitude: -0.1820,
    bedCount: 20,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: false,
    nhis: NHISCoverage.PARTIAL,
    description: "Well-established private clinic providing general medical services, diagnostics, and specialist consultations.",
  },
  {
    name: "Akai House Clinic",
    type: FacilityType.CLINIC,
    tier: FacilityTier.TWO_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "GA",
    district: "Tema Metropolitan",
    address: "Community 1, Tema",
    phone: "+233303206789",
    email: "info@akaihouseclinic.com",
    latitude: 5.6698,
    longitude: -0.0166,
    bedCount: 30,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: true,
    nhis: NHISCoverage.YES,
    description: "Private clinic in Tema offering comprehensive healthcare services including maternity and pediatric care.",
  },
  // Ashanti Region - Private Hospitals
  {
    name: "Kumasi Private Hospital",
    type: FacilityType.HOSPITAL,
    tier: FacilityTier.THREE_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "AS",
    district: "Kumasi Metropolitan",
    address: "Adum, Kumasi",
    phone: "+233322024567",
    email: "info@kumasiprivatehospital.com",
    latitude: 6.6885,
    longitude: -1.6244,
    bedCount: 70,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: true,
    nhis: NHISCoverage.YES,
    description: "Leading private hospital in Kumasi providing quality healthcare services to the Ashanti region.",
  },
  {
    name: "Sikass Medical Centre",
    type: FacilityType.HOSPITAL,
    tier: FacilityTier.THREE_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "AS",
    district: "Kumasi Metropolitan",
    address: "Bantama, Kumasi",
    phone: "+233322034567",
    email: "info@sikassmedical.com",
    latitude: 6.7000,
    longitude: -1.6350,
    bedCount: 50,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: true,
    nhis: NHISCoverage.YES,
    description: "Private medical centre offering specialist services, diagnostics, and inpatient care.",
  },
  {
    name: "Prempeh Specialist Hospital",
    type: FacilityType.HOSPITAL,
    tier: FacilityTier.THREE_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "AS",
    district: "Kumasi Metropolitan",
    address: "Ahodwo, Kumasi",
    phone: "+233322044567",
    email: "info@prempehspecialist.com",
    latitude: 6.6750,
    longitude: -1.6400,
    bedCount: 45,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: false,
    nhis: NHISCoverage.PARTIAL,
    description: "Specialist private hospital focusing on surgery, orthopedics, and internal medicine.",
  },
  // Western Region - Private Facilities
  {
    name: "Takoradi Private Hospital",
    type: FacilityType.HOSPITAL,
    tier: FacilityTier.THREE_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "WR",
    district: "Sekondi Takoradi Metropolitan",
    address: "Market Circle, Takoradi",
    phone: "+233312023456",
    email: "info@takoradiprivatehospital.com",
    latitude: 4.8845,
    longitude: -1.7554,
    bedCount: 55,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: true,
    nhis: NHISCoverage.YES,
    description: "Premier private healthcare facility serving the Western Region with comprehensive medical services.",
  },
  {
    name: "Sekondi Specialist Clinic",
    type: FacilityType.CLINIC,
    tier: FacilityTier.TWO_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "WR",
    district: "Sekondi Takoradi Metropolitan",
    address: "Sekondi Town",
    phone: "+233312033456",
    email: "info@sekondispecialist.com",
    latitude: 4.9340,
    longitude: -1.7040,
    bedCount: 25,
    hasEmergency: true,
    has24Hours: false,
    hasAmbulance: false,
    nhis: NHISCoverage.PARTIAL,
    description: "Private specialist clinic offering outpatient services and diagnostics.",
  },
  // Central Region - Private Facilities
  {
    name: "Cape Coast Private Hospital",
    type: FacilityType.HOSPITAL,
    tier: FacilityTier.THREE_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "CR",
    district: "Cape Coast Metropolitan",
    address: "Abura, Cape Coast",
    phone: "+233332023456",
    email: "info@capecoastprivatehospital.com",
    latitude: 5.1053,
    longitude: -1.2466,
    bedCount: 40,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: true,
    nhis: NHISCoverage.YES,
    description: "Private hospital providing quality healthcare services to Cape Coast and surrounding areas.",
  },
  // Eastern Region - Private Facilities
  {
    name: "Koforidua Private Clinic",
    type: FacilityType.CLINIC,
    tier: FacilityTier.TWO_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "ER",
    district: "New Juaben South Municipal",
    address: "Koforidua Town Centre",
    phone: "+233342023456",
    email: "info@koforiduprivateclinic.com",
    latitude: 6.0940,
    longitude: -0.2590,
    bedCount: 30,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: false,
    nhis: NHISCoverage.YES,
    description: "Private clinic offering general healthcare services and specialist consultations.",
  },
  // Northern Region - Private Facilities
  {
    name: "Tamale Private Hospital",
    type: FacilityType.HOSPITAL,
    tier: FacilityTier.THREE_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "NR",
    district: "Tamale Metropolitan",
    address: "Central Tamale",
    phone: "+233372023456",
    email: "info@tamaleprivatehospital.com",
    latitude: 9.4034,
    longitude: -0.8424,
    bedCount: 45,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: true,
    nhis: NHISCoverage.YES,
    description: "Leading private hospital in Northern Ghana providing comprehensive healthcare services.",
  },
  // Volta Region - Private Facilities
  {
    name: "Ho Private Clinic",
    type: FacilityType.CLINIC,
    tier: FacilityTier.TWO_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "VR",
    district: "Ho Municipal",
    address: "Ho Town Centre",
    phone: "+233362023456",
    email: "info@hoprivateclinic.com",
    latitude: 6.6000,
    longitude: 0.4700,
    bedCount: 25,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: false,
    nhis: NHISCoverage.PARTIAL,
    description: "Private clinic serving the Volta Region with quality outpatient and diagnostic services.",
  },
  // Additional Private Diagnostic Centers
  {
    name: "MDS Lancet Laboratories Ghana",
    type: FacilityType.DIAGNOSTIC_CENTRE,
    tier: FacilityTier.THREE_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "GA",
    district: "Accra Metropolitan",
    address: "North Ridge, Accra",
    phone: "+233302224455",
    email: "info@lancetgh.com",
    website: "https://www.lancetgh.com",
    latitude: 5.5650,
    longitude: -0.2050,
    bedCount: 0,
    hasEmergency: false,
    has24Hours: false,
    hasAmbulance: false,
    nhis: NHISCoverage.PARTIAL,
    description: "International diagnostic laboratory providing comprehensive pathology and laboratory services.",
  },
  {
    name: "Medlab Ghana",
    type: FacilityType.DIAGNOSTIC_CENTRE,
    tier: FacilityTier.TWO_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "GA",
    district: "Accra Metropolitan",
    address: "Labone, Accra",
    phone: "+233302776655",
    email: "info@medlabghana.com",
    latitude: 5.5580,
    longitude: -0.1750,
    bedCount: 0,
    hasEmergency: false,
    has24Hours: false,
    hasAmbulance: false,
    nhis: NHISCoverage.NO,
    description: "Modern diagnostic centre offering laboratory tests, imaging, and health screening services.",
  },
  // Private Maternity Homes
  {
    name: "Graceland Maternity Home",
    type: FacilityType.MATERNITY_HOME,
    tier: FacilityTier.TWO_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "GA",
    district: "Ga West",
    address: "Weija, Accra",
    phone: "+233302998877",
    email: "info@gracelandmaternity.com",
    latitude: 5.5450,
    longitude: -0.3350,
    bedCount: 20,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: false,
    nhis: NHISCoverage.YES,
    description: "Private maternity home specializing in antenatal, delivery, and postnatal care services.",
  },
  {
    name: "Blessed Maternity Clinic",
    type: FacilityType.MATERNITY_HOME,
    tier: FacilityTier.ONE_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "AS",
    district: "Kumasi Metropolitan",
    address: "Asokwa, Kumasi",
    phone: "+233322887766",
    email: "info@blessedmaternity.com",
    latitude: 6.6600,
    longitude: -1.6100,
    bedCount: 15,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: false,
    nhis: NHISCoverage.YES,
    description: "Community maternity clinic providing safe delivery and maternal healthcare services.",
  },
  // Private Pharmacies with Clinics
  {
    name: "Ernest Chemists Healthcare",
    type: FacilityType.CLINIC,
    tier: FacilityTier.ONE_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "GA",
    district: "Accra Metropolitan",
    address: "Osu, Accra",
    phone: "+233302775544",
    email: "info@ernestchemists.com",
    website: "https://www.ernestchemists.com",
    latitude: 5.5550,
    longitude: -0.1800,
    bedCount: 5,
    hasEmergency: false,
    has24Hours: true,
    hasAmbulance: false,
    nhis: NHISCoverage.PARTIAL,
    description: "Pharmacy chain with attached clinic services offering consultations and basic healthcare.",
  },
  // More Private Hospitals in Different Regions
  {
    name: "Bolgatanga Private Hospital",
    type: FacilityType.HOSPITAL,
    tier: FacilityTier.TWO_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "UE",
    district: "Bolgatanga Municipal",
    address: "Bolgatanga Town",
    phone: "+233382023456",
    email: "info@bolgaprivatehospital.com",
    latitude: 10.7855,
    longitude: -0.8514,
    bedCount: 35,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: true,
    nhis: NHISCoverage.YES,
    description: "Private hospital serving the Upper East Region with quality healthcare services.",
  },
  {
    name: "Wa Private Clinic",
    type: FacilityType.CLINIC,
    tier: FacilityTier.TWO_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "UW",
    district: "Wa Municipal",
    address: "Wa Town Centre",
    phone: "+233392023456",
    email: "info@waprivateclinic.com",
    latitude: 10.0601,
    longitude: -2.5099,
    bedCount: 20,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: false,
    nhis: NHISCoverage.PARTIAL,
    description: "Private clinic providing healthcare services to the Upper West Region.",
  },
  {
    name: "Sunyani Private Hospital",
    type: FacilityType.HOSPITAL,
    tier: FacilityTier.THREE_STAR,
    ownership: FacilityOwnership.PRIVATE,
    regionCode: "BO",
    district: "Sunyani Municipal",
    address: "Sunyani Town",
    phone: "+233352023456",
    email: "info@sunyaniprivatehospital.com",
    latitude: 7.3349,
    longitude: -2.3123,
    bedCount: 40,
    hasEmergency: true,
    has24Hours: true,
    hasAmbulance: true,
    nhis: NHISCoverage.YES,
    description: "Leading private hospital in Bono Region offering comprehensive medical services.",
  },
];

// Hospital photos for private facilities
const privateHospitalPhotos = [
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800",
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800",
  "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800",
  "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800",
];

function generateLicenseNumber(): string {
  const prefix = "GHS-PVT";
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${year}-${random}`;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🏥 Seeding private facilities...");

  // Get all regions and districts
  const regions = await prisma.region.findMany({
    include: { districts: true },
  });

  if (regions.length === 0) {
    console.log("❌ No regions found. Please run the main seed first.");
    return;
  }

  // Get services for linking
  const services = await prisma.serviceTaxonomy.findMany();

  let created = 0;
  let skipped = 0;

  for (const facility of privateFacilities) {
    // Find region
    const region = regions.find(r => r.code === facility.regionCode);
    if (!region) {
      console.log(`⚠️ Region ${facility.regionCode} not found, skipping ${facility.name}`);
      skipped++;
      continue;
    }

    // Find district
    const district = region.districts.find(d => 
      d.name.toLowerCase().includes(facility.district.toLowerCase().split(" ")[0])
    );
    if (!district) {
      console.log(`⚠️ District ${facility.district} not found in ${region.name}, skipping ${facility.name}`);
      skipped++;
      continue;
    }

    // Check if facility already exists
    const existing = await prisma.facility.findFirst({
      where: { name: facility.name },
    });

    if (existing) {
      console.log(`⏭️ Facility ${facility.name} already exists, skipping`);
      skipped++;
      continue;
    }

    // Create facility
    const newFacility = await prisma.facility.create({
      data: {
        name: facility.name,
        slug: generateSlug(facility.name),
        type: facility.type as any,
        tier: facility.tier as any,
        ownership: facility.ownership as any,
        status: FacilityStatus.APPROVED as any,
        regionId: region.id,
        districtId: district.id,
        address: facility.address,
        phone: facility.phone,
        email: facility.email,
        website: facility.website || null,
        latitude: facility.latitude,
        longitude: facility.longitude,
        licenseNumber: generateLicenseNumber(),
        licenseDocumentUrl: "/licenses/private-facility-license.pdf",
        bedCount: facility.bedCount,
        emergencyCapable: facility.hasEmergency,
        ambulanceAvailable: facility.hasAmbulance,
        nhisAccepted: facility.nhis === "YES",
        description: facility.description,
        photos: [privateHospitalPhotos[Math.floor(Math.random() * privateHospitalPhotos.length)]],
      },
    });

    // Link random services based on facility type
    const serviceCount = facility.type === FacilityType.HOSPITAL ? 15 : 
                        facility.type === FacilityType.CLINIC ? 8 : 5;
    const randomServices = services
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(serviceCount, services.length));

    for (const taxonomy of randomServices) {
      await prisma.service.create({
        data: {
          facilityId: newFacility.id,
          taxonomyId: taxonomy.id,
          name: taxonomy.name,
          category: taxonomy.category,
          priceGhs: Math.floor(Math.random() * 200) + 20,
          nhisCovered: "YES",
          durationMinutes: Math.floor(Math.random() * 60) + 15,
        },
      });
    }

    console.log(`✅ Created: ${facility.name} (${facility.ownership})`);
    created++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created} private facilities`);
  console.log(`   Skipped: ${skipped} facilities`);
  console.log(`\n🎉 Private facilities seeding complete!`);
}

main()
  .catch((e) => {
    console.error("Error seeding private facilities:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
