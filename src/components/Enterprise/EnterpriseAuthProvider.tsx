import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, useTeamCollaboration, useRealTimeSync } from '../../hooks/useEnterpriseAuth';
import type { AuthUser } from '../../lib/auth/authService';
import type { Team, ChecklistAssignment } from '../../lib/collaboration/teamService';
import type { CollaborationSession, RealTimeEvent } from '../../lib/realtime/syncService';

interface EnterpriseAuthContextType {
  // Authentication
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string; organizationCode?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  
  // Team Collaboration
  teams: Team[];
  assignments: ChecklistAssignment[];
  createTeam: (teamData: any) => Promise<Team | null>;
  assignChecklist: (assignment: any) => Promise<ChecklistAssignment | null>;
  updateAssignmentStatus: (assignmentId: string, status: string, notes?: string) => Promise<void>;
  
  // Real-time Sync
  isConnected: boolean;
  activeSessions: CollaborationSession[];
  joinSession: (entityId: string, entityType: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  subscribe: (callback: (event: RealTimeEvent) => void) => () => void;
  updateCursor: (cursor: { x: number; y: number; elementId?: string }) => Promise<void>;
}

const EnterpriseAuthContext = createContext<EnterpriseAuthContextType | null>(null);

export interface EnterpriseAuthProviderProps {
  children: ReactNode;
  enableRealTimeSync?: boolean;
  autoJoinSession?: {
    entityId: string;
    entityType: string;
  };
}

export function EnterpriseAuthProvider({ 
  children, 
  enableRealTimeSync = false,
  autoJoinSession 
}: EnterpriseAuthProviderProps) {
  const auth = useAuth();
  const teamCollaboration = useTeamCollaboration(auth.user?.userId);
  
  const realTimeSync = useRealTimeSync(
    enableRealTimeSync ? autoJoinSession?.entityId : undefined,
    enableRealTimeSync ? autoJoinSession?.entityType : undefined,
    auth.user?.username || auth.user?.email,
    auth.user?.userId
  );

  const contextValue: EnterpriseAuthContextType = {
    // Authentication
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading || teamCollaboration.isLoading,
    error: auth.error || teamCollaboration.error,
    login: auth.login,
    logout: auth.logout,
    hasPermission: auth.hasPermission,
    hasAnyPermission: auth.hasAnyPermission,
    
    // Team Collaboration
    teams: teamCollaboration.teams,
    assignments: teamCollaboration.assignments,
    createTeam: teamCollaboration.createTeam,
    assignChecklist: teamCollaboration.assignChecklist,
    updateAssignmentStatus: teamCollaboration.updateAssignmentStatus,
    
    // Real-time Sync
    isConnected: enableRealTimeSync ? realTimeSync.isConnected : false,
    activeSessions: enableRealTimeSync ? realTimeSync.activeSessions : [],
    joinSession: enableRealTimeSync ? realTimeSync.joinSession : async () => {},
    leaveSession: enableRealTimeSync ? realTimeSync.leaveSession : async () => {},
    subscribe: enableRealTimeSync ? realTimeSync.subscribe : () => () => {},
    updateCursor: enableRealTimeSync ? realTimeSync.updateCursor : async () => {},
  };

  return (
    <EnterpriseAuthContext.Provider value={contextValue}>
      {children}
    </EnterpriseAuthContext.Provider>
  );
}

export function useEnterpriseAuth(): EnterpriseAuthContextType {
  const context = useContext(EnterpriseAuthContext);
  if (!context) {
    throw new Error('useEnterpriseAuth must be used within an EnterpriseAuthProvider');
  }
  return context;
}

// Login form component
export interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  showOrganizationCode?: boolean;
}

