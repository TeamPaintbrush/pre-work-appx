import React from 'react';
import { EnterpriseAuthProvider, useEnterpriseAuth, LoginForm, TeamList, AssignmentList, CollaborationIndicator } from './EnterpriseAuthProvider';
import type { Team } from '../../lib/collaboration/teamService';
import type { RealTimeEvent } from '../../lib/realtime/syncService';

// Example: Enhanced main page with enterprise features
export default function EnterpriseMainPage() {
  return (
    <EnterpriseAuthProvider 
      enableRealTimeSync={true}
      autoJoinSession={{
        entityId: 'main-workspace',
        entityType: 'workspace'
      }}
    >
      <MainContent />
    </EnterpriseAuthProvider>
  );
}

function MainContent() {
  const { 
    isAuthenticated, 
    user, 
    hasPermission,
    isConnected,
    activeSessions 
  } = useEnterpriseAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Enterprise Checklist</h1>
            <p className="text-gray-600 mt-2">Sign in to access your workspace</p>
          </div>
          <LoginForm 
            showOrganizationCode={true}
            className="bg-white p-6 rounded-lg shadow-md"
            onSuccess={() => console.log('Login successful')}
            onError={(error: string) => console.error('Login failed:', error)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Enterprise Checklist</h1>
              <CollaborationIndicator 
                className="ml-4"
                showUserList={true}
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.username || user?.email}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                user?.role === 'administrator' ? 'bg-purple-100 text-purple-800' :
                user?.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Teams Section */}
          {hasPermission('team.manage') && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Your Teams</h2>
                <TeamList 
                  onTeamSelect={(team: Team) => console.log('Selected team:', team)}
                />
              </div>
            </div>
          )}

          {/* Assignments Section */}
          <div className={hasPermission('team.manage') ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Your Assignments</h2>
                {isConnected && (
                  <div className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Live ({activeSessions.length} online)
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Active Assignments</h3>
                  <AssignmentList 
                    status="assigned"
                    onAssignmentUpdate={(id: string, status: string) => console.log('Assignment updated:', id, status)}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">In Progress</h3>
                  <AssignmentList 
                    status="in_progress"
                    onAssignmentUpdate={(id: string, status: string) => console.log('Assignment updated:', id, status)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {hasPermission('checklist.create') && (
            <QuickActionCard
              title="Create Checklist"
              description="Create a new checklist template"
              icon="📋"
              onClick={() => console.log('Create checklist')}
            />
          )}
          
          {hasPermission('team.manage') && (
            <QuickActionCard
              title="Manage Teams"
              description="Create and manage team settings"
              icon="👥"
              onClick={() => console.log('Manage teams')}
            />
          )}
          
          {hasPermission('analytics.view') && (
            <QuickActionCard
              title="View Analytics"
              description="Review team performance metrics"
              icon="📊"
              onClick={() => console.log('View analytics')}
            />
          )}
        </div>

        {/* Real-time Activity Feed */}
        {isConnected && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Live Activity</h2>
              <RealTimeActivityFeed />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Quick action card component
interface QuickActionCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

function QuickActionCard({ title, description, icon, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
    >
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}

// Real-time activity feed component
function RealTimeActivityFeed() {
  const { subscribe } = useEnterpriseAuth();
  const [activities, setActivities] = React.useState<any[]>([]);

  React.useEffect(() => {
    const unsubscribe = subscribe((event: RealTimeEvent) => {
      const activity = {
        id: event.eventId,
        type: event.eventType,
        user: event.userId,
        timestamp: event.timestamp,
        data: event.data,
      };
      
      setActivities(prev => [activity, ...prev.slice(0, 9)]); // Keep last 10 activities
    });

    return unsubscribe;
  }, [subscribe]);

  if (activities.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No recent activity. Start collaborating to see live updates!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">
              <span className="font-medium">{activity.user}</span>{' '}
              <span className="text-gray-600">
                {getActivityDescription(activity.type, activity.data)}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(activity.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function to format activity descriptions
function getActivityDescription(type: string, data: any): string {
  switch (type) {
    case 'checklist.item.checked':
      return 'checked an item';
    case 'checklist.item.unchecked':
      return 'unchecked an item';
    case 'team.member.joined':
      return `joined the workspace`;
    case 'team.member.left':
      return 'left the workspace';
    case 'assignment.created':
      return 'created a new assignment';
    case 'assignment.completed':
      return 'completed an assignment';
    default:
      return `performed action: ${type}`;
  }
}
