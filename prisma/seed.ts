import { PrismaClient, FacilityType, FacilityTier, FacilityStatus, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

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

  // Seed test admin users
  console.log("👤 Seeding admin users...");
  const adminPassword = await hash("Admin@123", 12);
  
  const adminUsers = [
    {
      email: "admin@apomuden.gov.gh",
      phone: "+233200000001",
      name: "Super Admin",
      role: UserRole.SUPER_ADMIN,
    },
    {
      email: "ministry@apomuden.gov.gh",
      phone: "+233200000002",
      name: "Ministry Admin",
      role: UserRole.MINISTRY_ADMIN,
    },
    {
      email: "analyst@apomuden.gov.gh",
      phone: "+233200000003",
      name: "Health Analyst",
      role: UserRole.ANALYST,
    },
  ];

  for (const admin of adminUsers) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        phone: admin.phone,
        name: admin.name,
        role: admin.role,
        passwordHash: adminPassword,
        isVerified: true,
      },
    });
  }
  console.log(`✅ Seeded ${adminUsers.length} admin users`);

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

  // Seed facilities (100+ hospitals across Ghana)
  console.log("🏥 Seeding healthcare facilities...");
  const facilities = [
    // === GREATER ACCRA REGION ===
    { name: "Korle Bu Teaching Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FIVE_STAR, address: "Guggisberg Avenue, Korle Bu, Accra", lat: 5.5344, lng: -0.2253, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302665401", nhis: true, emergency: true, ambulance: true, beds: 2000, icu: 50, desc: "Ghana's premier teaching hospital and the third largest in Africa." },
    { name: "37 Military Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FIVE_STAR, address: "Liberation Road, Accra", lat: 5.5786, lng: -0.1869, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302776111", nhis: true, emergency: true, ambulance: true, beds: 600, icu: 30, desc: "Military hospital also serving civilians with excellent trauma care." },
    { name: "Ridge Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Castle Road, Ridge, Accra", lat: 5.5617, lng: -0.1956, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302666991", nhis: true, emergency: true, ambulance: true, beds: 420, icu: 20, desc: "Major regional hospital serving Greater Accra." },
    { name: "Tema General Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Hospital Road, Community 1, Tema", lat: 5.6698, lng: -0.0166, regionCode: "GA", district: "Tema Metropolitan", phone: "+233303212345", nhis: true, emergency: true, ambulance: true, beds: 300, icu: 12, desc: "Main hospital serving Tema and surrounding communities." },
    { name: "Nyaho Medical Centre", type: FacilityType.HOSPITAL, tier: FacilityTier.FIVE_STAR, address: "7 Tito Avenue, Airport Residential, Accra", lat: 5.6056, lng: -0.1731, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302784743", nhis: true, emergency: true, ambulance: true, beds: 100, icu: 8, desc: "Premier private hospital offering world-class healthcare." },
    { name: "Trust Hospital Osu", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Osu, Accra", lat: 5.5569, lng: -0.1789, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302761974", nhis: true, emergency: true, ambulance: true, beds: 80, icu: 6, desc: "Leading private hospital with multiple branches." },
    { name: "Lister Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Airport Residential, Accra", lat: 5.6089, lng: -0.1678, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302817700", nhis: true, emergency: true, ambulance: true, beds: 60, icu: 5, desc: "Specialist hospital known for fertility treatments." },
    { name: "Police Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Cantonments, Accra", lat: 5.5756, lng: -0.1728, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302773906", nhis: true, emergency: true, ambulance: true, beds: 200, icu: 10, desc: "Ghana Police Service hospital also serving the public." },
    { name: "Achimota Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Achimota, Accra", lat: 5.6167, lng: -0.2333, regionCode: "GA", district: "Ga East", phone: "+233302401234", nhis: true, emergency: true, ambulance: false, beds: 150, icu: 5, desc: "District hospital serving Achimota and surrounding areas." },
    { name: "La General Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "La, Accra", lat: 5.5478, lng: -0.1567, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302772345", nhis: true, emergency: true, ambulance: true, beds: 120, icu: 4, desc: "District hospital serving La and surrounding communities." },
    { name: "Mamprobi Polyclinic", type: FacilityType.POLYCLINIC, tier: FacilityTier.THREE_STAR, address: "Mamprobi, Accra", lat: 5.5389, lng: -0.2178, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302234567", nhis: true, emergency: true, ambulance: false, beds: 50, icu: 2, desc: "Polyclinic serving Mamprobi and Korle Gonno areas." },
    { name: "Kaneshie Polyclinic", type: FacilityType.POLYCLINIC, tier: FacilityTier.THREE_STAR, address: "Kaneshie, Accra", lat: 5.5656, lng: -0.2289, regionCode: "GA", district: "Accra Metropolitan", phone: "+233302223456", nhis: true, emergency: true, ambulance: false, beds: 40, icu: 2, desc: "Polyclinic serving Kaneshie and surrounding areas." },
    { name: "Weija-Gbawe Municipal Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Weija, Accra", lat: 5.5567, lng: -0.3156, regionCode: "GA", district: "Ga West", phone: "+233302345678", nhis: true, emergency: true, ambulance: true, beds: 100, icu: 4, desc: "Municipal hospital serving Weija-Gbawe area." },
    { name: "Ashaiman Polyclinic", type: FacilityType.POLYCLINIC, tier: FacilityTier.THREE_STAR, address: "Ashaiman", lat: 5.6889, lng: -0.0289, regionCode: "GA", district: "Tema Metropolitan", phone: "+233303234567", nhis: true, emergency: true, ambulance: false, beds: 60, icu: 2, desc: "Polyclinic serving Ashaiman community." },
    { name: "Dodowa District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Dodowa", lat: 5.8789, lng: -0.0978, regionCode: "GA", district: "Ga East", phone: "+233302456789", nhis: true, emergency: true, ambulance: true, beds: 80, icu: 3, desc: "District hospital serving Dodowa and surrounding areas." },
    { name: "Prampram Health Centre", type: FacilityType.HEALTH_CENTRE, tier: FacilityTier.TWO_STAR, address: "Prampram", lat: 5.7178, lng: 0.1089, regionCode: "GA", district: "Ga East", phone: "+233302567890", nhis: true, emergency: false, ambulance: false, beds: 20, icu: 0, desc: "Health centre serving Prampram fishing community." },
    
    // === ASHANTI REGION ===
    { name: "Komfo Anokye Teaching Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FIVE_STAR, address: "Bantama, Kumasi", lat: 6.6967, lng: -1.6244, regionCode: "AS", district: "Kumasi Metropolitan", phone: "+233322022301", nhis: true, emergency: true, ambulance: true, beds: 1200, icu: 40, desc: "Second largest hospital in Ghana, main referral for Northern regions." },
    { name: "Obuasi Government Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Obuasi", lat: 6.2067, lng: -1.6656, regionCode: "AS", district: "Obuasi Municipal", phone: "+233322540123", nhis: true, emergency: true, ambulance: true, beds: 150, icu: 5, desc: "Main hospital serving the Obuasi mining community." },
    { name: "Manhyia District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Manhyia, Kumasi", lat: 6.7089, lng: -1.6178, regionCode: "AS", district: "Kumasi Metropolitan", phone: "+233322034567", nhis: true, emergency: true, ambulance: true, beds: 100, icu: 4, desc: "District hospital in the heart of Kumasi." },
    { name: "Tafo Government Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Tafo, Kumasi", lat: 6.7278, lng: -1.5889, regionCode: "AS", district: "Kumasi Metropolitan", phone: "+233322045678", nhis: true, emergency: true, ambulance: true, beds: 80, icu: 3, desc: "Government hospital serving Tafo area." },
    { name: "Ejisu Government Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Ejisu", lat: 6.6889, lng: -1.4567, regionCode: "AS", district: "Ejisu Municipal", phone: "+233322056789", nhis: true, emergency: true, ambulance: true, beds: 100, icu: 4, desc: "District hospital serving Ejisu-Juaben area." },
    { name: "Bekwai Municipal Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Bekwai", lat: 6.4567, lng: -1.5789, regionCode: "AS", district: "Obuasi Municipal", phone: "+233322067890", nhis: true, emergency: true, ambulance: true, beds: 80, icu: 3, desc: "Municipal hospital serving Bekwai area." },
    { name: "Mampong Municipal Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Mampong", lat: 7.0678, lng: -1.4056, regionCode: "AS", district: "Kumasi Metropolitan", phone: "+233322078901", nhis: true, emergency: true, ambulance: true, beds: 100, icu: 4, desc: "Municipal hospital serving Mampong area." },
    { name: "Konongo-Odumase Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Konongo", lat: 6.6178, lng: -1.2289, regionCode: "AS", district: "Obuasi Municipal", phone: "+233322089012", nhis: true, emergency: true, ambulance: true, beds: 80, icu: 3, desc: "Hospital serving Konongo mining area." },
    { name: "Agogo Presbyterian Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Agogo", lat: 6.8089, lng: -1.0789, regionCode: "AS", district: "Obuasi Municipal", phone: "+233322090123", nhis: true, emergency: true, ambulance: true, beds: 120, icu: 5, desc: "Mission hospital with excellent maternal care." },
    
    // === WESTERN REGION ===
    { name: "Effia Nkwanta Regional Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Sekondi-Takoradi", lat: 4.9344, lng: -1.7556, regionCode: "WR", district: "Sekondi Takoradi Metropolitan", phone: "+233312023456", nhis: true, emergency: true, ambulance: true, beds: 400, icu: 15, desc: "Main regional referral hospital for Western Region." },
    { name: "Tarkwa Municipal Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Tarkwa", lat: 5.3044, lng: -1.9944, regionCode: "WR", district: "Tarkwa Nsuaem", phone: "+233312034567", nhis: true, emergency: true, ambulance: true, beds: 150, icu: 6, desc: "Hospital serving the Tarkwa mining community." },
    { name: "Axim Government Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Axim", lat: 4.8667, lng: -2.2389, regionCode: "WR", district: "Sekondi Takoradi Metropolitan", phone: "+233312045678", nhis: true, emergency: true, ambulance: true, beds: 80, icu: 3, desc: "Coastal hospital serving Axim and fishing communities." },
    { name: "Prestea Government Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Prestea", lat: 5.4333, lng: -2.1444, regionCode: "WR", district: "Tarkwa Nsuaem", phone: "+233312056789", nhis: true, emergency: true, ambulance: true, beds: 60, icu: 2, desc: "Hospital serving Prestea mining area." },
    { name: "Elubo Health Centre", type: FacilityType.HEALTH_CENTRE, tier: FacilityTier.TWO_STAR, address: "Elubo", lat: 5.2556, lng: -2.7778, regionCode: "WR", district: "Sekondi Takoradi Metropolitan", phone: "+233312067890", nhis: true, emergency: false, ambulance: false, beds: 20, icu: 0, desc: "Border town health centre." },
    
    // === CENTRAL REGION ===
    { name: "Cape Coast Teaching Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Cape Coast", lat: 5.1089, lng: -1.2456, regionCode: "CR", district: "Cape Coast Metropolitan", phone: "+233332132456", nhis: true, emergency: true, ambulance: true, beds: 400, icu: 20, desc: "Teaching hospital affiliated with University of Cape Coast." },
    { name: "Winneba Municipal Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Winneba", lat: 5.3511, lng: -0.6256, regionCode: "CR", district: "Effutu Municipal", phone: "+233332143567", nhis: true, emergency: true, ambulance: true, beds: 100, icu: 4, desc: "Municipal hospital serving Winneba and surrounding areas." },
    { name: "Saltpond Government Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Saltpond", lat: 5.2089, lng: -1.0611, regionCode: "CR", district: "Cape Coast Metropolitan", phone: "+233332154678", nhis: true, emergency: true, ambulance: true, beds: 80, icu: 3, desc: "Coastal hospital serving Saltpond area." },
    { name: "Swedru Municipal Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Swedru", lat: 5.5333, lng: -0.6944, regionCode: "CR", district: "Effutu Municipal", phone: "+233332165789", nhis: true, emergency: true, ambulance: true, beds: 100, icu: 4, desc: "Municipal hospital serving Agona Swedru." },
    { name: "Elmina Urban Health Centre", type: FacilityType.HEALTH_CENTRE, tier: FacilityTier.TWO_STAR, address: "Elmina", lat: 5.0844, lng: -1.3478, regionCode: "CR", district: "Cape Coast Metropolitan", phone: "+233332176890", nhis: true, emergency: false, ambulance: false, beds: 30, icu: 0, desc: "Health centre in historic Elmina town." },
    
    // === EASTERN REGION ===
    { name: "Eastern Regional Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Koforidua", lat: 6.0944, lng: -0.2589, regionCode: "ER", district: "New Juaben South Municipal", phone: "+233342022345", nhis: true, emergency: true, ambulance: true, beds: 350, icu: 12, desc: "Main regional referral hospital for Eastern Region." },
    { name: "Nsawam Government Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Nsawam", lat: 5.8089, lng: -0.3511, regionCode: "ER", district: "New Juaben South Municipal", phone: "+233342033456", nhis: true, emergency: true, ambulance: true, beds: 100, icu: 4, desc: "Hospital serving Nsawam and surrounding areas." },
    { name: "Akuapem Ridge Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Akropong", lat: 5.9756, lng: -0.0889, regionCode: "ER", district: "New Juaben South Municipal", phone: "+233342044567", nhis: true, emergency: true, ambulance: true, beds: 80, icu: 3, desc: "Hospital serving Akuapem Ridge communities." },
    { name: "Nkawkaw Holy Family Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Nkawkaw", lat: 6.5511, lng: -0.7678, regionCode: "ER", district: "Koforidua", phone: "+233342055678", nhis: true, emergency: true, ambulance: true, beds: 120, icu: 5, desc: "Catholic mission hospital with excellent services." },
    { name: "Oda Government Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Oda", lat: 5.9256, lng: -0.9844, regionCode: "ER", district: "New Juaben South Municipal", phone: "+233342066789", nhis: true, emergency: true, ambulance: true, beds: 80, icu: 3, desc: "District hospital serving Birim Central area." },
    { name: "Somanya District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Somanya", lat: 6.1044, lng: 0.0178, regionCode: "ER", district: "New Juaben South Municipal", phone: "+233342077890", nhis: true, emergency: true, ambulance: true, beds: 60, icu: 2, desc: "District hospital serving Yilo Krobo area." },
    
    // === VOLTA REGION ===
    { name: "Ho Teaching Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Ho", lat: 6.6089, lng: 0.4678, regionCode: "VR", district: "Ho Municipal", phone: "+233362022345", nhis: true, emergency: true, ambulance: true, beds: 300, icu: 10, desc: "Teaching hospital and main referral center for Volta Region." },
    { name: "Hohoe Municipal Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Hohoe", lat: 7.1511, lng: 0.4733, regionCode: "VR", district: "Hohoe Municipal", phone: "+233362033456", nhis: true, emergency: true, ambulance: true, beds: 120, icu: 5, desc: "Municipal hospital serving Hohoe and surrounding areas." },
    { name: "Keta Municipal Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Keta", lat: 5.9178, lng: 0.9889, regionCode: "VR", district: "Ho Municipal", phone: "+233362044567", nhis: true, emergency: true, ambulance: true, beds: 100, icu: 4, desc: "Coastal hospital serving Keta lagoon area." },
    { name: "Kpando District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Kpando", lat: 6.9956, lng: 0.2944, regionCode: "VR", district: "Ho Municipal", phone: "+233362055678", nhis: true, emergency: true, ambulance: true, beds: 80, icu: 3, desc: "District hospital serving Kpando area." },
    { name: "Aflao Health Centre", type: FacilityType.HEALTH_CENTRE, tier: FacilityTier.TWO_STAR, address: "Aflao", lat: 6.1178, lng: 1.1944, regionCode: "VR", district: "Ho Municipal", phone: "+233362066789", nhis: true, emergency: false, ambulance: false, beds: 30, icu: 0, desc: "Border town health centre." },
    
    // === NORTHERN REGION ===
    { name: "Tamale Teaching Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.FOUR_STAR, address: "Tamale", lat: 9.4089, lng: -0.8389, regionCode: "NR", district: "Tamale Metropolitan", phone: "+233372022345", nhis: true, emergency: true, ambulance: true, beds: 400, icu: 15, desc: "Main teaching hospital for Northern Ghana." },
    { name: "Yendi Municipal Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Yendi", lat: 9.4444, lng: -0.0111, regionCode: "NR", district: "Yendi Municipal", phone: "+233372033456", nhis: true, emergency: true, ambulance: true, beds: 100, icu: 4, desc: "Municipal hospital serving Yendi and Dagbon area." },
    { name: "Savelugu Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Savelugu", lat: 9.6244, lng: -0.8256, regionCode: "NR", district: "Tamale Metropolitan", phone: "+233372044567", nhis: true, emergency: true, ambulance: true, beds: 60, icu: 2, desc: "District hospital serving Savelugu-Nanton area." },
    { name: "Bimbilla District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Bimbilla", lat: 8.8511, lng: 0.0489, regionCode: "NR", district: "Yendi Municipal", phone: "+233372055678", nhis: true, emergency: true, ambulance: true, beds: 50, icu: 2, desc: "District hospital serving Nanumba area." },
    { name: "Walewale District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Walewale", lat: 10.3578, lng: -0.8044, regionCode: "NR", district: "Tamale Metropolitan", phone: "+233372066789", nhis: true, emergency: true, ambulance: true, beds: 50, icu: 2, desc: "District hospital serving West Mamprusi area." },
    
    // === UPPER EAST REGION ===
    { name: "Bolgatanga Regional Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Bolgatanga", lat: 10.7856, lng: -0.8511, regionCode: "UE", district: "Bolgatanga Municipal", phone: "+233382022345", nhis: true, emergency: true, ambulance: true, beds: 200, icu: 8, desc: "Main regional hospital for Upper East Region." },
    { name: "Bawku Presbyterian Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Bawku", lat: 11.0611, lng: -0.2411, regionCode: "UE", district: "Bawku Municipal", phone: "+233382033456", nhis: true, emergency: true, ambulance: true, beds: 150, icu: 6, desc: "Mission hospital serving Bawku and border communities." },
    { name: "Navrongo War Memorial Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Navrongo", lat: 10.8944, lng: -1.0922, regionCode: "UE", district: "Bolgatanga Municipal", phone: "+233382044567", nhis: true, emergency: true, ambulance: true, beds: 120, icu: 5, desc: "Historic hospital serving Kassena-Nankana area." },
    { name: "Zebilla District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Zebilla", lat: 10.8978, lng: -0.4711, regionCode: "UE", district: "Bawku Municipal", phone: "+233382055678", nhis: true, emergency: true, ambulance: true, beds: 50, icu: 2, desc: "District hospital serving Bawku West area." },
    { name: "Sandema District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Sandema", lat: 10.6244, lng: -1.0578, regionCode: "UE", district: "Bolgatanga Municipal", phone: "+233382066789", nhis: true, emergency: true, ambulance: true, beds: 50, icu: 2, desc: "District hospital serving Builsa area." },
    
    // === UPPER WEST REGION ===
    { name: "Wa Regional Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Wa", lat: 10.0589, lng: -2.5011, regionCode: "UW", district: "Wa Municipal", phone: "+233392022345", nhis: true, emergency: true, ambulance: true, beds: 180, icu: 6, desc: "Main regional hospital for Upper West Region." },
    { name: "Jirapa District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Jirapa", lat: 10.7889, lng: -2.5578, regionCode: "UW", district: "Jirapa Municipal", phone: "+233392033456", nhis: true, emergency: true, ambulance: true, beds: 80, icu: 3, desc: "District hospital serving Jirapa area." },
    { name: "Lawra District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Lawra", lat: 10.6378, lng: -2.9044, regionCode: "UW", district: "Jirapa Municipal", phone: "+233392044567", nhis: true, emergency: true, ambulance: true, beds: 60, icu: 2, desc: "District hospital serving Lawra area." },
    { name: "Nandom District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Nandom", lat: 10.8544, lng: -2.7578, regionCode: "UW", district: "Jirapa Municipal", phone: "+233392055678", nhis: true, emergency: true, ambulance: true, beds: 50, icu: 2, desc: "District hospital serving Nandom area." },
    { name: "Tumu District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Tumu", lat: 10.8844, lng: -1.9789, regionCode: "UW", district: "Wa Municipal", phone: "+233392066789", nhis: true, emergency: true, ambulance: true, beds: 50, icu: 2, desc: "District hospital serving Sissala area." },
    
    // === BONO REGION ===
    { name: "Sunyani Regional Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Sunyani", lat: 7.3389, lng: -2.3278, regionCode: "BO", district: "Sunyani Municipal", phone: "+233352022345", nhis: true, emergency: true, ambulance: true, beds: 200, icu: 8, desc: "Main regional hospital for Bono Region." },
    { name: "Berekum Holy Family Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Berekum", lat: 7.4511, lng: -2.5844, regionCode: "BO", district: "Sunyani Municipal", phone: "+233352033456", nhis: true, emergency: true, ambulance: true, beds: 150, icu: 6, desc: "Catholic mission hospital with excellent services." },
    { name: "Dormaa Presbyterian Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Dormaa Ahenkro", lat: 7.3578, lng: -2.9611, regionCode: "BO", district: "Dormaa Central", phone: "+233352044567", nhis: true, emergency: true, ambulance: true, beds: 120, icu: 5, desc: "Mission hospital serving Dormaa area." },
    { name: "Wenchi Methodist Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Wenchi", lat: 7.7378, lng: -2.1044, regionCode: "BO", district: "Sunyani Municipal", phone: "+233352055678", nhis: true, emergency: true, ambulance: true, beds: 80, icu: 3, desc: "Methodist mission hospital serving Wenchi area." },
    
    // === BONO EAST REGION ===
    { name: "Holy Family Hospital Techiman", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Techiman", lat: 7.5856, lng: -1.9389, regionCode: "BE", district: "Techiman Municipal", phone: "+233352044567", nhis: true, emergency: true, ambulance: true, beds: 180, icu: 6, desc: "Catholic mission hospital, main referral for Bono East." },
    { name: "Kintampo Municipal Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Kintampo", lat: 8.0578, lng: -1.7289, regionCode: "BE", district: "Kintampo North", phone: "+233352055678", nhis: true, emergency: true, ambulance: true, beds: 100, icu: 4, desc: "Municipal hospital serving Kintampo area." },
    { name: "Nkoranza District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Nkoranza", lat: 7.5511, lng: -1.7044, regionCode: "BE", district: "Techiman Municipal", phone: "+233352066789", nhis: true, emergency: true, ambulance: true, beds: 60, icu: 2, desc: "District hospital serving Nkoranza area." },
    { name: "Atebubu District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Atebubu", lat: 7.7511, lng: -0.9844, regionCode: "BE", district: "Kintampo North", phone: "+233352077890", nhis: true, emergency: true, ambulance: true, beds: 50, icu: 2, desc: "District hospital serving Atebubu-Amantin area." },
    
    // === AHAFO REGION ===
    { name: "Goaso Government Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Goaso", lat: 6.8044, lng: -2.5178, regionCode: "AH", district: "Asunafo North", phone: "+233352088901", nhis: true, emergency: true, ambulance: true, beds: 100, icu: 4, desc: "Main hospital for Ahafo Region." },
    { name: "Hwidiem District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Hwidiem", lat: 6.9378, lng: -2.3844, regionCode: "AH", district: "Asunafo North", phone: "+233352099012", nhis: true, emergency: true, ambulance: true, beds: 50, icu: 2, desc: "District hospital serving Asutifi area." },
    { name: "Duayaw Nkwanta Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Duayaw Nkwanta", lat: 6.9844, lng: -2.1178, regionCode: "AH", district: "Asunafo North", phone: "+233352100123", nhis: true, emergency: true, ambulance: true, beds: 50, icu: 2, desc: "District hospital serving Tano North area." },
    
    // === WESTERN NORTH REGION ===
    { name: "Sefwi Wiawso Government Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Sefwi Wiawso", lat: 6.2044, lng: -2.4878, regionCode: "WN", district: "Sefwi Wiawso Municipal", phone: "+233312078901", nhis: true, emergency: true, ambulance: true, beds: 100, icu: 4, desc: "Main hospital for Western North Region." },
    { name: "Bibiani Government Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Bibiani", lat: 6.4644, lng: -2.3244, regionCode: "WN", district: "Sefwi Wiawso Municipal", phone: "+233312089012", nhis: true, emergency: true, ambulance: true, beds: 80, icu: 3, desc: "Hospital serving Bibiani mining area." },
    { name: "Enchi District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Enchi", lat: 5.8378, lng: -2.8244, regionCode: "WN", district: "Sefwi Wiawso Municipal", phone: "+233312090123", nhis: true, emergency: true, ambulance: true, beds: 60, icu: 2, desc: "District hospital serving Aowin area." },
    
    // === OTI REGION ===
    { name: "Dambai District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Dambai", lat: 8.0711, lng: 0.1778, regionCode: "OT", district: "Krachi East", phone: "+233362077890", nhis: true, emergency: true, ambulance: true, beds: 60, icu: 2, desc: "District hospital serving Krachi East area." },
    { name: "Kadjebi District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Kadjebi", lat: 7.4678, lng: 0.5044, regionCode: "OT", district: "Kadjebi", phone: "+233362088901", nhis: true, emergency: true, ambulance: true, beds: 50, icu: 2, desc: "District hospital serving Kadjebi area." },
    { name: "Nkwanta District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Nkwanta", lat: 8.2578, lng: 0.5178, regionCode: "OT", district: "Kadjebi", phone: "+233362099012", nhis: true, emergency: true, ambulance: true, beds: 50, icu: 2, desc: "District hospital serving Nkwanta area." },
    
    // === SAVANNAH REGION ===
    { name: "Damongo District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Damongo", lat: 9.0844, lng: -1.8178, regionCode: "SV", district: "Damongo", phone: "+233372077890", nhis: true, emergency: true, ambulance: true, beds: 80, icu: 3, desc: "Main hospital for Savannah Region." },
    { name: "Bole District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Bole", lat: 9.0344, lng: -2.4844, regionCode: "SV", district: "Bole", phone: "+233372088901", nhis: true, emergency: true, ambulance: true, beds: 50, icu: 2, desc: "District hospital serving Bole area." },
    { name: "Salaga District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Salaga", lat: 8.5511, lng: -0.5178, regionCode: "SV", district: "Damongo", phone: "+233372099012", nhis: true, emergency: true, ambulance: true, beds: 50, icu: 2, desc: "District hospital serving East Gonja area." },
    
    // === NORTH EAST REGION ===
    { name: "Nalerigu Baptist Medical Centre", type: FacilityType.HOSPITAL, tier: FacilityTier.THREE_STAR, address: "Nalerigu", lat: 10.5244, lng: -0.3678, regionCode: "NE", district: "Nalerigu Gambaga", phone: "+233372100123", nhis: true, emergency: true, ambulance: true, beds: 100, icu: 4, desc: "Mission hospital and main referral for North East Region." },
    { name: "Gambaga District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Gambaga", lat: 10.5311, lng: -0.4378, regionCode: "NE", district: "Nalerigu Gambaga", phone: "+233372111234", nhis: true, emergency: true, ambulance: true, beds: 50, icu: 2, desc: "District hospital serving Gambaga area." },
    { name: "Chereponi District Hospital", type: FacilityType.HOSPITAL, tier: FacilityTier.TWO_STAR, address: "Chereponi", lat: 10.0711, lng: 0.2378, regionCode: "NE", district: "East Mamprusi", phone: "+233372122345", nhis: true, emergency: true, ambulance: true, beds: 40, icu: 1, desc: "District hospital serving Chereponi area." },
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
