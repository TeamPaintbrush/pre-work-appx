# AWS Integration Testing & Usage Guide

## 🧪 Testing Your AWS Integration

### 1. Environment Setup

First, ensure your AWS credentials and configuration are properly set:

```env
# .env.local
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# DynamoDB Tables
DYNAMODB_USERS_TABLE=pre-work-users
DYNAMODB_PROFILES_TABLE=pre-work-profiles
DYNAMODB_SUBMISSIONS_TABLE=pre-work-submissions
DYNAMODB_MEDIA_TABLE=pre-work-media
DYNAMODB_AUDIT_LOG_TABLE=pre-work-audit-log
DYNAMODB_TEAMS_TABLE=pre-work-teams
DYNAMODB_ASSIGNMENTS_TABLE=pre-work-assignments
DYNAMODB_SESSIONS_TABLE=pre-work-sessions

# S3 Buckets
S3_MEDIA_BUCKET=pre-work-media-uploads
S3_THUMBNAILS_BUCKET=pre-work-thumbnails
S3_DOCUMENTS_BUCKET=pre-work-documents
```

### 2. API Testing Examples

#### Test User Management

```javascript
// Create a new user
const createUser = async () => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'john.doe@company.com',
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      password: 'securePassword123',
      role: 'manager',
      organizationId: 'org-123'
    })
  });
  
  const result = await response.json();
  console.log('Created user:', result);
  return result.user;
};

// Get user by email
const getUserByEmail = async (email) => {
  const response = await fetch(`/api/users?email=${email}`);
  const result = await response.json();
  console.log('User found:', result);
  return result.user;
};
```

#### Test Team Collaboration

```javascript
// Create a team
const createTeam = async () => {
  const response = await fetch('/api/teams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Quality Assurance Team',
      description: 'Handles all QA processes',
      organizationId: 'org-123',
      managerId: 'user-456',
      settings: {
        visibility: 'organization',
        allowMemberInvites: true,
        requireApprovalForJoin: false,
        defaultPermissions: ['checklist.assign_team'],
        notificationSettings: {
          newAssignments: true,
          completions: true,
          overdue: true,
          teamUpdates: true
        }
      }
    })
  });
  
  const result = await response.json();
  console.log('Created team:', result);
  return result.team;
};

// Get organization teams
const getOrgTeams = async (organizationId) => {
  const response = await fetch(`/api/teams?organizationId=${organizationId}`);
  const result = await response.json();
  console.log('Organization teams:', result);
  return result.teams;
};
```

#### Test Real-time Collaboration

```javascript
// Join a collaboration session
const joinSession = async (userId, userName, entityId, entityType) => {
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'join_session',
      userId,
      userName,
      entityId,
      entityType
    })
  });
  
  const result = await response.json();
  console.log('Joined session:', result);
  return result.session;
};

// Apply a real-time operation
const applyOperation = async (operation) => {
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'apply_operation',
      operation: {
        userId: 'user-123',
        type: 'update',
        path: 'checklist.items.item1.checked',
        oldValue: false,
        newValue: true,
        entityId: 'checklist-456',
        entityType: 'checklist'
      }
    })
  });
  
  const result = await response.json();
  console.log('Operation applied:', result);
  return result;
};
```

### 3. Frontend Integration Examples

#### React Component for Team Management

```typescript
// components/Enterprise/TeamManager.tsx
import React, { useState, useEffect } from 'react';

interface Team {
  teamId: string;
  name: string;
  description?: string;
  memberCount: number;
  isActive: boolean;
}

export function TeamManager({ organizationId }: { organizationId: string }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadTeams();
  }, [organizationId]);

  const loadTeams = async () => {
    try {
      const response = await fetch(`/api/teams?organizationId=${organizationId}`);
      const result = await response.json();
      setTeams(result.teams || []);
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (teamData: any) => {
    setCreating(true);
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      });
      
      if (response.ok) {
        await loadTeams(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to create team:', error);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div>Loading teams...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Teams</h2>
        <button
          onClick={() => {/* Open create team modal */}}
          disabled={creating}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {creating ? 'Creating...' : 'Create Team'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => (
          <div key={team.teamId} className="border rounded-lg p-4 bg-white shadow">
            <h3 className="font-semibold text-lg">{team.name}</h3>
            {team.description && (
              <p className="text-gray-600 text-sm mt-1">{team.description}</p>
            )}
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {team.memberCount} members
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
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

      {teams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No teams found. Create your first team!</p>
        </div>
      )}
    </div>
  );
}
```

#### Real-time Collaboration Hook

