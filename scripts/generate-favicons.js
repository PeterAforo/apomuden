const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981"/>
      <stop offset="100%" style="stop-color:#059669"/>
    </linearGradient>
  </defs>
  <circle cx="256" cy="256" r="256" fill="url(#grad)"/>
  <rect x="224" y="128" width="64" height="256" rx="12" fill="white"/>
  <rect x="128" y="224" width="256" height="64" rx="12" fill="white"/>
</svg>`;

const outputDir = path.join(__dirname, '../public/icons');

async function generateFavicons() {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const svgBuffer = Buffer.from(svgContent);

  // Generate all required sizes for PWA manifest and favicons
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'icon-72x72.png', size: 72 },
    { name: 'icon-96x96.png', size: 96 },
    { name: 'icon-128x128.png', size: 128 },
    { name: 'icon-144x144.png', size: 144 },
    { name: 'icon-152x152.png', size: 152 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192x192.png', size: 192 },
    { name: 'icon-384x384.png', size: 384 },
    { name: 'icon-512x512.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, name));
    console.log(`✅ Generated ${name}`);
  }

  // Generate ICO file (using 32x32 PNG as base)
  const ico32 = await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toBuffer();
  
  fs.writeFileSync(path.join(outputDir, 'favicon.ico'), ico32);
  console.log('✅ Generated favicon.ico');

  // Copy to public root
  fs.copyFileSync(
    path.join(outputDir, 'favicon.ico'),
    path.join(__dirname, '../public/favicon.ico')
  );
  console.log('✅ Copied favicon.ico to public root');

  console.log('\n🎉 All favicons generated successfully!');
}

generateFavicons().catch(console.error);
