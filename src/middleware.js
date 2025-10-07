import { NextResponse } from 'next/server';

// Rate limiting storage (in production, use Redis or similar)
const rateLimit = new Map();

// Rate limiting function
function checkRateLimit(identifier, windowMs = 60000, maxRequests = 100) {
  const now = Date.now();
  
  if (!rateLimit.has(identifier)) {
    rateLimit.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const userLimit = rateLimit.get(identifier);

  if (now > userLimit.resetTime) {
    rateLimit.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Get client IP address
function getClientIP(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0] ||
         request.headers.get("x-real-ip") ||
         request.headers.get("x-client-ip") ||
         request.headers.get("cf-connecting-ip") ||
         "unknown";
}

// Security middleware
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);

  // Security headers for all responses
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // API rate limiting
  if (pathname.startsWith('/api/')) {
    // Different rate limits for different endpoints
    let windowMs = 60000; // 1 minute default
    let maxRequests = 100; // 100 requests per minute default

    if (pathname.startsWith('/api/auth/')) {
      windowMs = 900000; // 15 minutes for auth
      maxRequests = 10; // 10 requests per 15 minutes
    } else if (pathname.startsWith('/api/contact')) {
      windowMs = 900000; // 15 minutes for contact form
      maxRequests = 3; // 3 requests per 15 minutes
    } else if (pathname.startsWith('/api/upload')) {
      windowMs = 60000; // 1 minute for uploads
      maxRequests = 10; // 10 uploads per minute
    }

    const identifier = `${clientIP}:${pathname}`;
    
    if (!checkRateLimit(identifier, windowMs, maxRequests)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many requests', 
          retryAfter: Math.ceil(windowMs / 60000) + ' minutes' 
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(windowMs / 1000).toString(),
          }
        }
      );
    }
  }

  // Block suspicious requests
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousPatterns = [
    /bot|crawler|spider/i,
    /sqlmap|nikto|nmap/i,
    /\.\.\//, // Directory traversal
    /<script|javascript:/i, // XSS attempts
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userAgent) || pattern.test(pathname)) {
      console.warn(`Suspicious request blocked: ${pathname} from ${clientIP} with UA: ${userAgent}`);
      return new NextResponse(
        JSON.stringify({ error: 'Request blocked' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // Block requests with suspicious query parameters
  const url = new URL(request.url);
  const suspiciousQueryParams = ['<script', 'javascript:', 'data:', 'vbscript:'];
  
  for (const [key, value] of url.searchParams.entries()) {
    for (const suspicious of suspiciousQueryParams) {
      if (key.toLowerCase().includes(suspicious) || value.toLowerCase().includes(suspicious)) {
        console.warn(`Suspicious query parameter blocked: ${key}=${value} from ${clientIP}`);
        return new NextResponse(
          JSON.stringify({ error: 'Invalid request parameters' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
  }

  // Log suspicious activity
  if (pathname.includes('admin') || pathname.includes('login') || pathname.includes('auth')) {
    console.log(`Auth-related request: ${pathname} from ${clientIP} at ${new Date().toISOString()}`);
  }

  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 