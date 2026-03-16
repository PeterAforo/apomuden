// Multilingual translations for OneHealthGH
// Supported languages: English, Twi, Ga, Ewe, Hausa

export type Language = 'en' | 'tw' | 'ga' | 'ee' | 'ha';

export const LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'tw', name: 'Twi', nativeName: 'Twi' },
  { code: 'ga', name: 'Ga', nativeName: 'Gã' },
  { code: 'ee', name: 'Ewe', nativeName: 'Eʋegbe' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
];

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.facilities': 'Find Facilities',
    'nav.ambulance': 'Ambulance',
    'nav.emergency': 'Emergency',
    'nav.alerts': 'Health Alerts',
    'nav.news': 'News',
    'nav.compare': 'Compare',
    'nav.about': 'About',
    'nav.login': 'Sign In',
    'nav.register': 'Register',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.logout': 'Sign Out',

    // Common
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.close': 'Close',
    'common.view': 'View',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.yes': 'Yes',
    'common.no': 'No',

    // Home Page
    'home.title': 'Find Healthcare Near You',
    'home.subtitle': 'Access quality healthcare facilities across Ghana',
    'home.search_placeholder': 'Search facilities, services, or locations...',
    'home.find_facilities': 'Find Facilities',
    'home.emergency_help': 'Emergency Help',
    'home.check_symptoms': 'Check Symptoms',

    // Facilities
    'facilities.title': 'Healthcare Facilities',
    'facilities.search_placeholder': 'Search by name or location',
    'facilities.filter_region': 'Filter by Region',
    'facilities.filter_type': 'Filter by Type',
    'facilities.no_results': 'No facilities found',
    'facilities.nhis_accepted': 'NHIS Accepted',
    'facilities.emergency_capable': 'Emergency Services',
    'facilities.ambulance_available': 'Ambulance Available',
    'facilities.reviews': 'reviews',
    'facilities.view_details': 'View Details',
    'facilities.get_directions': 'Get Directions',
    'facilities.call_now': 'Call Now',

    // Emergency
    'emergency.title': 'Emergency Services',
    'emergency.subtitle': 'Get immediate help in medical emergencies',
    'emergency.call_112': 'Call 112',
    'emergency.request_ambulance': 'Request Ambulance',
    'emergency.share_location': 'Share Location',
    'emergency.describe_emergency': 'Describe your emergency',
    'emergency.callback_number': 'Callback Number',
    'emergency.submitting': 'Submitting...',
    'emergency.success': 'Emergency request submitted. Help is on the way.',

    // Symptom Checker
    'symptoms.title': 'AI Symptom Checker',
    'symptoms.subtitle': 'Get preliminary health guidance',
    'symptoms.describe': 'Describe your symptoms',
    'symptoms.duration': 'How long have you had these symptoms?',
    'symptoms.severity': 'How severe are your symptoms?',
    'symptoms.analyze': 'Analyze Symptoms',
    'symptoms.disclaimer': 'This is not a medical diagnosis. Always consult a healthcare provider.',

    // Auth
    'auth.login': 'Sign In',
    'auth.register': 'Create Account',
    'auth.phone': 'Phone Number',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.otp': 'Enter OTP',
    'auth.send_otp': 'Send OTP',
    'auth.verify': 'Verify',
    'auth.forgot_password': 'Forgot Password?',
    'auth.no_account': "Don't have an account?",
    'auth.have_account': 'Already have an account?',

    // Profile
    'profile.title': 'Profile Settings',
    'profile.personal_info': 'Personal Information',
    'profile.nhis_info': 'NHIS Information',
    'profile.emergency_contacts': 'Emergency Contacts',
    'profile.notifications': 'Notification Preferences',
    'profile.saved_facilities': 'Saved Facilities',

    // Alerts
    'alerts.title': 'Health Alerts',
    'alerts.no_alerts': 'No active alerts',
    'alerts.severity.info': 'Information',
    'alerts.severity.warning': 'Warning',
    'alerts.severity.critical': 'Critical',
    'alerts.severity.emergency': 'Emergency',
  },

  tw: {
    // Navigation
    'nav.home': 'Fie',
    'nav.facilities': 'Hu Ayaresabea',
    'nav.ambulance': 'Ambulance',
    'nav.emergency': 'Ntɛm Mmoa',
    'nav.alerts': 'Apɔmuden Kɔkɔbɔ',
    'nav.news': 'Nsɛm',
    'nav.compare': 'Fa Toto',
    'nav.about': 'Fa Ho',
    'nav.login': 'Bra Mu',
    'nav.register': 'Kyerɛw Din',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Wo Ho Nsɛm',
    'nav.logout': 'Fi Mu',

    // Common
    'common.search': 'Hwehwɛ',
    'common.filter': 'Yi',
    'common.loading': 'Ɛreload...',
    'common.save': 'Kora',
    'common.cancel': 'Gyae',
    'common.submit': 'Fa Kɔ',
    'common.back': 'San Kɔ',
    'common.next': 'Nea Edi Hɔ',
    'common.close': 'To Mu',
    'common.view': 'Hwɛ',
    'common.edit': 'Sesa',
    'common.delete': 'Yi Fi Hɔ',
    'common.yes': 'Aane',
    'common.no': 'Daabi',

    // Home Page
    'home.title': 'Hu Ayaresabea Bɛn Wo',
    'home.subtitle': 'Nya ayaresabea pa wɔ Ghana nyinaa',
    'home.search_placeholder': 'Hwehwɛ ayaresabea, adwuma, anaasɛ beae...',
    'home.find_facilities': 'Hu Ayaresabea',
    'home.emergency_help': 'Ntɛm Mmoa',
    'home.check_symptoms': 'Hwɛ Yareɛ Nsɛnkyerɛnne',

    // Facilities
    'facilities.title': 'Ayaresabea',
    'facilities.search_placeholder': 'Hwehwɛ din anaasɛ beae',
    'facilities.filter_region': 'Yi Mantam',
    'facilities.filter_type': 'Yi Ɔkwan',
    'facilities.no_results': 'Yɛanhu ayaresabea biara',
    'facilities.nhis_accepted': 'NHIS Wɔ Gye',
    'facilities.emergency_capable': 'Ntɛm Adwuma',
    'facilities.ambulance_available': 'Ambulance Wɔ Hɔ',
    'facilities.reviews': 'nsɛm',
    'facilities.view_details': 'Hwɛ Nsɛm',
    'facilities.get_directions': 'Nya Ɔkwan',
    'facilities.call_now': 'Frɛ Seesei',

    // Emergency
    'emergency.title': 'Ntɛm Mmoa',
    'emergency.subtitle': 'Nya mmoa ntɛm wɔ yareɛ mu',
    'emergency.call_112': 'Frɛ 112',
    'emergency.request_ambulance': 'Bisa Ambulance',
    'emergency.share_location': 'Kyɛ Wo Beae',
    'emergency.describe_emergency': 'Kyerɛ wo haw',
    'emergency.callback_number': 'Fon Nɔma',
    'emergency.submitting': 'Ɛrekɔ...',
    'emergency.success': 'Yɛagye wo nsɛm. Mmoa reba.',

    // Symptom Checker
    'symptoms.title': 'AI Yareɛ Hwehwɛ',
    'symptoms.subtitle': 'Nya apɔmuden nkyerɛkyerɛmu',
    'symptoms.describe': 'Kyerɛ wo yareɛ nsɛnkyerɛnne',
    'symptoms.duration': 'Bere sɛn na wowɔ saa?',
    'symptoms.severity': 'Ɛyɛ den sɛn?',
    'symptoms.analyze': 'Hwehwɛ Mu',
    'symptoms.disclaimer': 'Ɛnyɛ dɔkota asɛm. Kɔ hu dɔkota.',

    // Auth
    'auth.login': 'Bra Mu',
    'auth.register': 'Yɛ Account',
    'auth.phone': 'Fon Nɔma',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.otp': 'Hyɛ OTP',
    'auth.send_otp': 'Mena OTP',
    'auth.verify': 'Si So Dua',
    'auth.forgot_password': 'Woawerɛ Password?',
    'auth.no_account': 'Wonni account?',
    'auth.have_account': 'Wowɔ account dada?',

    // Profile
    'profile.title': 'Wo Ho Nsɛm',
    'profile.personal_info': 'Wo Ankasa Ho Nsɛm',
    'profile.nhis_info': 'NHIS Nsɛm',
    'profile.emergency_contacts': 'Ntɛm Nkitahodi',
    'profile.notifications': 'Kɔkɔbɔ Nhyehyɛe',
    'profile.saved_facilities': 'Ayaresabea a Wokora',

    // Alerts
    'alerts.title': 'Apɔmuden Kɔkɔbɔ',
    'alerts.no_alerts': 'Kɔkɔbɔ biara nni hɔ',
    'alerts.severity.info': 'Nsɛm',
    'alerts.severity.warning': 'Kɔkɔbɔ',
    'alerts.severity.critical': 'Ɛho Hia',
    'alerts.severity.emergency': 'Ntɛm',
  },

  ga: {
    // Navigation
    'nav.home': 'Shia',
    'nav.facilities': 'Fɛɛ Duŋ Shishi',
    'nav.ambulance': 'Ambulance',
    'nav.emergency': 'Gbɛkɛ Bɔ',
    'nav.alerts': 'Hewale Kɛha',
    'nav.news': 'Tsɔɔmɔ',
    'nav.compare': 'Tso Shi',
    'nav.about': 'Shi Mli',
    'nav.login': 'Ba Mli',
    'nav.register': 'Ŋmaa Toi',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Bo Shi',
    'nav.logout': 'Pue',

    // Common
    'common.search': 'Fɛɛ',
    'common.filter': 'Yi',
    'common.loading': 'Ekɛ load...',
    'common.save': 'Kɛ',
    'common.cancel': 'Dzaa',
    'common.submit': 'Naa',
    'common.back': 'Yɛ Shishi',
    'common.next': 'Nɛɛ Baa',
    'common.close': 'Tɔ',
    'common.view': 'Kɛ',
    'common.edit': 'Sesa',
    'common.delete': 'Yi Pue',
    'common.yes': 'Ɛɛŋ',
    'common.no': 'Daabi',

    // Home Page
    'home.title': 'Fɛɛ Duŋ Shishi Ni Bɔ',
    'home.subtitle': 'Nya duŋ shishi pa wɔ Ghana mli',
    'home.search_placeholder': 'Fɛɛ duŋ shishi, dɔŋ, kɛ teŋ...',
    'home.find_facilities': 'Fɛɛ Duŋ Shishi',
    'home.emergency_help': 'Gbɛkɛ Bɔ',
    'home.check_symptoms': 'Kɛ Hewale Shi',

    // Emergency
    'emergency.title': 'Gbɛkɛ Bɔ',
    'emergency.subtitle': 'Nya bɔ gbɛkɛ wɔ hewale mli',
    'emergency.call_112': 'Yɛlɛ 112',
    'emergency.request_ambulance': 'Bisa Ambulance',

    // Auth
    'auth.login': 'Ba Mli',
    'auth.register': 'Yɛ Account',
    'auth.phone': 'Fon Nɔmba',
  },

  ee: {
    // Navigation
    'nav.home': 'Aƒe',
    'nav.facilities': 'Di Atikewɔƒe',
    'nav.ambulance': 'Ambulance',
    'nav.emergency': 'Kpekpe',
    'nav.alerts': 'Lãme Nyatsɔtsɔ',
    'nav.news': 'Nyatakaka',
    'nav.compare': 'Sɔ',
    'nav.about': 'Tso Eŋu',
    'nav.login': 'Ge Eme',
    'nav.register': 'Ŋlɔ Ŋkɔ',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Wò Ŋutɔ',
    'nav.logout': 'Do Go',

    // Common
    'common.search': 'Di',
    'common.filter': 'Tia',
    'common.loading': 'Ele dzadzam...',
    'common.save': 'Dzra',
    'common.cancel': 'Dzudzɔ',
    'common.submit': 'Ɖo Ɖa',
    'common.back': 'Trɔ Yi',
    'common.next': 'Eyome',
    'common.close': 'Tu',
    'common.view': 'Kpɔ',
    'common.edit': 'Trɔ',
    'common.delete': 'Tutui',
    'common.yes': 'Ɛ̃',
    'common.no': 'Ao',

    // Home Page
    'home.title': 'Di Atikewɔƒe Le Wò Gbɔ',
    'home.subtitle': 'Xɔ atikewɔƒe nyuie le Ghana',
    'home.search_placeholder': 'Di atikewɔƒe, dɔwɔwɔ, alo teƒe...',
    'home.find_facilities': 'Di Atikewɔƒe',
    'home.emergency_help': 'Kpekpe Kpɔɖeŋu',
    'home.check_symptoms': 'Kpɔ Dɔlele Ŋkuɖoɖo',

    // Emergency
    'emergency.title': 'Kpekpe Dɔwɔwɔ',
    'emergency.subtitle': 'Xɔ kpɔɖeŋu enumake le dɔlele me',
    'emergency.call_112': 'Yɔ 112',
    'emergency.request_ambulance': 'Bia Ambulance',

    // Auth
    'auth.login': 'Ge Eme',
    'auth.register': 'Wɔ Account',
    'auth.phone': 'Fon Xexlẽdzesi',
  },

  ha: {
    // Navigation
    'nav.home': 'Gida',
    'nav.facilities': 'Nemo Asibitoci',
    'nav.ambulance': 'Motar Asibiti',
    'nav.emergency': 'Gaggawa',
    'nav.alerts': 'Sanarwar Lafiya',
    'nav.news': 'Labarai',
    'nav.compare': 'Kwatanta',
    'nav.about': 'Game Da',
    'nav.login': 'Shiga',
    'nav.register': 'Yi Rajista',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Bayani',
    'nav.logout': 'Fita',

    // Common
    'common.search': 'Nema',
    'common.filter': 'Tace',
    'common.loading': 'Ana lodi...',
    'common.save': 'Ajiye',
    'common.cancel': 'Soke',
    'common.submit': 'Aika',
    'common.back': 'Komawa',
    'common.next': 'Gaba',
    'common.close': 'Rufe',
    'common.view': 'Duba',
    'common.edit': 'Gyara',
    'common.delete': 'Share',
    'common.yes': 'Eh',
    'common.no': "A'a",

    // Home Page
    'home.title': 'Nemo Asibiti Kusa Da Ku',
    'home.subtitle': 'Samu asibitoci masu kyau a Ghana',
    'home.search_placeholder': 'Nemo asibitoci, ayyuka, ko wurare...',
    'home.find_facilities': 'Nemo Asibitoci',
    'home.emergency_help': 'Taimakon Gaggawa',
    'home.check_symptoms': 'Duba Alamomin Cuta',

    // Emergency
    'emergency.title': 'Sabis na Gaggawa',
    'emergency.subtitle': 'Samu taimako nan take a lokacin gaggawa',
    'emergency.call_112': 'Kira 112',
    'emergency.request_ambulance': 'Nemi Motar Asibiti',

    // Auth
    'auth.login': 'Shiga',
    'auth.register': 'Yi Asusu',
    'auth.phone': 'Lambar Waya',
  },
};

