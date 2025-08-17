/**
 * Enterprise Authentication Service - Simplified & Compatible
 * Builds on existing database structure while adding enterprise features
 */

import { UserRepository } from '../database/users';
import { ProfileRepository } from '../database/profiles';
import { createAuditLog } from '../database/audit';
import { v4 as uuidv4 } from 'uuid';

// Re-export existing types and extend them
export type UserRole = 'user' | 'manager' | 'supervisor' | 'administrator' | 'auditor';

export type Permission = 
  | 'checklist.create'
  | 'checklist.edit'
  | 'checklist.delete'
  | 'checklist.assign'
  | 'team.manage'
  | 'user.manage'
  | 'analytics.view'
  | 'export.data'
  | 'system.admin';

export interface AuthUser {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  teamId?: string;
  organizationId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  organizationCode?: string;
}

export interface AuthSession {
  sessionId: string;
  userId: string;
  expiresAt: Date;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  isActive: boolean;
  createdAt: Date;
}

export interface DeviceInfo {
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
}

export interface AuthenticationResult {
  success: boolean;
  user?: AuthUser;
  session?: AuthSession;
  error?: string;
  requiresMFA?: boolean;
  temporaryToken?: string;
}

class EnterpriseAuthService {
  private static instance: EnterpriseAuthService;
  private sessions: Map<string, AuthSession> = new Map();

  static getInstance(): EnterpriseAuthService {
    if (!EnterpriseAuthService.instance) {
      EnterpriseAuthService.instance = new EnterpriseAuthService();
    }
    return EnterpriseAuthService.instance;
  }

