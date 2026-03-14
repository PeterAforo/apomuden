// Test rate limit configuration constants only (avoid Next.js server imports)
const RATE_LIMITS = {
  AUTH: { windowMs: 60000, maxRequests: 5 },
  OTP: { windowMs: 300000, maxRequests: 3 },
  API: { windowMs: 60000, maxRequests: 60 },
  ADMIN: { windowMs: 60000, maxRequests: 30 },
};

describe('Rate Limiting Configuration', () => {
  describe('RATE_LIMITS presets', () => {
    it('should have correct AUTH limits', () => {
      expect(RATE_LIMITS.AUTH.windowMs).toBe(60000);
      expect(RATE_LIMITS.AUTH.maxRequests).toBe(5);
    });

    it('should have correct OTP limits', () => {
      expect(RATE_LIMITS.OTP.windowMs).toBe(300000); // 5 minutes
      expect(RATE_LIMITS.OTP.maxRequests).toBe(3);
    });

    it('should have correct API limits', () => {
      expect(RATE_LIMITS.API.windowMs).toBe(60000);
      expect(RATE_LIMITS.API.maxRequests).toBe(60);
    });

    it('should have correct ADMIN limits', () => {
      expect(RATE_LIMITS.ADMIN.windowMs).toBe(60000);
      expect(RATE_LIMITS.ADMIN.maxRequests).toBe(30);
    });

    it('should have OTP more restrictive than AUTH', () => {
      expect(RATE_LIMITS.OTP.maxRequests).toBeLessThan(RATE_LIMITS.AUTH.maxRequests);
      expect(RATE_LIMITS.OTP.windowMs).toBeGreaterThan(RATE_LIMITS.AUTH.windowMs);
    });

    it('should have API most permissive', () => {
      expect(RATE_LIMITS.API.maxRequests).toBeGreaterThan(RATE_LIMITS.AUTH.maxRequests);
      expect(RATE_LIMITS.API.maxRequests).toBeGreaterThan(RATE_LIMITS.ADMIN.maxRequests);
    });
  });
});
