import { PrismaClient, FacilityType, FacilityTier, FacilityStatus } from "@prisma/client";

const prisma = new PrismaClient();

const regions = [
  { name: "Greater Accra", code: "GA", districts: ["Accra Metropolitan", "Tema Metropolitan", "Ga East", "Ga West"] },
  { name: "Ashanti", code: "AS", districts: ["Kumasi Metropolitan", "Obuasi Municipal", "Ejisu Municipal"] },
  { name: "Western", code: "WR", districts: ["Sekondi Takoradi Metropolitan", "Tarkwa Nsuaem"] },
  { name: "Central", code: "CR", districts: ["Cape Coast Metropolitan", "Effutu Municipal"] },
  { name: "Eastern", code: "ER", districts: ["New Juaben South Municipal", "Koforidua"] },
  { name: "Volta", code: "VR", districts: ["Ho Municipal", "Hohoe Municipal"] },
  { name: "Northern", code: "NR", districts: ["Tamale Metropolitan", "Yendi Municipal"] },
  { name: "Upper East", code: "UE", districts: ["Bolgatanga Municipal", "Bawku Municipal"] },
  { name: "Upper West", code: "UW", districts: ["Wa Municipal", "Jirapa Municipal"] },
  { name: "Bono", code: "BO", districts: ["Sunyani Municipal", "Dormaa Central"] },
  { name: "Bono East", code: "BE", districts: ["Techiman Municipal", "Kintampo North"] },
  { name: "Ahafo", code: "AH", districts: ["Asunafo North"] },
  { name: "Western North", code: "WN", districts: ["Sefwi Wiawso Municipal"] },
  { name: "Oti", code: "OT", districts: ["Kadjebi", "Krachi East"] },
  { name: "Savannah", code: "SV", districts: ["Damongo", "Bole"] },
  { name: "North East", code: "NE", districts: ["Nalerigu Gambaga", "East Mamprusi"] },
];

const serviceTaxonomy = [
  { name: "General Consultation", category: "General", standardCode: "GC001" },
  { name: "Emergency Care", category: "Emergency", standardCode: "EC001" },
  { name: "Outpatient Services", category: "General", standardCode: "OP001" },
  { name: "Inpatient Services", category: "General", standardCode: "IP001" },
  { name: "Laboratory Tests", category: "Diagnostics", standardCode: "LB001" },
  { name: "X-Ray", category: "Imaging", standardCode: "XR001" },
  { name: "Ultrasound", category: "Imaging", standardCode: "US001" },
  { name: "CT Scan", category: "Imaging", standardCode: "CT001" },
  { name: "MRI", category: "Imaging", standardCode: "MR001" },
  { name: "Maternity Care", category: "Maternity", standardCode: "MT001" },
  { name: "Antenatal Care", category: "Maternity", standardCode: "AN001" },
  { name: "Delivery Services", category: "Maternity", standardCode: "DL001" },
  { name: "Postnatal Care", category: "Maternity", standardCode: "PN001" },
  { name: "Pediatric Care", category: "Pediatrics", standardCode: "PD001" },
  { name: "Immunization", category: "Preventive", standardCode: "IM001" },
  { name: "Dental Checkup", category: "Dental", standardCode: "DN001" },
  { name: "Dental Extraction", category: "Dental", standardCode: "DN002" },
  { name: "Eye Examination", category: "Ophthalmology", standardCode: "EY001" },
  { name: "Mental Health Consultation", category: "Mental Health", standardCode: "MH001" },
  { name: "Physiotherapy", category: "Rehabilitation", standardCode: "PT001" },
  { name: "Pharmacy Services", category: "Pharmacy", standardCode: "PH001" },
  { name: "Family Planning", category: "Reproductive Health", standardCode: "FP001" },
  { name: "HIV Testing", category: "HIV/AIDS", standardCode: "HV001" },
  { name: "HIV Treatment (ART)", category: "HIV/AIDS", standardCode: "HV002" },
  { name: "TB Screening", category: "Tuberculosis", standardCode: "TB001" },
  { name: "TB Treatment", category: "Tuberculosis", standardCode: "TB002" },
  { name: "Malaria Testing", category: "Infectious Disease", standardCode: "ML001" },
  { name: "Malaria Treatment", category: "Infectious Disease", standardCode: "ML002" },
  { name: "Minor Surgery", category: "Surgery", standardCode: "SG001" },
  { name: "Major Surgery", category: "Surgery", standardCode: "SG002" },
  { name: "Cardiology Consultation", category: "Cardiology", standardCode: "CD001" },
  { name: "ECG", category: "Cardiology", standardCode: "CD002" },
  { name: "Orthopedic Consultation", category: "Orthopedics", standardCode: "OR001" },
  { name: "Dermatology Consultation", category: "Dermatology", standardCode: "DR001" },
  { name: "ENT Consultation", category: "ENT", standardCode: "EN001" },
  { name: "Nutrition Counseling", category: "Nutrition", standardCode: "NT001" },
  { name: "Health Education", category: "Preventive", standardCode: "HE001" },
];

