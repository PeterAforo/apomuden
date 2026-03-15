import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFacilityStats() {
  console.log('Seeding facility statistics...');

  // Get all approved facilities
  const facilities = await prisma.facility.findMany({
    where: { status: 'APPROVED' },
    select: { id: true, name: true },
  });

  if (facilities.length === 0) {
    console.log('No approved facilities found. Please add facilities first.');
    return;
  }

  console.log(`Found ${facilities.length} facilities`);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Common diseases in Ghana
  const diseases = [
    { code: 'A09', name: 'Diarrhoea and gastroenteritis' },
    { code: 'J06', name: 'Acute upper respiratory infections' },
    { code: 'B54', name: 'Malaria (unspecified)' },
    { code: 'J18', name: 'Pneumonia' },
    { code: 'A01', name: 'Typhoid fever' },
    { code: 'K29', name: 'Gastritis and duodenitis' },
    { code: 'I10', name: 'Essential hypertension' },
    { code: 'E11', name: 'Type 2 diabetes mellitus' },
    { code: 'L30', name: 'Dermatitis (skin conditions)' },
    { code: 'N39', name: 'Urinary tract infection' },
  ];

  for (const facility of facilities) {
    console.log(`Seeding stats for: ${facility.name}`);

    // Generate visit data for the last 30 days
    for (let i = 0; i < 30; i++) {
      const visitDate = new Date(currentYear, currentMonth, now.getDate() - i);
      const visitCount = Math.floor(Math.random() * 150) + 50; // 50-200 visits per day

      await prisma.$executeRaw`
        INSERT INTO facility_visits (id, facility_id, visit_date, visit_count, period_type, created_at, updated_at)
        VALUES (
          gen_random_uuid(),
          ${facility.id}::uuid,
          ${visitDate}::date,
          ${visitCount},
          'DAILY',
          NOW(),
          NOW()
        )
        ON CONFLICT (facility_id, visit_date, period_type) 
        DO UPDATE SET visit_count = ${visitCount}, updated_at = NOW()
      `;
    }

    // Generate diagnosis reports for this month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Pick 5-8 random diseases for this facility
    const shuffled = [...diseases].sort(() => 0.5 - Math.random());
    const facilityDiseases = shuffled.slice(0, Math.floor(Math.random() * 4) + 5);

    for (const disease of facilityDiseases) {
      const caseCount = Math.floor(Math.random() * 200) + 20; // 20-220 cases

      // Check if diagnosis report exists
      const existing = await prisma.diagnosisReport.findFirst({
        where: {
          facilityId: facility.id,
          diseaseCode: disease.code,
          periodStart: startOfMonth,
          periodEnd: endOfMonth,
        },
      });

      if (!existing) {
        // Get a staff user to use as submitter (or create a system user reference)
        const staffUser = await prisma.user.findFirst({
          where: { role: { in: ['FACILITY_ADMIN', 'FACILITY_STAFF', 'SUPER_ADMIN'] } },
        });

        if (staffUser) {
          await prisma.diagnosisReport.create({
            data: {
              facilityId: facility.id,
              diseaseCode: disease.code,
              diseaseName: disease.name,
              caseCount: caseCount,
              periodStart: startOfMonth,
              periodEnd: endOfMonth,
              periodType: 'MONTHLY',
              submittedById: staffUser.id,
              demographics: {
                male: Math.floor(caseCount * 0.45),
                female: Math.floor(caseCount * 0.55),
                children: Math.floor(caseCount * 0.3),
                adults: Math.floor(caseCount * 0.6),
                elderly: Math.floor(caseCount * 0.1),
              },
            },
          });
        }
      }
    }
  }

  console.log('Facility statistics seeded successfully!');
}

seedFacilityStats()
  .catch((e) => {
    console.error('Error seeding stats:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