```typescript
// hooks/useRealTimeCollaboration.ts
import { useState, useEffect, useCallback } from 'react';

interface CollaborationSession {
  sessionId: string;
  userId: string;
  userName: string;
  entityId: string;
  entityType: string;
  joinedAt: string;
  isActive: boolean;
}

export function useRealTimeCollaboration(
  entityId: string,
  entityType: string,
  currentUser: { userId: string; name: string }
) {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [connected, setConnected] = useState(false);

  const joinSession = useCallback(async () => {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join_session',
          userId: currentUser.userId,
          userName: currentUser.name,
          entityId,
          entityType
        })
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentSession(result.session);
        setConnected(true);
        loadActiveSessions();
      }
    } catch (error) {
      console.error('Failed to join session:', error);
    }
  }, [currentUser, entityId, entityType]);

  const leaveSession = useCallback(async () => {
    if (!currentSession) return;

    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leave_session',
          sessionId: currentSession.sessionId,
          userId: currentUser.userId
        })
      });

      setCurrentSession(null);
      setConnected(false);
      loadActiveSessions();
    } catch (error) {
      console.error('Failed to leave session:', error);
    }
  }, [currentSession, currentUser.userId]);

  const loadActiveSessions = useCallback(async () => {
    try {
      const response = await fetch(`/api/sync?entityId=${entityId}&entityType=${entityType}`);
      if (response.ok) {
        const result = await response.json();
        setSessions(result.sessions || []);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, [entityId, entityType]);

  const applyOperation = useCallback(async (operation: any) => {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply_operation',
          operation
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to apply operation:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    loadActiveSessions();
    
    // Auto-join session on mount
    if (currentUser.userId && !connected) {
      joinSession();
    }

    // Cleanup on unmount
    return () => {
      if (connected) {
        leaveSession();
      }
    };
  }, [entityId, entityType, currentUser.userId]);

  return {
    sessions,
    currentSession,
    connected,
    joinSession,
    leaveSession,
    applyOperation,
    collaborators: sessions.filter(s => s.userId !== currentUser.userId)
  };
}
```

### 4. Performance Monitoring

#### CloudWatch Metrics Dashboard

```typescript
// utils/monitoring.ts
export const logPerformanceMetric = async (
  operation: string,
  duration: number,
  success: boolean,
  metadata?: Record<string, any>
) => {
  // Log to CloudWatch or your monitoring service
  const metric = {
    timestamp: new Date().toISOString(),
    operation,
    duration,
    success,
    metadata
  };

  // In production, send to CloudWatch
  if (process.env.NODE_ENV === 'production') {
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      });
    } catch (error) {
      console.error('Failed to log metric:', error);
    }
  } else {
    console.log('Performance Metric:', metric);
  }
};

// Usage in components
export const withPerformanceLogging = <T extends any[]>(
  fn: (...args: T) => Promise<any>,
  operationName: string
) => {
  return async (...args: T) => {
    const startTime = Date.now();
    let success = true;
    
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      await logPerformanceMetric(operationName, duration, success);
    }
  };
};
```

### 5. Error Handling Best Practices

```typescript
// utils/apiClient.ts
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error - ${endpoint}:`, error);
      throw error;
    }
  }

  // Specific methods for each API endpoint
  async createUser(userData: any) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async createTeam(teamData: any) {
    return this.request('/api/teams', {
      method: 'POST',
      body: JSON.stringify(teamData)
    });
  }

  async joinCollaborationSession(sessionData: any) {
    return this.request('/api/sync', {
      method: 'POST',
      body: JSON.stringify({
        action: 'join_session',
        ...sessionData
      })
    });
  }
}

export const apiClient = new ApiClient();
```

## 🚀 Next Steps

1. **Set up AWS Infrastructure**: Create your DynamoDB tables and S3 buckets using the AWS Console or Infrastructure as Code
2. **Configure Environment Variables**: Add all required AWS credentials and table names to your `.env.local`
3. **Test API Endpoints**: Use the examples above to test each feature
4. **Implement Frontend Components**: Use the React examples to build your UI
5. **Monitor Performance**: Set up CloudWatch monitoring for production use
6. **Scale as Needed**: AWS will automatically handle scaling, but monitor usage and costs

Your enterprise backend is now ready for production with:
- ✅ Secure AWS data storage
- ✅ Real-time collaboration
- ✅ Team management
- ✅ Audit logging
- ✅ Performance monitoring
- ✅ Error handling

The data flows seamlessly from your frontend through Next.js API routes to AWS services, providing enterprise-grade reliability and scalability!
