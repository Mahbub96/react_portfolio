import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextResponse } from "next/server";

// JWT configuration
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const MIN_SECRET_LENGTH = 32;

// Rate limiting storage (in production, use Redis)
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * The signing secret, read at call time (not import time) so `next build`
 * works without it. There is deliberately no shared default: in production a
 * missing or short secret makes signing and verifying fail closed. In
 * development a random per-process secret is used, so sessions end when the
 * dev server restarts.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  // Reject the length check's obvious bypass: a copied example placeholder.
  if (secret && secret.length >= MIN_SECRET_LENGTH && !/change-this|your-super-secret/i.test(secret)) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`JWT_SECRET must be set to at least ${MIN_SECRET_LENGTH} characters`);
  }

  if (!global.__devJwtSecret) {
    global.__devJwtSecret = randomBytes(32).toString('hex');
    console.warn('JWT_SECRET is not set; using a random development secret.');
  }
  return global.__devJwtSecret;
}

// Secure password hashing
export async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Secure password verification
export async function verifyPassword(password, hashedPassword) {
  if (!hashedPassword) return false;
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    if (error.name !== 'TokenExpiredError' && error.name !== 'JsonWebTokenError') {
      console.log('JWT verification error:', error.message);
    }
    return null;
  }
}

// Rate limiting for login attempts
export function checkLoginRateLimit(identifier) {
  const now = Date.now();
  const userAttempts = loginAttempts.get(identifier);

  if (!userAttempts) {
    loginAttempts.set(identifier, { count: 1, resetTime: now + LOCKOUT_DURATION });
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - 1 };
  }

  // Reset if lockout period has passed
  if (now > userAttempts.resetTime) {
    loginAttempts.set(identifier, { count: 1, resetTime: now + LOCKOUT_DURATION });
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - 1 };
  }

  // Check if user is locked out
  if (userAttempts.count >= MAX_LOGIN_ATTEMPTS) {
    return { 
      allowed: false, 
      remainingAttempts: 0,
      lockoutTime: userAttempts.resetTime - now
    };
  }

  // Increment attempt count
  userAttempts.count++;
  loginAttempts.set(identifier, userAttempts);

  return { 
    allowed: true, 
    remainingAttempts: MAX_LOGIN_ATTEMPTS - userAttempts.count 
  };
}

// Reset login attempts on successful login
export function resetLoginAttempts(identifier) {
  loginAttempts.delete(identifier);
}

// Input sanitization
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

// Validate email format
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// Generate secure random string
export function generateSecureToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Secure response helper
export function secureResponse(data, status = 200) {
  const response = NextResponse.json(data, { status });
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
} 