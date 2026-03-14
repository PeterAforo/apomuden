# Apomuden Health Portal — Mobile App Strategy Report

**Generated:** March 14, 2026  
**Analyst:** Cascade AI  
**Project:** Apomuden - Ghana's National Digital Health Platform  
**Report Version:** 1.0.0

---

## Executive Summary

Apomuden is a comprehensive digital health platform for Ghana, built with Next.js 14, TypeScript, and PostgreSQL. The platform enables citizens to find healthcare facilities, request emergency services, book telemedicine appointments, and receive health alerts. 

**Recommendation:** Build a **React Native with Expo** mobile app that shares the existing REST API backend, authentication system, and business logic patterns. This approach maximizes code reuse, leverages the team's existing TypeScript/React expertise, and provides near-native performance for both iOS and Android.

**Estimated Timeline:** 12-16 weeks for a 2-person team  
**Estimated Mobile Score:** HIGH — The web app is already mobile-responsive and has a well-structured API layer.

---

## Phase 1 — Web App Analysis

### 1.1 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **UI Framework** | Tailwind CSS + shadcn/ui (Radix primitives) |
| **State Management** | Zustand + TanStack Query v5 |
| **Animation** | Framer Motion, GSAP |
| **Maps** | Mapbox GL JS + react-map-gl |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL 16 + PostGIS (spatial queries) |
| **ORM** | Prisma 5.18 |
| **Authentication** | NextAuth.js v5 (JWT strategy) |
| **Real-time** | Pusher.js (WebSocket) |
| **Internationalization** | next-intl (5 languages: English, Twi, Ga, Ewe, Hausa) |

### 1.2 Feature Inventory

| Feature | Category | API Required | Device Hardware | Real-time |
|---------|----------|--------------|-----------------|-----------|
| Facility Search & Discovery | Core | ✅ | GPS (optional) | ❌ |
| Facility Details & Reviews | Core | ✅ | ❌ | ❌ |
| Interactive Map View | Core | ✅ | GPS | ❌ |
| Emergency Request | Critical | ✅ | GPS | ✅ |
| Ambulance Tracking | Critical | ✅ | GPS | ✅ |
| User Authentication (Phone OTP) | Core | ✅ | ❌ | ❌ |
| User Authentication (Email/Password) | Core | ✅ | ❌ | ❌ |
| User Profile Management | Core | ✅ | Camera (avatar) | ❌ |
| NHIS Verification | Core | ✅ | ❌ | ❌ |
| Telemedicine Booking | Core | ✅ | ❌ | ❌ |
| Video Consultation | Premium | ✅ | Camera, Mic | ✅ |
| AI Symptom Checker | Core | ✅ | ❌ | ❌ |
| AI Chatbot (Kwasi) | Core | ✅ | ❌ | ❌ |
| Health Alerts | Core | ✅ | Push Notifications | ✅ |
| Saved Facilities (Favorites) | Core | ✅ | ❌ | ❌ |
| Facility Registration | Admin | ✅ | Camera (docs) | ❌ |
| Admin Dashboard | Admin | ✅ | ❌ | ❌ |
| Facility Admin Panel | Admin | ✅ | ❌ | ❌ |
| Push Notifications | Core | ✅ | Push | ✅ |

### 1.3 API Endpoints Inventory

**Total Endpoints:** 34 REST API routes

#### Authentication (4 endpoints)
- `POST /api/auth/register` — User registration
- `POST /api/auth/send-otp` — Send OTP to phone
- `POST /api/auth/verify-otp` — Verify OTP
- `GET/POST /api/auth/[...nextauth]` — NextAuth handlers

#### Facilities (4 endpoints)
- `GET /api/facilities` — List facilities (paginated)
- `POST /api/facilities/register` — Register new facility
- `POST /api/facilities/[id]/reviews` — Submit review
- `POST /api/facilities/[id]/report-price` — Report price discrepancy

#### Emergency (2 endpoints)
- `POST /api/emergency` — Create emergency request
- `GET /api/emergency/active` — Get active emergencies

#### Telemedicine (4 endpoints)
- `GET /api/telemedicine/doctors` — List available doctors
- `POST /api/telemedicine/book` — Book appointment
- `GET /api/telemedicine/appointments` — User's appointments
- `POST /api/telemedicine/video-room` — Get video room credentials

#### User (3 endpoints)
- `GET/PUT /api/user/profile` — User profile
- `GET/POST/DELETE /api/user/favorites` — Saved facilities
- `GET/POST/DELETE /api/user/emergency-contacts` — Emergency contacts