  /**
   * Authenticate user with email/password
   */
  async authenticateUser(
    credentials: LoginCredentials, 
    deviceInfo: DeviceInfo, 
    ipAddress: string
  ): Promise<AuthenticationResult> {
    try {
      // Log authentication attempt
      await createAuditLog({
        userId: 'system', // Use system for login attempts
        entityType: 'user',
        entityId: credentials.email,
        action: 'login_attempt',
        newValues: { 
          email: credentials.email, 
          ipAddress,
          deviceType: deviceInfo.deviceType
        },
      });

      // Get user by email
      const user = await UserRepository.getUserByEmail(credentials.email);
      
      if (!user) {
        await createAuditLog({
          userId: 'system',
          entityType: 'user',
          entityId: credentials.email,
          action: 'login_failed',
          newValues: { reason: 'user_not_found', ipAddress },
        });
        
        return {
          success: false,
          error: 'Invalid credentials'
        };
      }

      if (!user.isActive) {
        await createAuditLog({
          userId: user.userId,
          entityType: 'user',
          entityId: user.userId,
          action: 'login_failed',
          newValues: { reason: 'account_inactive', ipAddress },
        });
        
        return {
          success: false,
          error: 'Account is inactive'
        };
      }

      // TODO: Implement actual password verification with bcrypt
      // For now, simulate successful authentication

      // Create session
      const session = await this.createSession(user.userId, deviceInfo, ipAddress);
      
      // Get user permissions based on role
      const permissions = this.getPermissionsForRole(user.role);
      
      const authUser: AuthUser = {
        userId: user.userId,
        email: user.email,
        username: user.username,
        role: user.role,
        permissions,
        isActive: user.isActive,
        lastLogin: new Date()
      };

      // Log successful authentication
      await createAuditLog({
        userId: user.userId,
        entityType: 'user',
        entityId: user.userId,
        action: 'login_success',
        newValues: { 
          ipAddress, 
          deviceType: deviceInfo.deviceType,
          sessionId: session.sessionId
        },
      });

      return {
        success: true,
        user: authUser,
        session
      };

    } catch (error) {
      await createAuditLog({
        userId: 'system',
        entityType: 'user',
        entityId: credentials.email,
        action: 'auth_error',
        newValues: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          ipAddress 
        },
      });

      return {
        success: false,
        error: 'Authentication service error'
      };
    }
  }

  /**
   * Create user session
   */
  async createSession(userId: string, deviceInfo: DeviceInfo, ipAddress: string): Promise<AuthSession> {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
    const createdAt = new Date();

    const session: AuthSession = {
      sessionId,
      userId,
      expiresAt,
      deviceInfo,
      ipAddress,
      isActive: true,
      createdAt
    };

    this.sessions.set(sessionId, session);
    
    // Log session creation
    await createAuditLog({
      userId: userId,
      entityType: 'user',
      entityId: sessionId,
      action: 'session_created',
      newValues: { 
        deviceType: deviceInfo.deviceType,
        ipAddress,
        expiresAt: expiresAt.toISOString()
      },
    });
    
    return session;
  }

  /**
   * Validate session
   */
  async validateSession(sessionId: string): Promise<{
    valid: boolean;
    session?: AuthSession;
    user?: AuthUser;
  }> {
    const session = this.sessions.get(sessionId);
    
    if (!session || !session.isActive || session.expiresAt < new Date()) {
      if (session) {
        await createAuditLog({
          userId: session.userId,
          entityType: 'user',
          entityId: sessionId,
          action: 'session_expired',
          newValues: { reason: 'expired_or_invalid' },
        });
      }
      return { valid: false };
    }

    // Get current user data
    const user = await UserRepository.getUserById(session.userId);
    if (!user || !user.isActive) {
      return { valid: false };
    }

    const permissions = this.getPermissionsForRole(user.role);
    
    const authUser: AuthUser = {
      userId: user.userId,
      email: user.email,
      username: user.username,
      role: user.role,
      permissions,
      isActive: user.isActive,
      lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined
    };

    return {
      valid: true,
      session,
      user: authUser
    };
  }

  /**
   * Logout user
   */
  async logout(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      session.isActive = false;
      this.sessions.delete(sessionId);
      
      await createAuditLog({
        userId: session.userId,
        entityType: 'user',
        entityId: sessionId,
        action: 'logout',
        newValues: { 
          sessionDuration: Date.now() - session.createdAt.getTime()
        },
      });
      
      return true;
    }
    
    return false;
  }

  /**
   * Get permissions for user role
   */
  private getPermissionsForRole(role: UserRole): Permission[] {
    const rolePermissions: Record<UserRole, Permission[]> = {
      administrator: [
        'checklist.create', 'checklist.edit', 'checklist.delete', 'checklist.assign',
        'team.manage', 'user.manage', 'analytics.view', 'export.data', 'system.admin'
      ],
      manager: [
        'checklist.create', 'checklist.edit', 'checklist.assign',
        'team.manage', 'analytics.view', 'export.data'
      ],
      supervisor: [
        'checklist.create', 'checklist.edit', 'checklist.assign',
        'analytics.view'
      ],
      user: [
        'checklist.create', 'checklist.edit'
      ],
      auditor: [
        'analytics.view', 'export.data'
      ]
    };

    return rolePermissions[role] || [];
  }

  /**
   * Check if user has permission
   */
  hasPermission(user: AuthUser, permission: Permission): boolean {
    return user.permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(user: AuthUser, permissions: Permission[]): boolean {
    return permissions.some(permission => user.permissions.includes(permission));
  }

  /**
   * Get active sessions for user
   */
  async getActiveSessions(userId: string): Promise<AuthSession[]> {
    return Array.from(this.sessions.values())
      .filter(session => session.userId === userId && session.isActive);
  }

  /**
   * Revoke all sessions for user
   */
  async revokeAllSessions(userId: string): Promise<void> {
    const userSessions = Array.from(this.sessions.entries())
      .filter(([_, session]) => session.userId === userId);
    
    userSessions.forEach(([sessionId, session]) => {
      session.isActive = false;
      this.sessions.delete(sessionId);
    });

    await createAuditLog({
      userId: userId,
      entityType: 'user',
      entityId: userId,
      action: 'sessions_revoked',
      newValues: { sessionCount: userSessions.length },
    });
  }

  /**
   * Refresh session (extend expiration)
   */
  async refreshSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    
    if (session && session.isActive) {
      session.expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // Extend 24 hours
      
      await createAuditLog({
        userId: session.userId,
        entityType: 'user',
        entityId: sessionId,
        action: 'session_refreshed',
        newValues: { newExpiresAt: session.expiresAt.toISOString() },
      });
      
      return true;
    }
    
    return false;
  }

  /**
   * Get session info
   */
  getSessionInfo(sessionId: string): AuthSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    const expiredSessions = Array.from(this.sessions.entries())
      .filter(([_, session]) => session.expiresAt < now);
    
    expiredSessions.forEach(([sessionId]) => {
      this.sessions.delete(sessionId);
    });

    if (expiredSessions.length > 0) {
      await createAuditLog({
        userId: 'system',
        entityType: 'user', 
        entityId: 'session_cleanup',
        action: 'cleanup_expired_sessions',
        newValues: { cleanedCount: expiredSessions.length },
      });
    }

    return expiredSessions.length;
  }
}

export const enterpriseAuth = EnterpriseAuthService.getInstance();
