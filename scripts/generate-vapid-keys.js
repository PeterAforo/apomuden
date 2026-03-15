/**
 * Apomuden VAPID Key Generator
 * Generates VAPID keys for Web Push Notifications
 * 
 * Usage: npm run pwa:vapid
 * 
 * IMPORTANT: 
 * - Run this script ONCE to generate keys
 * - Store the keys securely in your .env files
 * - NEVER commit the private key to version control
 * - Key rotation: Generate new keys if compromised, but all existing subscriptions will become invalid
 */

const webpush = require('web-push');

console.log('🔐 Apomuden VAPID Key Generator\n');
console.log('Generating VAPID keys for Web Push Notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('═══════════════════════════════════════════════════════════════');
console.log('                    VAPID KEYS GENERATED                        ');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('📱 Add to your FRONTEND .env.local file:');
console.log('─────────────────────────────────────────');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\n`);

console.log('🔒 Add to your BACKEND .env.local file:');
console.log('─────────────────────────────────────────');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@apomuden.gov.gh\n`);

console.log('═══════════════════════════════════════════════════════════════\n');

console.log('⚠️  SECURITY WARNINGS:');
console.log('   • NEVER commit VAPID_PRIVATE_KEY to version control');
console.log('   • Add .env.local to your .gitignore file');
console.log('   • Store keys securely in your deployment environment');
console.log('   • If keys are compromised, generate new ones immediately\n');

console.log('📝 Next steps:');
console.log('   1. Copy the keys above to your .env.local file');
console.log('   2. Add the keys to your production environment variables');
console.log('   3. Restart your development server');
console.log('   4. Test push notifications in the app\n');

console.log('✅ VAPID keys generated successfully!');
