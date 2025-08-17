import { useState, useEffect, useCallback } from 'react';
import { authService, AuthUser, LoginCredentials, DeviceInfo } from '../lib/auth/authService';

export interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Get device information
  const getDeviceInfo = useCallback((): DeviceInfo => {
    const userAgent = navigator.userAgent;
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
    }

    return {
      deviceType,
      browser: navigator.userAgent.split(' ').pop() || 'Unknown',
      os: navigator.platform || 'Unknown',
      userAgent,
    };
  }, []);

  // Get client IP (simplified)
  const getClientIP = useCallback(async (): Promise<string> => {
    try {
      // In production, you'd get this from your server
      return 'client-ip';
    } catch {
      return 'unknown';
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const deviceInfo = getDeviceInfo();
      const ipAddress = await getClientIP();

      const result = await authService.authenticateUser(credentials, deviceInfo, ipAddress);

      if (result.success && result.user && result.session) {
        setUser(result.user);
        setSessionId(result.session.sessionId);
        
        // Store session in localStorage
        localStorage.setItem('sessionId', result.session.sessionId);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        return true;
      } else {
        setError(result.error || 'Login failed');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getDeviceInfo, getClientIP]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      if (sessionId) {
        const ipAddress = await getClientIP();
        const userAgent = navigator.userAgent;
        
        await authService.logout(sessionId, { ipAddress, userAgent });
      }

      setUser(null);
      setSessionId(null);
      setError(null);
      
      // Clear local storage
      localStorage.removeItem('sessionId');
      localStorage.removeItem('user');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, getClientIP]);

  // Refresh session
  const refreshSession = useCallback(async (): Promise<void> => {
    const storedSessionId = localStorage.getItem('sessionId');
    
    if (!storedSessionId) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.validateSession(storedSessionId);
      
      if (result.valid && result.user) {
        setUser(result.user);
        setSessionId(storedSessionId);
      } else {
        // Session invalid, clear storage
        localStorage.removeItem('sessionId');
        localStorage.removeItem('user');
        setUser(null);
        setSessionId(null);
      }
    } catch (err) {
      console.error('Session refresh error:', err);
      // Clear invalid session
      localStorage.removeItem('sessionId');
      localStorage.removeItem('user');
      setUser(null);
      setSessionId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check permissions
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    return authService.hasPermission(user, permission as any);
  }, [user]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (!user) return false;
    return authService.hasAnyPermission(user, permissions as any);
  }, [user]);

  // Initialize auth state on mount
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Set up session validation interval
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(() => {
      refreshSession();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [sessionId, refreshSession]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshSession,
    hasPermission,
    hasAnyPermission,
  };
}

// Team collaboration hook
import { teamCollaborationService, Team, TeamMember, ChecklistAssignment } from '../lib/collaboration/teamService';

