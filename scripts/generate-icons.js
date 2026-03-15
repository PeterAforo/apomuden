/**
 * Apomuden PWA Icon Generator
 * Generates all required icon sizes for PWA including maskable icons
 * 
 * Usage: npm run pwa:icons
 * Requires: sharp (already in devDependencies)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const SOURCE_ICON = path.join(__dirname, '../public/icons/icon-512x512.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');
const SCREENSHOTS_DIR = path.join(__dirname, '../public/screenshots');

// Brand colors
const BRAND_COLOR = '#059669';
const BACKGROUND_COLOR = '#ffffff';

// Icon sizes to generate
const ICON_SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const APPLE_TOUCH_SIZES = [57, 60, 72, 76, 114, 120, 144, 152, 167, 180];
const MASKABLE_SIZES = [192, 512];

// Ensure directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function generateIcons() {
  console.log('🎨 Apomuden PWA Icon Generator\n');

  // Check if source icon exists
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error('❌ Source icon not found:', SOURCE_ICON);
    console.log('Please place a 512x512 PNG icon at:', SOURCE_ICON);
    process.exit(1);
  }

  console.log('📁 Source:', SOURCE_ICON);
  console.log('📁 Output:', OUTPUT_DIR);
  console.log('');

  // Generate standard icons
  console.log('🔧 Generating standard icons...');
  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    await sharp(SOURCE_ICON)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(outputPath);
    console.log(`   ✅ icon-${size}x${size}.png`);
  }

  // Generate maskable icons (with safe zone padding)
  console.log('\n🔧 Generating maskable icons...');
  for (const size of MASKABLE_SIZES) {
    const padding = Math.floor(size * 0.1); // 10% padding for safe zone
    const innerSize = size - (padding * 2);
    const outputPath = path.join(OUTPUT_DIR, `icon-maskable-${size}x${size}.png`);
    
    // Create a background with brand color
    const background = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BRAND_COLOR
      }
    }).png().toBuffer();

    // Resize the icon to fit within safe zone
    const resizedIcon = await sharp(SOURCE_ICON)
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    // Composite the icon onto the background
    await sharp(background)
      .composite([{
        input: resizedIcon,
        gravity: 'center'
      }])
      .png()
      .toFile(outputPath);
    
    console.log(`   ✅ icon-maskable-${size}x${size}.png`);
  }

  // Generate Apple touch icons
  console.log('\n🍎 Generating Apple touch icons...');
  const appleTouchPath = path.join(OUTPUT_DIR, 'apple-touch-icon.png');
  await sharp(SOURCE_ICON)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(appleTouchPath);
  console.log('   ✅ apple-touch-icon.png (180x180)');

  // Generate favicon sizes
  console.log('\n🔖 Generating favicons...');
  const faviconSizes = [16, 32, 48];
  for (const size of faviconSizes) {
    const outputPath = path.join(OUTPUT_DIR, `favicon-${size}x${size}.png`);
    await sharp(SOURCE_ICON)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`   ✅ favicon-${size}x${size}.png`);
  }

  // Generate placeholder screenshots
  console.log('\n📱 Generating placeholder screenshots...');
  
  // Mobile screenshot placeholder
  const mobileScreenshot = path.join(SCREENSHOTS_DIR, 'screenshot-mobile.png');
  await sharp({
    create: {
      width: 390,
      height: 844,
      channels: 4,
      background: BRAND_COLOR
    }
  })
  .composite([{
    input: Buffer.from(`
      <svg width="390" height="844">
        <rect width="390" height="844" fill="${BRAND_COLOR}"/>
        <text x="195" y="400" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">Apomuden</text>
        <text x="195" y="440" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" opacity="0.8">Mobile Screenshot</text>
      </svg>
    `),
    top: 0,
    left: 0
  }])
  .png()
  .toFile(mobileScreenshot);
  console.log('   ✅ screenshot-mobile.png (390x844)');

  // Desktop screenshot placeholder
  const desktopScreenshot = path.join(SCREENSHOTS_DIR, 'screenshot-desktop.png');
  await sharp({
    create: {
      width: 1280,
      height: 800,
      channels: 4,
      background: BRAND_COLOR
    }
  })
  .composite([{
    input: Buffer.from(`
      <svg width="1280" height="800">
        <rect width="1280" height="800" fill="${BRAND_COLOR}"/>
        <text x="640" y="380" font-family="Arial, sans-serif" font-size="36" fill="white" text-anchor="middle">Apomuden Health Portal</text>
        <text x="640" y="430" font-family="Arial, sans-serif" font-size="18" fill="white" text-anchor="middle" opacity="0.8">Desktop Screenshot</text>
      </svg>
    `),
    top: 0,
    left: 0
  }])
  .png()
  .toFile(desktopScreenshot);
  console.log('   ✅ screenshot-desktop.png (1280x800)');

  console.log('\n✨ All icons generated successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Replace placeholder screenshots with actual app screenshots');
  console.log('   2. Run: npm run build');
  console.log('   3. Test PWA installation in Chrome DevTools > Application > Manifest');
}

generateIcons().catch((error) => {
  console.error('❌ Error generating icons:', error);
  process.exit(1);
});
