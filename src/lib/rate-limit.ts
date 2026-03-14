import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production for multi-instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  const keys = Array.from(rateLimitStore.keys());
  keys.forEach((key) => {
    const entry = rateLimitStore.get(key);
    if (entry && entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  });
}, 60000); // Clean up every minute

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfIp = request.headers.get("cf-connecting-ip");
  
  const ip = cfIp || realIp || forwarded?.split(",")[0]?.trim() || "unknown";
  return ip;
}

/**
 * Check if request is rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): { limited: boolean; remaining: number; resetIn: number } {
  const clientId = getClientId(request);
  const key = `${clientId}:${request.nextUrl.pathname}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // Create new entry
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetIn = entry.resetTime - now;

  return {
    limited: entry.count > config.maxRequests,
    remaining,
    resetIn,
  };
}

/**
 * Rate limit response helper
 */
export function rateLimitResponse(resetIn: number): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message: "Too many requests. Please try again later.",
      retryAfter: Math.ceil(resetIn / 1000),
    },
    {
      status: 429,
      headers: {
        "Retry-After": Math.ceil(resetIn / 1000).toString(),
        "X-RateLimit-Reset": new Date(Date.now() + resetIn).toISOString(),
      },
    }
  );
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { limited, remaining, resetIn } = checkRateLimit(request, config);

    if (limited) {
      return rateLimitResponse(resetIn);
    }

    const response = await handler(request);
    
    // Add rate limit headers to response
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", new Date(Date.now() + resetIn).toISOString());
    
    return response;
  };
}

// Preset configurations for different endpoints
export const RATE_LIMITS = {
  // Strict limit for auth endpoints (5 requests per minute)
  AUTH: { windowMs: 60000, maxRequests: 5 },
  // OTP sending (3 requests per 5 minutes)
  OTP: { windowMs: 300000, maxRequests: 3 },
  // General API (60 requests per minute)
  API: { windowMs: 60000, maxRequests: 60 },
  // Admin endpoints (30 requests per minute)
  ADMIN: { windowMs: 60000, maxRequests: 30 },
};