export interface UseTeamCollaborationReturn {
  teams: Team[];
  assignments: ChecklistAssignment[];
  isLoading: boolean;
  error: string | null;
  createTeam: (teamData: any) => Promise<Team | null>;
  joinTeam: (teamId: string) => Promise<void>;
  leaveTeam: (teamId: string) => Promise<void>;
  assignChecklist: (assignment: any) => Promise<ChecklistAssignment | null>;
  updateAssignmentStatus: (assignmentId: string, status: string, notes?: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useTeamCollaboration(userId?: string): UseTeamCollaborationReturn {
  const [teams, setTeams] = useState<Team[]>([]);
  const [assignments, setAssignments] = useState<ChecklistAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTeam = useCallback(async (teamData: any): Promise<Team | null> => {
    if (!userId) return null;
    
    setIsLoading(true);
    try {
      const team = await teamCollaborationService.createTeam(teamData, userId);
      setTeams(prev => [...prev, team]);
      return team;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const assignChecklist = useCallback(async (assignment: any): Promise<ChecklistAssignment | null> => {
    setIsLoading(true);
    try {
      const newAssignment = await teamCollaborationService.assignChecklist(assignment);
      setAssignments(prev => [...prev, newAssignment]);
      return newAssignment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign checklist');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAssignmentStatus = useCallback(async (
    assignmentId: string, 
    status: string, 
    notes?: string
  ): Promise<void> => {
    if (!userId) return;
    
    try {
      await teamCollaborationService.updateAssignmentStatus(assignmentId, status as any, userId, notes);
      setAssignments(prev => 
        prev.map(assignment => 
          assignment.assignmentId === assignmentId 
            ? { ...assignment, status: status as any }
            : assignment
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assignment');
    }
  }, [userId]);

  const refreshData = useCallback(async (): Promise<void> => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const [userTeams, userAssignments] = await Promise.all([
        teamCollaborationService.getUserTeams(userId),
        teamCollaborationService.getUserAssignments(userId),
      ]);
      
      setTeams(userTeams);
      setAssignments(userAssignments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const joinTeam = useCallback(async (teamId: string): Promise<void> => {
    // TODO: Implement team joining logic
    console.log('Joining team:', teamId);
  }, []);

  const leaveTeam = useCallback(async (teamId: string): Promise<void> => {
    // TODO: Implement team leaving logic
    console.log('Leaving team:', teamId);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    teams,
    assignments,
    isLoading,
    error,
    createTeam,
    joinTeam,
    leaveTeam,
    assignChecklist,
    updateAssignmentStatus,
    refreshData,
  };
}

// Real-time sync hook
import { realTimeSyncService, RealTimeEvent, CollaborationSession } from '../lib/realtime/syncService';

export interface UseRealTimeSyncReturn {
  isConnected: boolean;
  activeSessions: CollaborationSession[];
  joinSession: (entityId: string, entityType: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  subscribe: (callback: (event: RealTimeEvent) => void) => () => void;
  updateCursor: (cursor: { x: number; y: number; elementId?: string }) => Promise<void>;
}

export function useRealTimeSync(
  entityId?: string,
  entityType?: string,
  userName?: string,
  userId?: string
): UseRealTimeSyncReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [activeSessions, setActiveSessions] = useState<CollaborationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);

  const joinSession = useCallback(async (
    targetEntityId: string, 
    targetEntityType: string
  ): Promise<void> => {
    if (!userId || !userName) return;
    
    try {
      const session = await realTimeSyncService.joinSession(
        userId,
        userName,
        targetEntityId,
        targetEntityType
      );
      
      setCurrentSession(session);
      setIsConnected(true);
      
      // Update active sessions
      const sessions = realTimeSyncService.getActiveSessions(targetEntityId, targetEntityType);
      setActiveSessions(sessions);
    } catch (err) {
      console.error('Failed to join session:', err);
    }
  }, [userId, userName]);

  const leaveSession = useCallback(async (): Promise<void> => {
    if (!currentSession) return;
    
    try {
      await realTimeSyncService.leaveSession(currentSession.sessionId);
      setCurrentSession(null);
      setIsConnected(false);
      setActiveSessions([]);
    } catch (err) {
      console.error('Failed to leave session:', err);
    }
  }, [currentSession]);

  const subscribe = useCallback((callback: (event: RealTimeEvent) => void): (() => void) => {
    if (!entityId || !entityType) {
      return () => {};
    }
    
    const roomId = `${entityType}:${entityId}`;
    return realTimeSyncService.subscribe(roomId, callback);
  }, [entityId, entityType]);

  const updateCursor = useCallback(async (cursor: { x: number; y: number; elementId?: string }): Promise<void> => {
    if (!currentSession) return;
    
    try {
      await realTimeSyncService.updateCursor(currentSession.sessionId, cursor);
    } catch (err) {
      console.error('Failed to update cursor:', err);
    }
  }, [currentSession]);

  // Auto-join session when component mounts
  useEffect(() => {
    if (entityId && entityType && userId && userName && !currentSession) {
      joinSession(entityId, entityType);
    }
    
    return () => {
      if (currentSession) {
        leaveSession();
      }
    };
  }, [entityId, entityType, userId, userName]); // Note: intentionally not including joinSession/leaveSession to avoid loops

  // Update active sessions periodically
  useEffect(() => {
    if (!entityId || !isConnected) return;
    
    const interval = setInterval(() => {
      const sessions = realTimeSyncService.getActiveSessions(entityId, entityType);
      setActiveSessions(sessions);
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [entityId, entityType, isConnected]);

  return {
    isConnected,
    activeSessions,
    joinSession,
    leaveSession,
    subscribe,
    updateCursor,
  };
}
