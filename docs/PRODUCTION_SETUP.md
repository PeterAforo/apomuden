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

### 4. SMS Gateway (mNotify)
Sign up at: https://mnotify.com/

```env
MNOTIFY_API_KEY="your-mnotify-api-key"
MNOTIFY_SENDER_ID="Apomuden"
```

### 5. Maps (Mapbox)
Get API key at: https://mapbox.com/

```env
NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-access-token"
```

### 6. Real-time WebSocket (Pusher)
Sign up at: https://pusher.com/

```env
NEXT_PUBLIC_PUSHER_KEY="your-pusher-app-key"
NEXT_PUBLIC_PUSHER_CLUSTER="eu"
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_SECRET="your-pusher-secret"
```

### 7. Video Calls (Daily.co)
Sign up at: https://daily.co/

```env
DAILY_API_KEY="your-daily-api-key"
NEXT_PUBLIC_DAILY_DOMAIN="your-daily-domain"
```

### 8. AI/Chatbot (Optional - for enhanced responses)
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
- [ ] SMS sending works (test with mNotify)
- [ ] Chatbot responds in all 5 languages

---

## Optional Enhancements (Future)

### Cloud Image Storage
Currently using base64. For production:
- Use Cloudinary, AWS S3, or Vercel Blob
- Update `src/app/register-facility/page.tsx`

### Real-time Features (Already Implemented)
- **GPS Tracking**: Uses Pusher for real-time ambulance location updates
- **Video Calls**: Uses Daily.co for telemedicine consultations
- Both fall back to simulation/mock mode if API keys are not configured

---

## Support
For technical support, contact the development team.
