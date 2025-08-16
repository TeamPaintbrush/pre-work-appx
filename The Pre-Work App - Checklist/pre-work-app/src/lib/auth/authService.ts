import { v4 as uuidv4 } from 'uuid';
import { createAuditLog } from '../database/audit';
import { UserRepository, ProfileRepository } from '../database/repositories';
import { User, Profile } from '../database/schemas';

export interface AuthUser extends User {
  permissions: Permission[];
  profile?: Profile;
  lastLogin: Date;
  teamId?: string;
  organizationId?: string;
}

export type UserRole = 
  | 'super_admin'
  | 'administrator'
  | 'manager'
  | 'supervisor' 
  | 'user'
  | 'auditor'
  | 'readonly'
  | 'guest';

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
}

export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  userAgent: string;
}

export interface AuditData {
  ipAddress?: string;
  userAgent?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  dashboardLayout: DashboardConfig;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  taskReminders: boolean;
  teamUpdates: boolean;
  systemAlerts: boolean;
}

export interface DashboardConfig {
  layout: 'grid' | 'list';
  widgets: string[];
  defaultView: string;
}

class AuthenticationService {
  private static instance: AuthenticationService;
  private sessions: Map<string, AuthSession> = new Map();

  static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  /**
   * Authenticate user with email/password
   */
  async authenticateUser(
    credentials: LoginCredentials, 
    deviceInfo: DeviceInfo, 
    ipAddress: string
  ): Promise<{
    success: boolean;
    user?: AuthUser;
    session?: AuthSession;
    error?: string;
  }> {
    try {
      // TODO: Implement actual password verification
      // For now, simulate authentication logic
      const user = await UserRepository.getUserByEmail(credentials.email);
      
      if (!user || !user.isActive) {
        // Log failed login attempt
        await createAuditLog({
          action: 'USER_LOGIN_FAILED',
          entityType: 'user',
          userId: 'anonymous', // No user ID for failed login
          entityId: 'anonymous',
          newValues: {
            email: credentials.email,
            reason: 'user_not_found_or_inactive',
          },
          ipAddress,
          userAgent: deviceInfo.userAgent,
        });
        
        return {
          success: false,
          error: 'Invalid credentials or inactive account'
        };
      }

      // Create session
      const session = await this.createSession(user.userId, deviceInfo, ipAddress);
      
      // Get user permissions based on role
      const permissions = this.getPermissionsForRole(user.role);
      
      // Get user profile
      const profile = await ProfileRepository.getProfileByUserId(user.userId);
      
      const authUser: AuthUser = {
        ...user,
        permissions,
        profile: profile || undefined,
        lastLogin: new Date()
      };

      // Update last login
      await UserRepository.updateUser(user.userId, {
        lastLoginAt: new Date().toISOString()
      });

      // Log successful authentication
      await createAuditLog({
        action: 'USER_LOGIN_SUCCESS',
        entityType: 'user',
        userId: user.userId,
        entityId: user.userId,
        newValues: {
          provider: 'email',
          deviceType: deviceInfo.deviceType,
          browser: deviceInfo.browser,
        },
        ipAddress,
        userAgent: deviceInfo.userAgent,
      });

      return {
        success: true,
        user: authUser,
        session
      };

    } catch (error) {
      console.error('Authentication error:', error);
      
      // Log authentication error
      await createAuditLog({
        action: 'USER_LOGIN_ERROR',
        entityType: 'user',
        userId: 'system',
        entityId: 'system',
        newValues: {
          error: error instanceof Error ? error.message : 'Unknown error',
          email: credentials.email,
        },
        ipAddress,
        userAgent: deviceInfo.userAgent,
      });

      return {
        success: false,
        error: 'Authentication failed due to system error'
      };
    }
  }

  /**
   * Create a new session for authenticated user
   */
  private async createSession(
    userId: string,
    deviceInfo: DeviceInfo,
    ipAddress: string
  ): Promise<AuthSession> {
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8); // 8 hour session

