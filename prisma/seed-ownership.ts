import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define ownership based on facility names
const PRIVATE_FACILITIES = [
  'Nyaho', 'Trust Hospital', 'Lister', 'Medlab', 'Akai House', 'Rabito',
  'Spectra', 'Euracare', 'Airport Clinic', 'Cocoa Clinic'
];

const MISSION_FACILITIES = [
  'Presbyterian', 'Catholic', 'Methodist', 'Baptist', 'Holy Family',
  'Adventist', 'Lutheran', 'Anglican', 'Christian', 'SDA', 'Mission'
];

const QUASI_GOVERNMENT_FACILITIES = [
  'Military', 'Police', 'SSNIT', 'Cocoa Board', 'University'
];

async function seedOwnership() {
  console.log('Updating facility ownership...');

  const facilities = await prisma.facility.findMany({
    select: { id: true, name: true },
  });

  console.log(`Found ${facilities.length} facilities`);

  for (const facility of facilities) {
    const name = facility.name.toLowerCase();
    let ownership = 'PUBLIC'; // Default

    // Check for private facilities
    if (PRIVATE_FACILITIES.some(p => name.includes(p.toLowerCase()))) {
      ownership = 'PRIVATE';
    }
    // Check for mission facilities
    else if (MISSION_FACILITIES.some(m => name.includes(m.toLowerCase()))) {
      ownership = 'MISSION';
    }
    // Check for quasi-government facilities
    else if (QUASI_GOVERNMENT_FACILITIES.some(q => name.includes(q.toLowerCase()))) {
      ownership = 'QUASI_GOVERNMENT';
    }

    await prisma.facility.update({
      where: { id: facility.id },
      data: { ownership: ownership as any },
    });

    console.log(`${facility.name}: ${ownership}`);
  }

  console.log('Ownership update complete!');
}

seedOwnership()
  .catch((e) => {
    console.error('Error updating ownership:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