// Additional page content translations
export const pageTranslations: Record<Language, Record<string, string>> = {
  en: {
    // Homepage
    'home.hero.title': 'Find Healthcare Near You',
    'home.hero.subtitle': 'Access quality healthcare facilities across Ghana. Search hospitals, clinics, and pharmacies with real-time availability.',
    'home.hero.search_placeholder': 'Search facilities, services, or locations...',
    'home.hero.cta_facilities': 'Find Facilities',
    'home.hero.cta_emergency': 'Emergency Help',
    'home.stats.facilities': 'Healthcare Facilities',
    'home.stats.regions': 'Regions Covered',
    'home.stats.users': 'Active Users',
    'home.stats.ambulances': 'Ambulances Available',
    'home.nearby.title': 'Healthcare Near You',
    'home.nearby.subtitle': 'Facilities closest to your location',
    'home.featured.title': 'Featured Hospitals',
    'home.featured.subtitle': 'Top-rated healthcare facilities in Ghana',
    'home.services.title': 'Our Services',
    'home.services.find_facilities': 'Find Facilities',
    'home.services.find_facilities_desc': 'Search and compare hospitals, clinics, and pharmacies across Ghana',
    'home.services.emergency': 'Emergency Services',
    'home.services.emergency_desc': 'Quick access to ambulance services and emergency care',
    'home.services.nhis': 'NHIS Coverage',
    'home.services.nhis_desc': 'Check which facilities accept National Health Insurance',
    'home.services.compare': 'Compare Prices',
    'home.services.compare_desc': 'Compare service prices across different healthcare facilities',
    
    // Facilities page
    'facilities.page.title': 'Healthcare Facilities',
    'facilities.page.subtitle': 'Find hospitals, clinics, and pharmacies across Ghana',
    'facilities.filters.all_regions': 'All Regions',
    'facilities.filters.all_types': 'All Types',
    'facilities.card.view_details': 'View Details',
    'facilities.card.get_directions': 'Get Directions',
    'facilities.card.call': 'Call',
    'facilities.card.reviews': 'reviews',
    'facilities.card.open_24h': 'Open 24 Hours',
    'facilities.card.emergency': 'Emergency',
    'facilities.card.nhis': 'NHIS',
    
    // Compare page
    'compare.title': 'Compare Facilities',
    'compare.subtitle': 'Compare services and prices across healthcare facilities',
    'compare.add_facility': 'Add Facility',
    'compare.remove': 'Remove',
    'compare.services': 'Services',
    'compare.prices': 'Prices',
    'compare.ratings': 'Ratings',
    
    // Ambulance page
    'ambulance.title': 'Find Ambulance',
    'ambulance.subtitle': 'Real-time ambulance availability near you',
    'ambulance.available': 'Available',
    'ambulance.on_call': 'On Call',
    'ambulance.offline': 'Offline',
    'ambulance.eta': 'ETA',
    'ambulance.distance': 'Distance',
    'ambulance.request': 'Request Ambulance',
    'ambulance.call_193': 'Call 193',
    
    // Footer
    'footer.about': 'About OneHealthGH',
    'footer.about_desc': 'Ghana\'s National Digital Health Platform connecting citizens with quality healthcare.',
    'footer.quick_links': 'Quick Links',
    'footer.contact': 'Contact Us',
    'footer.copyright': '© 2024 OneHealthGH. All rights reserved.',
  },
  tw: {
    // Homepage - Twi
    'home.hero.title': 'Hu Ayaresabea Bɛn Wo',
    'home.hero.subtitle': 'Nya ayaresabea pa wɔ Ghana nyinaa. Hwehwɛ ayaresabea, clinic, ne pharmacy.',
    'home.hero.search_placeholder': 'Hwehwɛ ayaresabea, adwuma, anaasɛ beae...',
    'home.hero.cta_facilities': 'Hu Ayaresabea',
    'home.hero.cta_emergency': 'Ntɛm Mmoa',
    'home.stats.facilities': 'Ayaresabea',
    'home.stats.regions': 'Mantam',
    'home.stats.users': 'Nkurɔfo a Wɔde Di Dwuma',
    'home.stats.ambulances': 'Ambulance a Ɛwɔ Hɔ',
    'home.nearby.title': 'Ayaresabea Bɛn Wo',
    'home.nearby.subtitle': 'Ayaresabea a ɛbɛn wo beae',
    'home.featured.title': 'Ayaresabea Titiriw',
    'home.featured.subtitle': 'Ayaresabea pa wɔ Ghana',
    'home.services.title': 'Yɛn Adwuma',
    'home.services.find_facilities': 'Hu Ayaresabea',
    'home.services.find_facilities_desc': 'Hwehwɛ na fa ayaresabea toto wɔ Ghana',
    'home.services.emergency': 'Ntɛm Adwuma',
    'home.services.emergency_desc': 'Nya ambulance ne ntɛm mmoa ntɛm',
    'home.services.nhis': 'NHIS',
    'home.services.nhis_desc': 'Hwɛ ayaresabea a wɔgye NHIS',
    'home.services.compare': 'Fa Boɔ Toto',
    'home.services.compare_desc': 'Fa adwuma boɔ toto wɔ ayaresabea ahorow so',
    
    // Facilities - Twi
    'facilities.page.title': 'Ayaresabea',
    'facilities.page.subtitle': 'Hu ayaresabea, clinic, ne pharmacy wɔ Ghana',
    'facilities.filters.all_regions': 'Mantam Nyinaa',
    'facilities.filters.all_types': 'Ɔkwan Nyinaa',
    'facilities.card.view_details': 'Hwɛ Nsɛm',
    'facilities.card.get_directions': 'Nya Ɔkwan',
    'facilities.card.call': 'Frɛ',
    'facilities.card.reviews': 'nsɛm',
    'facilities.card.open_24h': 'Ɛbue Dɔnhwerew 24',
    'facilities.card.emergency': 'Ntɛm',
    'facilities.card.nhis': 'NHIS',
    
    // Ambulance - Twi
    'ambulance.title': 'Hu Ambulance',
    'ambulance.subtitle': 'Ambulance a ɛwɔ hɔ bɛn wo',
    'ambulance.available': 'Ɛwɔ Hɔ',
    'ambulance.on_call': 'Wɔafrɛ No',
    'ambulance.offline': 'Ɛnni Hɔ',
    'ambulance.eta': 'Bere a Ɛbɛdu',
    'ambulance.distance': 'Kwan',
    'ambulance.request': 'Bisa Ambulance',
    'ambulance.call_193': 'Frɛ 193',
    
    // Footer - Twi
    'footer.about': 'Fa OneHealthGH Ho',
    'footer.about_desc': 'Ghana Apɔmuden Digital Platform a ɛde nkurɔfo bɔ ayaresabea pa ho.',
    'footer.quick_links': 'Nkitahodi Ntɛm',
    'footer.contact': 'Frɛ Yɛn',
    'footer.copyright': '© 2024 OneHealthGH. Hokwan nyinaa yɛ yɛn dea.',
  },
  ga: {
    // Homepage - Ga
    'home.hero.title': 'Fɛɛ Duŋ Shishi Ni Bɔ',
    'home.hero.subtitle': 'Nya duŋ shishi pa wɔ Ghana mli. Fɛɛ duŋ shishi, clinic, kɛ pharmacy.',
    'home.hero.search_placeholder': 'Fɛɛ duŋ shishi, dɔŋ, kɛ teŋ...',
    'home.hero.cta_facilities': 'Fɛɛ Duŋ Shishi',
    'home.hero.cta_emergency': 'Gbɛkɛ Bɔ',
    'home.stats.facilities': 'Duŋ Shishi',
    'home.stats.regions': 'Teŋ Mli',
    'home.stats.users': 'Bii Ni Wɔyɛ Dɔŋ',
    'home.stats.ambulances': 'Ambulance Ni Wɔ',
    
    // Ambulance - Ga
    'ambulance.title': 'Fɛɛ Ambulance',
    'ambulance.subtitle': 'Ambulance ni wɔ bɔ',
    'ambulance.available': 'Ewɔ',
    'ambulance.on_call': 'Wɔyɛlɛ Ni',
    'ambulance.request': 'Bisa Ambulance',
    'ambulance.call_193': 'Yɛlɛ 193',
  },
  ee: {
    // Homepage - Ewe
    'home.hero.title': 'Di Atikewɔƒe Le Wò Gbɔ',
    'home.hero.subtitle': 'Xɔ atikewɔƒe nyuie le Ghana. Di atikewɔƒe, klinik, kple agbale.',
    'home.hero.search_placeholder': 'Di atikewɔƒe, dɔwɔwɔ, alo teƒe...',
    'home.hero.cta_facilities': 'Di Atikewɔƒe',
    'home.hero.cta_emergency': 'Kpekpe Kpɔɖeŋu',
    'home.stats.facilities': 'Atikewɔƒewo',
    'home.stats.regions': 'Nutome',
    'home.stats.users': 'Ezãla Siwo Le Eŋu',
    'home.stats.ambulances': 'Ambulance Siwo Le',
    
    // Ambulance - Ewe
    'ambulance.title': 'Di Ambulance',
    'ambulance.subtitle': 'Ambulance siwo le wò gbɔ',
    'ambulance.available': 'Ele',
    'ambulance.on_call': 'Wòle Eŋu',
    'ambulance.request': 'Bia Ambulance',
    'ambulance.call_193': 'Yɔ 193',
  },
  ha: {
    // Homepage - Hausa
    'home.hero.title': 'Nemo Asibiti Kusa Da Ku',
    'home.hero.subtitle': 'Samu asibitoci masu kyau a Ghana. Nemo asibitoci, kilinik, da kantin magani.',
    'home.hero.search_placeholder': 'Nemo asibitoci, ayyuka, ko wurare...',
    'home.hero.cta_facilities': 'Nemo Asibitoci',
    'home.hero.cta_emergency': 'Taimakon Gaggawa',
    'home.stats.facilities': 'Asibitoci',
    'home.stats.regions': 'Yankuna',
    'home.stats.users': 'Masu Amfani',
    'home.stats.ambulances': 'Motocin Asibiti',
    
    // Ambulance - Hausa
    'ambulance.title': 'Nemo Motar Asibiti',
    'ambulance.subtitle': 'Motocin asibiti da ke kusa da ku',
    'ambulance.available': 'Akwai',
    'ambulance.on_call': 'Ana Kira',
    'ambulance.request': 'Nemi Motar Asibiti',
    'ambulance.call_193': 'Kira 193',
  },
};

export function t(key: string, lang: Language = 'en'): string {
  // Check page translations first, then fall back to nav translations
  return pageTranslations[lang]?.[key] || translations[lang]?.[key] || pageTranslations['en']?.[key] || translations['en']?.[key] || key;
}

export function getLanguageName(code: Language): string {
  const lang = LANGUAGES.find(l => l.code === code);
  return lang?.nativeName || code;
}