    const session: AuthSession = {
      sessionId,
      userId,
      expiresAt,
      deviceInfo,
      ipAddress,
      isActive: true
    };

    // Store session in memory (in production, use Redis or database)
    this.sessions.set(sessionId, session);

    // Log session creation
    await createAuditLog({
      action: 'SESSION_CREATED',
      entityType: 'user',
      userId,
      entityId: sessionId,
      newValues: {
        expiresAt: expiresAt.toISOString(),
        deviceType: deviceInfo.deviceType,
      },
      ipAddress,
      userAgent: deviceInfo.userAgent,
    });

    return session;
  }

  /**
   * Validate and refresh session
   */
  async validateSession(sessionId: string): Promise<{
    valid: boolean;
    session?: AuthSession;
    user?: AuthUser;
  }> {
    const session = this.sessions.get(sessionId);
    
    if (!session || !session.isActive || session.expiresAt < new Date()) {
      // Clean up expired session
      if (session) {
        this.sessions.delete(sessionId);
        
        await createAuditLog({
          action: 'SESSION_EXPIRED',
          entityType: 'user',
          userId: session.userId,
          entityId: sessionId,
          oldValues: {
            expiresAt: session.expiresAt.toISOString(),
          },
          ipAddress: session.ipAddress,
          userAgent: session.deviceInfo.userAgent,
        });
      }
      
      return { valid: false };
    }

    // Get user data
    const user = await UserRepository.getUserById(session.userId);
    if (!user || !user.isActive) {
      return { valid: false };
    }

    // Get user permissions and profile
    const permissions = this.getPermissionsForRole(user.role);
    const profile = await ProfileRepository.getProfileByUserId(user.userId);
    
    const authUser: AuthUser = {
      ...user,
      permissions,
      profile: profile || undefined,
      lastLogin: new Date()
    };

    return {
      valid: true,
      session,
      user: authUser
    };
  }

  /**
   * Logout user and invalidate session
   */
  async logout(sessionId: string, auditData?: AuditData): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      // Mark session as inactive
      session.isActive = false;
      this.sessions.delete(sessionId);

      // Log logout
      await createAuditLog({
        action: 'USER_LOGOUT',
        entityType: 'user',
        userId: session.userId,
        entityId: sessionId,
        oldValues: {
          sessionActive: true,
        },
        newValues: {
          sessionActive: false,
        },
        ipAddress: auditData?.ipAddress || session.ipAddress,
        userAgent: auditData?.userAgent || session.deviceInfo.userAgent,
      });
    }
  }

  /**
   * Get permissions for a user role
   */
  private getPermissionsForRole(role: UserRole): Permission[] {
    const rolePermissions: Record<UserRole, Permission[]> = {
      super_admin: [
        'checklist.create', 'checklist.edit', 'checklist.delete', 'checklist.assign',
        'team.manage', 'user.manage', 'analytics.view', 'export.data', 'system.admin'
      ],
      administrator: [
        'checklist.create', 'checklist.edit', 'checklist.delete', 'checklist.assign',
        'team.manage', 'user.manage', 'analytics.view', 'export.data'
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
      ],
      readonly: [],
      guest: []
    };

    return rolePermissions[role] || [];
  }

  /**
   * Check if user has specific permission
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
   * Get all active sessions for debugging/admin purposes
   */
  getActiveSessions(): AuthSession[] {
    return Array.from(this.sessions.values()).filter(session => 
      session.isActive && session.expiresAt > new Date()
    );
  }

  /**
   * Force logout all sessions for a user
   */
  async logoutAllUserSessions(userId: string, auditData?: AuditData): Promise<void> {
    const userSessions = Array.from(this.sessions.values())
      .filter(session => session.userId === userId && session.isActive);

    for (const session of userSessions) {
      await this.logout(session.sessionId, auditData);
    }
  }
}

export const authService = AuthenticationService.getInstance();
export default authService;