export function LoginForm({ 
  onSuccess, 
  onError, 
  className = '',
  showOrganizationCode = false 
}: LoginFormProps) {
  const { login, isLoading, error } = useEnterpriseAuth();
  const [credentials, setCredentials] = React.useState({
    email: '',
    password: '',
    organizationCode: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login({
      email: credentials.email,
      password: credentials.password,
      ...(showOrganizationCode && credentials.organizationCode && {
        organizationCode: credentials.organizationCode
      })
    });

    if (success) {
      onSuccess?.();
    } else {
      onError?.(error || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          required
          value={credentials.email}
          onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          id="password"
          required
          value={credentials.password}
          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        />
      </div>

      {showOrganizationCode && (
        <div>
          <label htmlFor="organizationCode" className="block text-sm font-medium text-gray-700">
            Organization Code (Optional)
          </label>
          <input
            type="text"
            id="organizationCode"
            value={credentials.organizationCode}
            onChange={(e) => setCredentials(prev => ({ ...prev, organizationCode: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}

// Team collaboration components
export interface TeamListProps {
  className?: string;
  onTeamSelect?: (team: Team) => void;
}

export function TeamList({ className = '', onTeamSelect }: TeamListProps) {
  const { teams, isLoading } = useEnterpriseAuth();

  if (isLoading) {
    return <div className={`animate-pulse ${className}`}>Loading teams...</div>;
  }

  if (teams.length === 0) {
    return (
      <div className={`text-gray-500 text-center py-8 ${className}`}>
        No teams found. Create your first team to get started.
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {teams.map((team) => (
        <div
          key={team.teamId}
          onClick={() => onTeamSelect?.(team)}
          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <h3 className="font-medium text-gray-900">{team.name}</h3>
          {team.description && (
            <p className="text-sm text-gray-600 mt-1">{team.description}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {team.members.length} member{team.members.length !== 1 ? 's' : ''}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              team.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {team.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Assignment list component
export interface AssignmentListProps {
  status?: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  className?: string;
  onAssignmentUpdate?: (assignmentId: string, status: string) => void;
}

export function AssignmentList({ 
  status, 
  className = '',
  onAssignmentUpdate 
}: AssignmentListProps) {
  const { assignments, updateAssignmentStatus, user } = useEnterpriseAuth();

  const filteredAssignments = status 
    ? assignments.filter(assignment => assignment.status === status)
    : assignments;

  const handleStatusUpdate = async (assignmentId: string, newStatus: string) => {
    await updateAssignmentStatus(assignmentId, newStatus);
    onAssignmentUpdate?.(assignmentId, newStatus);
  };

  if (filteredAssignments.length === 0) {
    return (
      <div className={`text-gray-500 text-center py-8 ${className}`}>
        No assignments found.
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {filteredAssignments.map((assignment) => (
        <div
          key={assignment.assignmentId}
          className="p-4 border border-gray-200 rounded-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">
                Checklist ID: {assignment.checklistId}
              </h4>
              {assignment.notes && (
                <p className="text-sm text-gray-600 mt-1">{assignment.notes}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>Priority: {assignment.priority}</span>
                {assignment.dueDate && (
                  <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                assignment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {assignment.status.replace('_', ' ')}
              </span>
              
              {user && assignment.assignedTo.includes(user.userId) && (
                <select
                  value={assignment.status}
                  onChange={(e) => handleStatusUpdate(assignment.assignmentId, e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Real-time collaboration indicator
export interface CollaborationIndicatorProps {
  className?: string;
  showUserList?: boolean;
}

export function CollaborationIndicator({ 
  className = '', 
  showUserList = true 
}: CollaborationIndicatorProps) {
  const { isConnected, activeSessions } = useEnterpriseAuth();

  if (!isConnected) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs text-gray-600">Live</span>
      </div>
      
      {showUserList && activeSessions.length > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">
            {activeSessions.length} online
          </span>
          <div className="flex -space-x-1">
            {activeSessions.slice(0, 3).map((session) => (
              <div
                key={session.sessionId}
                className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-xs text-white"
                title={session.userName}
              >
                {session.userName.charAt(0).toUpperCase()}
              </div>
            ))}
            {activeSessions.length > 3 && (
              <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-white flex items-center justify-center text-xs text-white">
                +{activeSessions.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
