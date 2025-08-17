// Core user and profile types for the enterprise system

export type UserRole = 'user' | 'manager' | 'administrator' | 'supervisor' | 'auditor';

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  organizationId?: string;
  managerId?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
  bio?: string;
  timezone: string;
  language: string;
  notifications: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  taskUpdates: boolean;
  approvalRequests: boolean;
  systemAlerts: boolean;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  allowSelfRegistration: boolean;
  requireApproval: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  retentionPeriod: number;
}

export interface UserSession {
  userId: string;
  role: UserRole;
  organizationId?: string;
  permissions: Permission[];
  expiresAt: Date;
}

export interface Permission {
  resource: string;
  action: string;
  scope?: string;
}
