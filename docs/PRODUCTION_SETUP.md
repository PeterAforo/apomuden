# Apomuden Production Setup Guide

## Environment Variables Required for Production

### 1. Database
```env
DATABASE_URL="postgresql://user:password@host:5432/apomuden?schema=public"
```

### 2. Authentication (NextAuth)
```env
NEXTAUTH_URL="https://apomuden.vercel.app"
NEXTAUTH_SECRET="your-secure-random-string-min-32-chars"
```

### 3. Push Notifications (VAPID Keys)
Generate VAPID keys at: https://vapidkeys.com/

```env
NEXT_PUBLIC_VAPID_KEY="your-public-vapid-key"
VAPID_PRIVATE_KEY="your-private-vapid-key"
VAPID_SUBJECT="mailto:admin@apomuden.gov.gh"
```

### 4. SMS Gateway (Hubtel)
Sign up at: https://hubtel.com/

```env
HUBTEL_CLIENT_ID="your-hubtel-client-id"
HUBTEL_CLIENT_SECRET="your-hubtel-client-secret"
HUBTEL_SENDER_ID="APOMUDEN"
```

### 5. Maps (Mapbox)
Get API key at: https://mapbox.com/

```env
NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-access-token"
```

### 6. AI/Chatbot (Optional - for enhanced responses)
```env
OPENAI_API_KEY="your-openai-api-key"
# OR
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

---

## Post-Deployment Checklist

### Database Setup
1. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```

2. Seed initial data:
   ```bash
   npx prisma db seed
   ```

3. Seed facilities (call API):
   ```bash
   curl -X POST https://apomuden.vercel.app/api/admin/seed-facilities
   ```

### Verify Features
- [ ] User registration/login works
- [ ] Facility search returns results
- [ ] Map displays correctly
- [ ] Push notifications can be subscribed
- [ ] SMS sending works (test with Hubtel sandbox)
- [ ] Chatbot responds in all 5 languages

---

## Optional Enhancements (Future)

### Real-time WebSocket for GPS Tracking
Currently using polling simulation. For real-time:
- Use Pusher, Ably, or Socket.io
- Update `src/app/dashboard/track-ambulance/page.tsx`

### Video Calls for Telemedicine
Currently mock implementation. For real video:
- Integrate Twilio Video, Daily.co, or Jitsi
- Update `src/app/dashboard/telemedicine/page.tsx`

### Cloud Image Storage
Currently using base64. For production:
- Use Cloudinary, AWS S3, or Vercel Blob
- Update `src/app/register-facility/page.tsx`

---

## Support
For technical support, contact the development team.
