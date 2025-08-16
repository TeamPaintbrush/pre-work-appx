// Authentication and authorization types

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationCode?: string;
}

export interface AuthResponse {
  user: User;
  profile: UserProfile;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}

export interface AuthProvider {
  id: string;
  name: string;
  type: 'oauth' | 'saml' | 'ldap';
  config: Record<string, any>;
  enabled: boolean;
}

import { User, UserProfile } from './user';