async function main() {
  console.log("🌱 Starting database seed...");

  // Seed regions and districts
  console.log("📍 Seeding regions and districts...");
  for (const regionData of regions) {
    const region = await prisma.region.upsert({
      where: { code: regionData.code },
      update: { name: regionData.name },
      create: { name: regionData.name, code: regionData.code },
    });
    
    // Create districts for this region
    for (const districtName of regionData.districts) {
      const existing = await prisma.district.findFirst({
        where: { regionId: region.id, name: districtName },
      });
      if (!existing) {
        await prisma.district.create({
          data: { name: districtName, regionId: region.id },
        });
      }
    }
  }
  console.log(`✅ Seeded ${regions.length} regions with districts`);

  // Seed service taxonomy
  console.log("🏷️ Seeding service taxonomy...");
  for (const service of serviceTaxonomy) {
    const existing = await prisma.serviceTaxonomy.findFirst({
      where: { standardCode: service.standardCode },
    });
    if (!existing) {
      await prisma.serviceTaxonomy.create({
        data: service,
      });
    }
  }
  console.log(`✅ Seeded ${serviceTaxonomy.length} service categories`);

  // Seed facilities (20 key hospitals)
  console.log("🏥 Seeding healthcare facilities...");
  const facilities = [
    { name: "Korle Bu Teaching Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FIVE_STAR, address: "Guggisberg Avenue, Korle Bu, Accra", lat: 5.5344, lng: -0.2253, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302665401", nhis: true, emergency: true, ambulance: true, beds: 2000, icu: 50, desc: "Ghana's premier teaching hospital and the third largest in Africa." },
    { name: "37 Military Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FIVE_STAR, address: "Liberation Road, Accra", lat: 5.5786, lng: -0.1869, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302776111", nhis: true, emergency: true, ambulance: true, beds: 600, icu: 30, desc: "Military hospital also serving civilians with excellent trauma care." },
    { name: "Ridge Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Castle Road, Ridge, Accra", lat: 5.5617, lng: -0.1956, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302666991", nhis: true, emergency: true, ambulance: true, beds: 420, icu: 20, desc: "Major regional hospital serving Greater Accra." },
    { name: "Tema General Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Hospital Road, Community 1, Tema", lat: 5.6698, lng: -0.0166, regionCode: "GA", district: "Tema Metropolitan", phone: "+233303212345", nhis: true, emergency: true, ambulance: true, beds: 300, icu: 12, desc: "Main hospital serving Tema and surrounding communities." },
    { name: "Nyaho Medical Centre", type: FacilityType.HOSPITAL, tier: FacilityTier.FIVE_STAR, address: "7 Tito Avenue, Airport Residential, Accra", lat: 5.6056, lng: -0.1731, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302784743", nhis: true, emergency: true, ambulance: true, beds: 100, icu: 8, desc: "Premier private hospital offering world-class healthcare." },
    { name: "Komfo Anokye Teaching Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FIVE_STAR, address: "Bantama, Kumasi", lat: 6.6967, lng: -1.6244, regionCode: "AS", district: "Kumasi Metropolitan", phone: "+233322022301", nhis: true, emergency: true, ambulance: true, beds: 1200, icu: 40, desc: "Second largest hospital in Ghana, main referral for Northern regions." },
    { name: "Obuasi Government Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Obuasi", lat: 6.2067, lng: -1.6656, regionCode: "AS", district: "Obuasi Municipal", phone: "+233322540123", nhis: true, emergency: true, ambulance: true, beds: 150, icu: 5, desc: "Main hospital serving the Obuasi mining community." },
    { name: "Effia Nkwanta Regional Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Sekondi-Takoradi", lat: 4.9344, lng: -1.7556, regionCode: "WR", district: "Sekondi Takoradi Metropolitan", phone: "+233312023456", nhis: true, emergency: true, ambulance: true, beds: 400, icu: 15, desc: "Main regional referral hospital for Western Region." },
    { name: "Cape Coast Teaching Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Cape Coast", lat: 5.1089, lng: -1.2456, regionCode: "CR", district: "Cape Coast Metropolitan", phone: "+233332132456", nhis: true, emergency: true, ambulance: true, beds: 400, icu: 20, desc: "Teaching hospital affiliated with University of Cape Coast." },
    { name: "Eastern Regional Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Koforidua", lat: 6.0944, lng: -0.2589, regionCode: "ER", district: "New Juaben South Municipal", phone: "+233342022345", nhis: true, emergency: true, ambulance: true, beds: 350, icu: 12, desc: "Main regional referral hospital for Eastern Region." },
    { name: "Ho Teaching Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Ho", lat: 6.6089, lng: 0.4678, regionCode: "VR", district: "Ho Municipal", phone: "+233362022345", nhis: true, emergency: true, ambulance: true, beds: 300, icu: 10, desc: "Teaching hospital and main referral center for Volta Region." },
    { name: "Tamale Teaching Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Tamale", lat: 9.4089, lng: -0.8389, regionCode: "NR", district: "Tamale Metropolitan", phone: "+233372022345", nhis: true, emergency: true, ambulance: true, beds: 400, icu: 15, desc: "Main teaching hospital for Northern Ghana." },
    { name: "Bolgatanga Regional Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Bolgatanga", lat: 10.7856, lng: -0.8511, regionCode: "UE", district: "Bolgatanga Municipal", phone: "+233382022345", nhis: true, emergency: true, ambulance: true, beds: 200, icu: 8, desc: "Main regional hospital for Upper East Region." },
    { name: "Wa Regional Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Wa", lat: 10.0589, lng: -2.5011, regionCode: "UW", district: "Wa Municipal", phone: "+233392022345", nhis: true, emergency: true, ambulance: true, beds: 180, icu: 6, desc: "Main regional hospital for Upper West Region." },
    { name: "Sunyani Regional Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Sunyani", lat: 7.3389, lng: -2.3278, regionCode: "BO", district: "Sunyani Municipal", phone: "+233352022345", nhis: true, emergency: true, ambulance: true, beds: 200, icu: 8, desc: "Main regional hospital for Bono Region." },
    { name: "Holy Family Hospital Techiman", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Techiman", lat: 7.5856, lng: -1.9389, regionCode: "BE", district: "Techiman Municipal", phone: "+233352044567", nhis: true, emergency: true, ambulance: true, beds: 180, icu: 6, desc: "Catholic mission hospital, main referral for Bono East." },
    { name: "Trust Hospital Osu", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Osu, Accra", lat: 5.5569, lng: -0.1789, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302761974", nhis: true, emergency: true, ambulance: true, beds: 80, icu: 6, desc: "Leading private hospital with multiple branches." },
    { name: "Lister Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Airport Residential, Accra", lat: 5.6089, lng: -0.1678, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302817700", nhis: true, emergency: true, ambulance: true, beds: 60, icu: 5, desc: "Specialist hospital known for fertility treatments." },
    { name: "Police Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Cantonments, Accra", lat: 5.5756, lng: -0.1728, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302773906", nhis: true, emergency: true, ambulance: true, beds: 200, icu: 10, desc: "Ghana Police Service hospital also serving the public." },
    { name: "Achimota Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Achimota, Accra", lat: 5.6167, lng: -0.2333, regionCode: "GA", district: "Ga East", phone: "+233302401234", nhis: true, emergency: true, ambulance: false, beds: 150, icu: 5, desc: "District hospital serving Achimota and surrounding areas." },
  ];

  const regionMap: Record<string, string> = {};
  const districtMap: Record<string, string> = {};

  // Get region and district IDs
  for (const r of regions) {
    const region = await prisma.region.findUnique({ where: { code: r.code } });
    if (region) {
      regionMap[r.code] = region.id;
      for (const d of r.districts) {
        const district = await prisma.district.findFirst({ where: { regionId: region.id, name: d } });
        if (district) districtMap[`${r.code}-${d}`] = district.id;
      }
    }
  }

  for (let i = 0; i < facilities.length; i++) {
    const f = facilities[i];
    const regionId = regionMap[f.regionCode];
    let districtId = districtMap[`${f.regionCode}-${f.district}`];
    
    if (!regionId) continue;
    if (!districtId) {
      // Create district if not exists
      const district = await prisma.district.create({
        data: { name: f.district, regionId },
      });
      districtId = district.id;
      districtMap[`${f.regionCode}-${f.district}`] = districtId;
    }

    const slug = f.name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");
    const license = `GHS-HOS-${String(i + 1).padStart(5, "0")}`;

    await prisma.facility.upsert({
      where: { slug },
      update: {},
      create: {
        name: f.name,
        slug,
        type: f.type,
        tier: f.tier,
        licenseNumber: license,
        licenseDocumentUrl: "/licenses/placeholder.pdf",
        status: FacilityStatus.APPROVED,
        address: f.address,
        latitude: f.lat,
        longitude: f.lng,
        regionId,
        districtId,
        phone: f.phone,
        nhisAccepted: f.nhis,
        emergencyCapable: f.emergency,
        ambulanceAvailable: f.ambulance,
        bedCount: f.beds,
        icuBedsAvailable: f.icu,
        description: f.desc,
        averageRating: 4.0 + Math.random(),
        totalReviews: Math.floor(Math.random() * 500) + 50,
        verifiedAt: new Date(),
        operatingHours: {
          monday: { open: "00:00", close: "23:59" },
          tuesday: { open: "00:00", close: "23:59" },
          wednesday: { open: "00:00", close: "23:59" },
          thursday: { open: "00:00", close: "23:59" },
          friday: { open: "00:00", close: "23:59" },
          saturday: { open: "00:00", close: "23:59" },
          sunday: { open: "00:00", close: "23:59" },
        },
      },
    });
  }
  console.log(`✅ Seeded ${facilities.length} healthcare facilities`);

  console.log("🎉 Database seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