#### Push Notifications (2 endpoints)
- `POST /api/push/subscribe` — Register push subscription
- `POST /api/push/unsubscribe` — Unregister push subscription

#### AI Services (2 endpoints)
- `POST /api/chatbot` — AI chatbot (Kwasi)
- `POST /api/ai/symptom-check` — Symptom checker

#### Admin (6 endpoints)
- `GET/POST /api/admin/alerts` — Health alerts management
- `POST /api/admin/alerts/[id]/broadcast` — Broadcast alert
- `GET /api/admin/analytics` — Platform analytics
- `GET /api/admin/audit-logs` — Audit logs
- `GET /api/admin/export` — Data export
- `POST /api/admin/seed-facilities` — Seed facilities

#### Facility Admin (5 endpoints)
- `GET/POST /api/facility-admin/ambulances` — Ambulance management
- `PUT /api/facility-admin/ambulances/[id]/status` — Update ambulance status
- `POST /api/facility-admin/ambulances/[id]/dispatch` — Dispatch ambulance
- `GET /api/facility-admin/emergency-requests` — Incoming emergencies
- `GET/PUT /api/facility-admin/resources` — Facility resources

#### Other (2 endpoints)
- `POST /api/nhis/verify` — NHIS card verification
- `POST /api/diagnosis-reports` — Submit diagnosis reports

### 1.4 Authentication Analysis

| Aspect | Current Implementation | Mobile Readiness |
|--------|----------------------|------------------|
| **Strategy** | JWT (NextAuth.js) | ✅ Ready |
| **Login Methods** | Phone OTP, Email/Password | ✅ Ready |
| **Token Storage** | HTTP-only cookies (web) | ⚠️ Needs mobile adapter |
| **Token Refresh** | Automatic via NextAuth | ⚠️ Needs explicit endpoint |
| **Social Login** | Not implemented | ❌ Missing (Apple Sign-In required for iOS) |
| **Biometric Auth** | Not implemented | ❌ Missing |

### 1.5 Database Models (Prisma)

**Core Models:** 17 tables
- User, Account, Session, VerificationToken
- Region, District
- Facility, FacilityStaff, Service, ServiceTaxonomy, ServicePriceHistory
- DiagnosisReport, Alert, EmergencyRequest, Ambulance
- Review, AuditLog, Notification

**Key Enums:** UserRole (10 roles), FacilityType (8 types), EmergencyType, AlertSeverity, etc.

### 1.6 Real-time Features

| Feature | Technology | Mobile Consideration |
|---------|------------|---------------------|
| Emergency Updates | Pusher.js | Need mobile WebSocket handling |
| Ambulance Tracking | Pusher.js | Background location updates |
| Health Alerts | Push Notifications | FCM/APNs integration needed |

---

## Phase 2 — Mobile Strategy Recommendation

### 2.1 Framework Ranking (Most to Least Recommended)

| Rank | Framework | Score | Reasoning |
|------|-----------|-------|-----------|
| **1** | **React Native (Expo)** | 95/100 | Perfect match — same language (TypeScript), same patterns (React), maximum code reuse, Expo simplifies native APIs |
| **2** | Flutter | 75/100 | Excellent performance, but requires learning Dart, less code sharing with existing codebase |
| **3** | Capacitor (PWA wrapper) | 70/100 | Fastest path, but WebView performance limits, may feel less native |
| **4** | Kotlin Multiplatform | 50/100 | Overkill for this project, requires Kotlin expertise |
| **5** | Native (Kotlin + Swift) | 40/100 | Two codebases, highest cost, no code sharing |

### 2.2 Primary Recommendation: React Native with Expo

**Justification:**
1. **Language Match:** Web app uses TypeScript + React — mobile team uses same skills
2. **Code Reuse:** Can share types, validation logic, API client, constants
3. **Expo Benefits:** OTA updates, simplified native APIs, EAS Build for CI/CD
4. **Feature Support:** All required features (maps, push, camera, GPS, biometrics) have mature Expo packages
5. **Team Efficiency:** Single codebase for iOS + Android
6. **Community:** Large ecosystem, extensive documentation

### 2.3 Secondary Recommendation: Flutter

**When to consider Flutter instead:**
- If team wants to rebuild the web app in Flutter Web for unified codebase
- If maximum animation performance is critical
- If team is willing to invest in learning Dart

---

