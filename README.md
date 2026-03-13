# Apomuden Health Portal

**Ghana's National Digital Health Platform**

> "Your Health, Closer"

A comprehensive digital health platform for the Ghana Ministry of Health that enables citizens to discover healthcare facilities, compare services and pricing, request emergency services, and receive health alerts — while equipping the Ministry with real-time disease surveillance and outbreak detection capabilities.

## Features

### For Citizens
- 🏥 **Facility Discovery** - Find hospitals, clinics, and pharmacies near you
- 💰 **Price Comparison** - Compare service prices across facilities
- 🏷️ **NHIS Coverage** - Check insurance coverage for services
- 🚑 **Emergency Services** - Request emergency assistance with GPS tracking
- 📢 **Health Alerts** - Receive regional health advisories
- ⭐ **Reviews & Ratings** - Rate and review healthcare facilities

### For Healthcare Facilities
- 📋 **Profile Management** - Manage facility information and services
- 💵 **Service Pricing** - Set and update service prices
- 📊 **Analytics Dashboard** - View facility performance metrics
- 📝 **Diagnosis Reporting** - Submit disease surveillance data

### For Ministry of Health
- 🗺️ **Disease Surveillance** - Real-time outbreak detection
- 📈 **Analytics Dashboard** - National health statistics
- 🔔 **Alert Broadcasting** - Send health advisories via SMS/Push
- ✅ **Facility Verification** - Approve and tier healthcare facilities

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, tRPC
- **Database**: PostgreSQL 16 + PostGIS
- **ORM**: Prisma 5
- **Auth**: NextAuth.js v5
- **Maps**: Mapbox GL JS
- **State**: Zustand + TanStack Query
- **SMS**: Hubtel API

## Getting Started

### Prerequisites

- Node.js 20 LTS
- PostgreSQL 16 with PostGIS extension
- Redis (optional, for caching)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/moh-ghana/apomuden.git
cd apomuden
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Set up the database:
```bash
npm run db:generate
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/          # Public pages (landing, facilities, etc.)
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Citizen dashboard
│   ├── facility-admin/    # Facility management
│   ├── admin/             # Ministry admin
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components
│   ├── maps/              # Map components
│   └── layouts/           # Layout components
├── lib/
│   ├── db.ts              # Prisma client
│   ├── auth.ts            # NextAuth configuration
│   ├── utils.ts           # Utility functions
│   └── constants.ts       # App constants
├── types/                 # TypeScript types
└── hooks/                 # Custom React hooks
```

## Development Phases

- **Phase 1 (MVP)**: Facility registration, search, Ministry verification
- **Phase 2**: Citizen auth, emergency services, NHIS integration, reviews
- **Phase 3**: Disease surveillance, analytics, SMS alerts
- **Phase 4**: AI symptom checker, ambulance tracking, telemedicine

## Contributing

This project is developed for the Ghana Ministry of Health. For contribution guidelines, please contact the development team.

## License

Copyright © 2024 Ghana Ministry of Health. All rights reserved.
