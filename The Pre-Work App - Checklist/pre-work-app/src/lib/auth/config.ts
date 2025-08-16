// Authentication configuration and utilities

import { UserRole } from '../../types/user';
import { Permission } from '../../types/user';

export const AUTH_CONFIG = {
  JWT_EXPIRY: '1h',
  REFRESH_TOKEN_EXPIRY: '7d',
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_SPECIAL: true,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
};

export const OAUTH_PROVIDERS = {
  APPLE: {
    clientId: process.env.APPLE_CLIENT_ID,
    redirectUri: process.env.APPLE_REDIRECT_URI,
  },
  GOOGLE: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  MICROSOFT: {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  },
};

export class AuthUtils {
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
    }
    
    if (AUTH_CONFIG.PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static hasPermission(userRole: UserRole, requiredPermission: string): boolean {
    // Implementation would check against role permissions
    // For now, simplified version
    const roleHierarchy = {
      user: 1,
      manager: 2,
      supervisor: 3,
      administrator: 4,
      auditor: 0,
    };

    // Administrators have all permissions
    if (userRole === 'administrator') return true;

    // Add specific permission checking logic here
    return false;
  }

  static generateSessionId(): string {
    return crypto.randomUUID();
  }

  static isSessionExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }
}