## Phase 3 — Architecture Blueprint

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE APP (React Native + Expo)          │
├─────────────────────────────────────────────────────────────────┤
│  UI Layer          │  State Layer        │  Service Layer       │
│  - Screens         │  - Zustand stores   │  - API Client        │
│  - Components      │  - TanStack Query   │  - Auth Service      │
│  - Navigation      │  - Offline cache    │  - Push Service      │
│  - NativeWind      │                     │  - Location Service  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS (REST API)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SHARED BACKEND (Next.js API)                  │
├─────────────────────────────────────────────────────────────────┤
│  /api/auth/*       │  /api/facilities/*  │  /api/emergency/*    │
│  /api/user/*       │  /api/telemedicine/*│  /api/push/*         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL + PostGIS)               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  EXTERNAL SERVICES                                               │
│  - Firebase (FCM for Android push)                               │
│  - APNs (iOS push)                                               │
│  - Mapbox (maps)                                                 │
│  - Pusher (real-time)                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Navigation Architecture

```
RootNavigator
├── AuthStack (unauthenticated)
│   ├── WelcomeScreen
│   ├── LoginScreen (Phone OTP / Email)
│   ├── RegisterScreen
│   └── ForgotPasswordScreen
│
└── MainStack (authenticated)
    └── BottomTabNavigator
        ├── HomeTab
        │   ├── HomeScreen
        │   ├── FacilitySearchScreen
        │   ├── FacilityDetailScreen
        │   └── FacilityMapScreen
        │
        ├── EmergencyTab
        │   ├── EmergencyRequestScreen
        │   └── TrackAmbulanceScreen
        │
        ├── HealthTab
        │   ├── SymptomCheckerScreen
        │   ├── TelemedicineScreen
        │   ├── BookAppointmentScreen
        │   └── VideoCallScreen
        │
        ├── AlertsTab
        │   ├── AlertsListScreen
        │   └── AlertDetailScreen
        │
        └── ProfileTab
            ├── ProfileScreen
            ├── SavedFacilitiesScreen
            ├── EmergencyContactsScreen
            ├── NotificationSettingsScreen
            └── SettingsScreen
```

### 3.3 Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Launch    │────▶│ Check Token │────▶│  Valid?     │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
              ┌───────────┐            ┌───────────────┐          ┌───────────┐
              │  Expired  │            │    Valid      │          │  No Token │
              └───────────┘            └───────────────┘          └───────────┘
                    │                          │                          │
                    ▼                          ▼                          ▼
              ┌───────────┐            ┌───────────────┐          ┌───────────┐
              │  Refresh  │            │   Main App    │          │  Auth     │
              │  Token    │            │               │          │  Stack    │
              └───────────┘            └───────────────┘          └───────────┘
```

**Token Storage:**
- Access Token: `expo-secure-store` (iOS Keychain / Android Keystore)
- Refresh Token: `expo-secure-store`
- User Data Cache: MMKV (encrypted)

---

## Phase 4 — API Readiness Audit

### 4.1 Endpoint Readiness Matrix

| Endpoint | Status | Issue | Fix Required | Priority |
|----------|--------|-------|--------------|----------|
| `GET /api/facilities` | ✅ READY | Has pagination | None | - |
| `POST /api/auth/register` | ✅ READY | - | None | - |
| `POST /api/auth/send-otp` | ✅ READY | - | None | - |
| `POST /api/auth/verify-otp` | ✅ READY | - | None | - |
| `POST /api/emergency` | ⚠️ NEEDS_MOD | No auth required | Add optional auth | MEDIUM |
| `POST /api/push/subscribe` | ⚠️ NEEDS_MOD | Web Push format | Add FCM/APNs support | CRITICAL |
| `GET /api/user/profile` | ✅ READY | - | None | - |
| `POST /api/telemedicine/book` | ✅ READY | - | None | - |
| NextAuth session | ⚠️ NEEDS_MOD | Cookie-based | Add mobile token endpoint | CRITICAL |

### 4.2 Missing Endpoints Required for Mobile

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/auth/mobile/login` | POST | Return JWT tokens directly | CRITICAL |
| `/api/auth/mobile/refresh` | POST | Refresh access token | CRITICAL |
| `/api/auth/mobile/logout` | POST | Revoke refresh token | HIGH |
| `/api/devices/register` | POST | Register FCM/APNs device token | CRITICAL |
| `/api/devices/unregister` | DELETE | Remove device token on logout | HIGH |
| `/api/auth/apple` | POST | Apple Sign-In verification | CRITICAL (iOS) |
| `/api/auth/google` | POST | Google Sign-In verification | HIGH |
| `/api/health` | GET | Health check for connectivity | MEDIUM |

### 4.3 Backend Changes Checklist

#### Authentication (CRITICAL)
- [ ] Create `/api/auth/mobile/login` — Returns `{ accessToken, refreshToken, expiresIn }`
- [ ] Create `/api/auth/mobile/refresh` — Accepts refresh token, returns new access token
- [ ] Create `/api/auth/mobile/logout` — Invalidates refresh token
- [ ] Implement Apple Sign-In verification (required for iOS App Store)
- [ ] Implement Google Sign-In verification (PKCE flow)
- [ ] Add `device_tokens` table to database

#### Push Notifications (CRITICAL)
- [ ] Create `/api/devices/register` — Store FCM/APNs tokens per user
- [ ] Create `/api/devices/unregister` — Remove token on logout
- [ ] Integrate Firebase Admin SDK for FCM
- [ ] Integrate APNs for iOS push
- [ ] Update notification dispatch to send push notifications

#### Database Schema Additions
```prisma
model DeviceToken {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  token     String   @unique
  platform  String   // "ios" | "android"
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("device_tokens")
}
```

---

## Phase 5 — Mobile Authentication Strategy

### 5.1 Authentication Methods

| Method | Implementation | Notes |
|--------|----------------|-------|
| **Phone OTP** | Existing API + SMS | Primary for Ghana users |
| **Email/Password** | Existing API | Secondary option |
| **Google Sign-In** | expo-auth-session + PKCE | Recommended for convenience |
| **Apple Sign-In** | expo-apple-authentication | **MANDATORY for iOS** |
| **Biometric** | expo-local-authentication | Quick re-auth after initial login |

### 5.2 Token Management

```typescript
// Token storage structure
interface AuthTokens {
  accessToken: string;      // Short-lived (15 min)
  refreshToken: string;     // Long-lived (30 days)
  expiresAt: number;        // Unix timestamp
}

// Secure storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_DATA: 'auth_user_data',
};
```

### 5.3 Biometric Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  App Open   │────▶│ Has Tokens? │────▶│  Biometric  │
└─────────────┘     └─────────────┘     │  Enabled?   │
                                        └─────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
              ┌───────────┐            ┌───────────────┐          ┌───────────┐
              │  Prompt   │            │  Skip to App  │          │  Login    │
              │  Face ID  │            │  (tokens ok)  │          │  Screen   │
              └───────────┘            └───────────────┘          └───────────┘
```

### 5.4 ⚠️ CRITICAL: Apple Sign-In Requirement

**Apple App Store Policy:** If your app offers ANY third-party social login (Google, Facebook, etc.), you MUST also offer Sign in with Apple.

**Implementation:**
```typescript
import * as AppleAuthentication from 'expo-apple-authentication';

const handleAppleSignIn = async () => {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  
  // Send credential.identityToken to backend for verification
  await api.post('/api/auth/apple', {
    identityToken: credential.identityToken,
    fullName: credential.fullName,
  });
};
```

---

## Phase 6 — Push Notification Architecture

### 6.1 Notification Types

| Type | Trigger | Channels | Deep Link |
|------|---------|----------|-----------|
| Emergency Update | Status change | Push, SMS | `/emergency/track/:id` |
| Appointment Reminder | 1 hour before | Push | `/telemedicine/appointment/:id` |
| Health Alert | Admin broadcast | Push, SMS | `/alerts/:id` |
| Facility Response | Review reply | Push | `/facilities/:slug` |
| NHIS Expiry | 30 days before | Push, SMS | `/profile/nhis` |

### 6.2 Push Notification Payload Schema

```typescript
interface PushNotificationPayload {
  title: string;
  body: string;
  data: {
    type: 'emergency' | 'appointment' | 'alert' | 'review' | 'nhis';
    resourceId: string;
    deepLink: string;
    action?: string;
  };
  badge?: number;
  sound?: string;
  image?: string;  // Rich notification image URL
}
```

### 6.3 Device Token Registration Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│ Request     │────▶│  Get FCM/   │
│   Success   │     │ Permission  │     │  APNs Token │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  POST       │
                                        │  /devices/  │
                                        │  register   │
                                        └─────────────┘
```

### 6.4 Backend Integration

```typescript
// Firebase Admin SDK setup
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Send push notification
async function sendPushNotification(
  userId: string,
  payload: PushNotificationPayload
) {
  const deviceTokens = await db.deviceToken.findMany({
    where: { userId },
  });

  const messages = deviceTokens.map(device => ({
    token: device.token,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data,
    apns: {
      payload: {
        aps: { badge: payload.badge, sound: payload.sound },
      },
    },
  }));

  await admin.messaging().sendEach(messages);
}
```

---

## Phase 7 — Offline Support & Data Sync

### 7.1 Feature Classification

| Feature | Offline Mode | Strategy |
|---------|--------------|----------|
| Facility Search | CACHED_READ | Cache last search results |
| Facility Details | CACHED_READ | Cache viewed facilities |
| Saved Facilities | OFFLINE_READ_WRITE | Full offline support |
| Emergency Request | OFFLINE_WRITE | Queue and sync when online |
| User Profile | CACHED_READ | Cache profile data |
| Health Alerts | CACHED_READ | Cache recent alerts |
| Telemedicine | ONLINE_ONLY | Requires real-time connection |

### 7.2 Local Database Schema (SQLite)

```typescript
// Using Drizzle ORM with Expo SQLite
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const cachedFacilities = sqliteTable('cached_facilities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  address: text('address').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  phone: text('phone'),
  nhisAccepted: integer('nhis_accepted', { mode: 'boolean' }),
  emergencyCapable: integer('emergency_capable', { mode: 'boolean' }),
  averageRating: real('average_rating'),
  cachedAt: integer('cached_at', { mode: 'timestamp' }),
});

export const pendingActions = sqliteTable('pending_actions', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),  // 'emergency', 'review', etc.
  payload: text('payload').notNull(),  // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }),
  retryCount: integer('retry_count').default(0),
});
```

### 7.3 Sync Queue Implementation

```typescript
// Offline action queue
class SyncQueue {
  async enqueue(action: PendingAction) {
    await db.insert(pendingActions).values(action);
  }

  async processQueue() {
    const pending = await db.select().from(pendingActions);
    
    for (const action of pending) {
      try {
        await this.executeAction(action);
        await db.delete(pendingActions).where(eq(pendingActions.id, action.id));
      } catch (error) {
        await db.update(pendingActions)
          .set({ retryCount: action.retryCount + 1 })
          .where(eq(pendingActions.id, action.id));
      }
    }
  }
}
```

---

## Phase 8 — Native Device Features Plan

### 8.1 Required Device Features

| Feature | Use Case | Expo Package | Permissions |
|---------|----------|--------------|-------------|
| **Push Notifications** | Alerts, reminders | `expo-notifications` | Notification |
| **Geolocation** | Facility finder, emergency | `expo-location` | Location (When In Use) |
| **Camera** | Profile photo, documents | `expo-image-picker` | Camera, Photo Library |
| **Biometrics** | Quick login | `expo-local-authentication` | Face ID / Biometric |
| **Maps** | Facility map, tracking | `react-native-maps` | Location |
| **Secure Storage** | Token storage | `expo-secure-store` | None |
| **Haptics** | Feedback | `expo-haptics` | None |
| **Share** | Share facility | `expo-sharing` | None |
| **Deep Linking** | Notification taps | `expo-linking` | None |

### 8.2 iOS Permission Strings (Info.plist)

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Apomuden needs your location to find nearby healthcare facilities and enable emergency services.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Apomuden needs continuous location access to track your ambulance during emergencies.</string>

<key>NSCameraUsageDescription</key>
<string>Apomuden needs camera access to take profile photos and scan documents.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Apomuden needs photo library access to select profile photos and documents.</string>

<key>NSFaceIDUsageDescription</key>
<string>Apomuden uses Face ID for quick and secure login.</string>

<key>NSUserTrackingUsageDescription</key>
<string>Apomuden uses tracking to improve your experience and show relevant health information.</string>
```

### 8.3 Android Permissions (AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

---

## Phase 9 — Shared Code Strategy

### 9.1 Recommended Monorepo Structure

```
apomuden/
├── apps/
│   ├── web/                    # Existing Next.js web app
│   └── mobile/                 # New React Native app
│
├── packages/
│   ├── types/                  # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── facility.ts
│   │   │   ├── user.ts
│   │   │   ├── emergency.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── api-client/             # Shared API client
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── facilities.ts
│   │   │   ├── auth.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── utils/                  # Shared utilities
│   │   ├── src/
│   │   │   ├── validation.ts
│   │   │   ├── formatting.ts
│   │   │   ├── distance.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── config/                 # Shared constants
│       ├── src/
│       │   ├── regions.ts
│       │   ├── facility-types.ts
│       │   └── index.ts
│       └── package.json
│
├── package.json                # Root workspace config
├── turbo.json                  # Turborepo config
└── pnpm-workspace.yaml
```

### 9.2 Shareable Code from Web App

| Code | Location | Shareable |
|------|----------|-----------|
| TypeScript interfaces | `src/types/*` | ✅ Extract to `packages/types` |
| Facility types enum | `prisma/schema.prisma` | ✅ Generate from Prisma |
| Region/District data | `src/lib/constants.ts` | ✅ Extract to `packages/config` |
| Validation schemas (Zod) | Various forms | ✅ Extract to `packages/utils` |
| Distance calculation | `src/app/page.tsx` | ✅ Extract to `packages/utils` |
| Date formatting | Various | ✅ Extract to `packages/utils` |
| API response types | API routes | ✅ Generate from OpenAPI |

### 9.3 Design Token Sharing

```typescript
// packages/ui-tokens/src/colors.ts
export const colors = {
  primary: {
    50: '#ecfdf5',
    500: '#10b981',  // emerald-500
    600: '#059669',  // emerald-600
    700: '#047857',  // emerald-700
  },
  emergency: {
    500: '#ef4444',  // red-500
    600: '#dc2626',  // red-600
  },
  // ... rest of color palette
};

// packages/ui-tokens/src/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
```

---

## Phase 10 — App Store Requirements

### 10.1 Apple App Store Checklist

#### Account & Setup
- [ ] Apple Developer Program enrolled ($99/year)
- [ ] App ID registered in Apple Developer Portal
- [ ] Provisioning profiles created (Development + Distribution)
- [ ] App Store Connect app record created

#### Required Assets
- [ ] App Icon: 1024x1024px PNG (no alpha, no rounded corners)
- [ ] Screenshots: 6.7" (iPhone 14 Pro Max), 6.5" (iPhone 11 Pro Max), 5.5" (iPhone 8 Plus)
- [ ] App Preview video (optional but recommended)

#### Required Information
- [ ] App Name: "Apomuden - Ghana Health"
- [ ] Subtitle: "Find Healthcare, Save Lives"
- [ ] Privacy Policy URL: `https://apomuden.vercel.app/privacy`
- [ ] Support URL: `https://apomuden.vercel.app/support`
- [ ] App Description (up to 4000 characters)
- [ ] Keywords (up to 100 characters)
- [ ] Age Rating questionnaire completed
- [ ] Export compliance answered

#### Critical Requirements
- [ ] **Sign in with Apple implemented** (MANDATORY if Google Sign-In exists)
- [ ] All permission usage descriptions in Info.plist
- [ ] Demo account credentials for App Review
- [ ] TestFlight build uploaded and tested

### 10.2 Google Play Store Checklist

#### Account & Setup
- [ ] Google Play Developer Account ($25 one-time)
- [ ] App created in Play Console
- [ ] App signing enrolled (Google Play App Signing)

#### Required Assets
- [ ] App Icon: 512x512px PNG
- [ ] Feature Graphic: 1024x500px
- [ ] Screenshots: Phone (min 2), 7" tablet, 10" tablet

#### Required Information
- [ ] Short description (up to 80 characters)
- [ ] Full description (up to 4000 characters)
- [ ] Privacy Policy URL
- [ ] **Data Safety section completed** (CRITICAL)
- [ ] Content rating questionnaire
- [ ] Target audience settings

#### Release Process
- [ ] Internal testing track → Closed testing → Open testing → Production
- [ ] Staged rollout recommended (10% → 50% → 100%)

---

## Phase 11 — Recommended Tech Stack

### 11.1 React Native + Expo Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | React Native + Expo SDK | 51.x |
| **Language** | TypeScript | 5.x |
| **Navigation** | React Navigation | 6.x |
| **State (Client)** | Zustand | 4.x |
| **State (Server)** | TanStack Query | 5.x |
| **API Client** | Axios | 1.x |
| **Forms** | React Hook Form + Zod | 7.x / 3.x |
| **Styling** | NativeWind (Tailwind) | 4.x |
| **UI Components** | Custom + Gluestack UI | - |
| **Maps** | react-native-maps | 1.x |
| **Push** | expo-notifications + FCM | - |
| **Storage (Secure)** | expo-secure-store | - |
| **Storage (General)** | MMKV | 2.x |
| **Database** | expo-sqlite + Drizzle | - |
| **Analytics** | Firebase Analytics | - |
| **Crash Reporting** | Sentry | - |
| **Testing** | Jest + RNTL + Detox | - |
| **CI/CD** | EAS Build + GitHub Actions | - |
| **OTA Updates** | EAS Update | - |

### 11.2 Package.json Dependencies

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "react-native": "0.74.x",
    "@react-navigation/native": "^6.x",
    "@react-navigation/native-stack": "^6.x",
    "@react-navigation/bottom-tabs": "^6.x",
    "@tanstack/react-query": "^5.x",
    "zustand": "^4.x",
    "axios": "^1.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x",
    "nativewind": "^4.x",
    "react-native-maps": "^1.x",
    "expo-location": "~17.x",
    "expo-notifications": "~0.28.x",
    "expo-secure-store": "~13.x",
    "expo-local-authentication": "~14.x",
    "expo-image-picker": "~15.x",
    "expo-linking": "~6.x",
    "expo-haptics": "~13.x",
    "react-native-mmkv": "^2.x",
    "expo-sqlite": "~14.x",
    "drizzle-orm": "^0.30.x",
    "@sentry/react-native": "^5.x",
    "@react-native-firebase/app": "^20.x",
    "@react-native-firebase/messaging": "^20.x"
  }
}
```

---

## Phase 12 — Implementation Roadmap

### Phase 0: Pre-Development (1-2 weeks)

| Task | Owner | Duration |
|------|-------|----------|
| Register Apple Developer Account | Lead | 1 day |
| Register Google Play Developer Account | Lead | 1 day |
| Set up Firebase project | Backend | 1 day |
| Implement mobile auth endpoints | Backend | 3 days |
| Implement device token endpoints | Backend | 2 days |
| Add Apple Sign-In backend verification | Backend | 2 days |
| Set up monorepo structure | Lead | 1 day |
| Extract shared packages | Lead | 2 days |
| Initialize Expo project | Mobile | 1 day |
| Configure EAS Build | Mobile | 1 day |
| Set up Sentry | Mobile | 0.5 day |

### Phase 1: Foundation & Auth (2-3 weeks)

| Task | Duration |
|------|----------|
| Project structure, navigation scaffold | 2 days |
| Design system (NativeWind tokens) | 2 days |
| API client with token refresh | 2 days |
| Secure token storage | 1 day |
| Login screen (Phone OTP) | 2 days |
| Login screen (Email/Password) | 1 day |
| Google Sign-In (PKCE) | 2 days |
| Apple Sign-In | 2 days |
| Biometric authentication | 1 day |
| Registration flow | 2 days |
| Forgot password flow | 1 day |
| Auth state management | 1 day |
| Logout flow | 0.5 day |
| Deep link setup | 1 day |

### Phase 2: Core Features (4-6 weeks)

| Task | Duration |
|------|----------|
| Home screen | 2 days |
| Facility search screen | 3 days |
| Facility detail screen | 2 days |
| Facility map view | 3 days |
| Emergency request flow | 3 days |
| Ambulance tracking screen | 2 days |
| Push notification setup | 2 days |
| Notification tap handling | 1 day |
| Symptom checker screen | 2 days |
| AI Chatbot (Kwasi) integration | 2 days |
| Telemedicine booking | 2 days |
| Video call integration | 3 days |
| Health alerts list | 1 day |
| Alert detail screen | 1 day |
| Profile screen | 2 days |
| Saved facilities | 1 day |
| Emergency contacts | 1 day |
| Notification settings | 1 day |
| Offline caching | 3 days |
| Pull-to-refresh | 0.5 day |
| Infinite scroll | 1 day |

### Phase 3: Polish & UX (2-3 weeks)

| Task | Duration |
|------|----------|
| Skeleton loaders | 2 days |
| Empty states | 1 day |
| Error states & retry | 2 days |
| Haptic feedback | 0.5 day |
| Screen transitions | 1 day |
| Splash screen | 0.5 day |
| App icon finalization | 0.5 day |
| Performance optimization | 2 days |
| Accessibility audit | 2 days |
| Dark mode (optional) | 2 days |
| Onboarding flow | 2 days |
| App rating prompt | 0.5 day |
| Connectivity banner | 0.5 day |

### Phase 4: Testing (1-2 weeks)

| Task | Duration |
|------|----------|
| Unit tests (business logic) | 2 days |
| Component tests | 2 days |
| Integration tests (API, auth) | 2 days |
| E2E tests (Detox) | 3 days |
| Manual testing (iOS devices) | 2 days |
| Manual testing (Android devices) | 2 days |
| Accessibility testing | 1 day |
| Performance testing | 1 day |
| Network condition testing | 1 day |
| Push notification E2E | 1 day |
| Deep link testing | 0.5 day |
| Beta testing (TestFlight + Internal) | 5 days |

### Phase 5: Launch (1-2 weeks)

| Task | Duration |
|------|----------|
| Production build (iOS) | 0.5 day |
| Production build (Android) | 0.5 day |
| App Store Connect metadata | 1 day |
| Google Play Console metadata | 1 day |
| Data Safety section | 1 day |
| Submit to Apple App Review | 1-3 days review |
| Submit to Google Play Review | 1-7 days review |
| Staged rollout | 3 days |
| Monitor crash reports | Ongoing |
| Monitor analytics | Ongoing |

---

## Phase 13 — Cost & Effort Estimate

### 13.1 Project Classification

**Classification:** MEDIUM APP
- **Screen Count:** ~25 screens
- **Features:** Auth, maps, real-time, push, offline, video
- **Complexity:** Moderate (emergency tracking, telemedicine)

### 13.2 Effort Estimate

| Team Size | Duration | Total Hours |
|-----------|----------|-------------|
| Solo Developer | 16-20 weeks | 640-800 hours |
| 2-Person Team | 10-14 weeks | 800-1120 hours |
| 3-Person Team | 8-10 weeks | 960-1200 hours |

### 13.3 Recurring Costs

| Service | Cost |
|---------|------|
| Apple Developer Program | $99/year |
| Google Play Developer | $25 one-time |
| Firebase (Spark Plan) | Free (up to limits) |
| Firebase (Blaze Plan) | ~$25-50/month at scale |
| Expo EAS Build | Free tier / $29/month |
| Sentry | Free tier / $26/month |
| Mapbox | Free tier (50K loads/month) |

**Estimated Monthly Cost:** $50-150/month at launch

---

## Phase 14 — Immediate Next Steps

### 10 Actions to Start This Week

1. **Register Apple Developer Account** — Start the enrollment process ($99/year, takes 24-48 hours to approve)

2. **Register Google Play Developer Account** — One-time $25 fee, instant access

3. **Set up Firebase Project** — Create project, enable Cloud Messaging, download config files

4. **Create Mobile Auth Endpoints** — Implement `/api/auth/mobile/login`, `/api/auth/mobile/refresh`, `/api/auth/mobile/logout`

5. **Create Device Token Endpoints** — Implement `/api/devices/register` and `/api/devices/unregister`

6. **Add `device_tokens` Table** — Run Prisma migration to add the new table

7. **Initialize Expo Project** — Run `npx create-expo-app@latest apomuden-mobile --template tabs`

8. **Set up Monorepo** — Move web app to `apps/web`, mobile to `apps/mobile`, create `packages/types`

9. **Extract Shared Types** — Move TypeScript interfaces to `packages/types`

10. **Configure EAS Build** — Run `eas build:configure` and set up GitHub Actions workflow

---

## Appendix A — API Endpoint Reference

### Authentication Endpoints (New for Mobile)

```typescript
// POST /api/auth/mobile/login
Request: { phone: string, otp: string } | { email: string, password: string }
Response: { accessToken: string, refreshToken: string, expiresIn: number, user: User }

// POST /api/auth/mobile/refresh
Request: { refreshToken: string }
Response: { accessToken: string, expiresIn: number }

// POST /api/auth/mobile/logout
Request: { refreshToken: string }
Response: { success: boolean }

// POST /api/auth/apple
Request: { identityToken: string, fullName?: { givenName: string, familyName: string } }
Response: { accessToken: string, refreshToken: string, user: User }

// POST /api/auth/google
Request: { idToken: string }
Response: { accessToken: string, refreshToken: string, user: User }
```

### Device Token Endpoints (New)

```typescript
// POST /api/devices/register
Request: { token: string, platform: 'ios' | 'android' }
Response: { success: boolean }

// DELETE /api/devices/unregister
Request: { token: string }
Response: { success: boolean }
```

---

## Appendix B — File Structure for Mobile App

```
apps/mobile/
├── app/                        # Expo Router (file-based routing)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── index.tsx           # Home
│   │   ├── emergency.tsx
│   │   ├── health.tsx
│   │   ├── alerts.tsx
│   │   └── profile.tsx
│   ├── facilities/
│   │   ├── index.tsx           # Search
│   │   ├── [slug].tsx          # Detail
│   │   └── map.tsx
│   ├── _layout.tsx
│   └── +not-found.tsx
├── components/
│   ├── ui/                     # Reusable UI components
│   ├── facilities/
│   ├── emergency/
│   └── common/
├── hooks/
│   ├── useAuth.ts
│   ├── useLocation.ts
│   └── usePushNotifications.ts
├── services/
│   ├── api.ts
│   ├── auth.ts
│   ├── storage.ts
│   └── notifications.ts
├── stores/
│   ├── authStore.ts
│   └── settingsStore.ts
├── utils/
│   └── index.ts
├── app.json
├── eas.json
├── tailwind.config.js
└── package.json
```

---

**Report Generated:** March 14, 2026  
**Next Review:** After Phase 0 completion  
**Document Owner:** Apomuden Development Team
