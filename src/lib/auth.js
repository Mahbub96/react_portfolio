import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextResponse } from "next/server";

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Rate limiting storage (in production, use Redis)
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Secure password hashing
export async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Secure password verification
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload) {
  if (!JWT_SECRET || JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
    console.warn('Using default JWT secret. Please set JWT_SECRET environment variable in production.');
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    if (!JWT_SECRET || JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
      console.warn('Using default JWT secret. Please set JWT_SECRET environment variable in production.');
    }
    
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('JWT token expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.log('Invalid JWT token');
    } else {
      console.error('JWT verification error:', error.message);
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

// Authentication middleware
export function authenticateToken(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return { valid: false, error: 'Access token required' };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return { valid: false, error: 'Invalid or expired token' };
    }

    return { valid: true, user: decoded };
  } catch (error) {
    return { valid: false, error: 'Authentication failed' };
  }
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