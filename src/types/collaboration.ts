// Advanced Collaboration Types
// Team sharing, assignments, comments, file attachments, real-time collaboration

import { ViewType, NotificationType } from './enterprise';

export interface TeamMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: TeamRole;
  permissions: TeamPermission[];
  joinedAt: Date;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  invitedBy: string;
  lastActivity: Date;
  preferences: TeamMemberPreferences;
}

export type TeamRole = 
  | 'owner' 
  | 'admin' 
  | 'manager' 
  | 'member' 
  | 'viewer' 
  | 'guest';

export interface TeamPermission {
  resource: 'projects' | 'tasks' | 'templates' | 'settings' | 'users' | 'billing';
  actions: PermissionAction[];
  scope: 'all' | 'own' | 'team' | 'assigned';
}

export type PermissionAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'assign' 
  | 'share' 
  | 'export' 
  | 'admin';

export interface TeamMemberPreferences {
  notifications: TeamNotificationPreferences;
  timezone: string;
  language: string;
  defaultView: ViewType;
  workingHours: WorkingHours;
}

export interface WorkingHours {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

export interface TeamNotificationPreferences {
  email: boolean;
  inApp: boolean;
  desktop: boolean;
  mobile: boolean;
  digest: 'none' | 'daily' | 'weekly';
  types: NotificationType[];
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string;   // HH:MM
  };
}

// Comments and Communication
export interface Comment {
  id: string;
  entityType: 'project' | 'task' | 'checklist' | 'template';
  entityId: string;
  workspaceId: string;
  authorId: string;
  content: string;
  mentions: string[]; // User IDs mentioned in the comment
  attachments: CommentAttachment[];
  parentCommentId?: string; // For threaded discussions
  reactions: CommentReaction[];
  isEdited: boolean;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata: CommentMetadata;
}

export interface CommentAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  s3Key: string;
  thumbnailKey?: string;
  uploadedAt: Date;
}

export interface CommentReaction {
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface CommentMetadata {
  editHistory?: CommentEdit[];
  importantFlag?: boolean;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface CommentEdit {
  editedAt: Date;
  editedBy: string;
  previousContent: string;
}

// File Management
export interface FileAttachment {
  id: string;
  workspaceId: string;
  entityType: 'project' | 'task' | 'checklist' | 'comment' | 'workspace';
  entityId: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  s3Key: string;
  s3Bucket: string;
  thumbnailKey?: string;
  previewKey?: string;
  uploadedBy: string;
  uploadedAt: Date;
  isPublic: boolean;
  accessPermissions: FilePermission[];
  downloadCount: number;
  lastAccessed: Date;
  tags: string[];
  description?: string;
  version: number;
  parentFileId?: string; // For file versions
  metadata: FileMetadata;
}

export interface FilePermission {
  userId: string;
  permission: 'view' | 'download' | 'edit' | 'delete';
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number; // For video/audio files
  pages?: number;    // For documents
  checksum: string;
  virusScanStatus: 'pending' | 'clean' | 'infected' | 'error';
  virusScanDate?: Date;
}

// Real-time Collaboration
export interface CollaborationSession {
  id: string;
  workspaceId: string;
  entityType: 'project' | 'task' | 'checklist';
  entityId: string;
  participants: SessionParticipant[];
  startedAt: Date;
  lastActivity: Date;
  isActive: boolean;
  sessionType: 'edit' | 'view' | 'meeting' | 'brainstorm';
}

export interface SessionParticipant {
  userId: string;
  joinedAt: Date;
  lastSeen: Date;
  status: 'active' | 'idle' | 'away';
  cursor?: CursorPosition;
  selection?: SelectionRange;
  role: 'host' | 'participant' | 'observer';
}

export interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
  timestamp: Date;
}

export interface SelectionRange {
  startElementId: string;
  endElementId: string;
  startOffset: number;
  endOffset: number;
  timestamp: Date;
}

export interface LiveUpdate {
  id: string;
  sessionId: string;
  userId: string;
  operation: LiveOperation;
  timestamp: Date;
  acknowledged: boolean;
}

export interface LiveOperation {
  type: 'insert' | 'delete' | 'update' | 'move' | 'format';
  target: {
    entityType: string;
    entityId: string;
    fieldPath: string;
  };
  data: any;
  previousData?: any;
  metadata: {
    cursor?: CursorPosition;
    selection?: SelectionRange;
  };
}

// Activity Feed and Notifications
export interface ActivityFeedItem {
  id: string;
  workspaceId: string;
  actorId: string; // User who performed the action
  action: ActivityAction;
  entityType: 'project' | 'task' | 'checklist' | 'comment' | 'file' | 'user';
  entityId: string;
  entityName: string;
  details: ActivityDetails;
  timestamp: Date;
  visibility: 'public' | 'team' | 'private';
  relatedUsers: string[]; // Users who should see this activity
  isRead: ActivityReadStatus[];
  metadata: ActivityMetadata;
}

export type ActivityAction = 
  | 'created' 
  | 'updated' 
  | 'deleted' 
  | 'assigned' 
  | 'unassigned' 
  | 'completed' 
  | 'reopened'
  | 'commented' 
  | 'mentioned' 
  | 'attached' 
  | 'shared' 
  | 'joined' 
  | 'left'
  | 'invited' 
  | 'promoted' 
  | 'demoted' 
  | 'blocked' 
  | 'unblocked';

export interface ActivityDetails {
  summary: string;
  description?: string;
  changes?: FieldChange[];
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  attachments?: string[]; // File IDs
  mentions?: string[];    // User IDs
}

export interface FieldChange {
  field: string;
  fieldName: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'removed' | 'modified';
}

export interface ActivityReadStatus {
  userId: string;
  readAt: Date;
}

export interface ActivityMetadata {
  source: 'web' | 'mobile' | 'api' | 'automation';
  ipAddress?: string;
  userAgent?: string;
  apiClient?: string;
  automationRule?: string;
}

// In-App Notifications
export interface InAppNotification {
  id: string;
  userId: string;
  workspaceId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  entityType?: string;
  entityId?: string;
  actorId?: string; // User who triggered the notification
  isRead: boolean;
  isArchived: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  metadata: NotificationMetadata;
}

export interface NotificationMetadata {
  source: string;
  batchId?: string; // For grouping related notifications
  digest?: boolean; // Part of a digest notification
  channel: 'system' | 'user' | 'automation' | 'integration';
  tags?: string[];
}

// Team Assignment and Workload
export interface TaskAssignment {
  id: string;
  taskId: string;
  workspaceId: string;
  assigneeId: string;
  assignerId: string;
  assignedAt: Date;
  dueDate?: Date;
  estimatedHours?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'overdue';
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  worklog: WorklogEntry[];
}

export interface WorklogEntry {
  id: string;
  userId: string;
  description: string;
  hoursLogged: number;
  date: Date;
  billable: boolean;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  metadata: WorklogMetadata;
}

export interface WorklogMetadata {
  source: 'manual' | 'timer' | 'integration';
  location?: string;
  tags?: string[];
  attachments?: string[];
}

// Team Workload and Capacity
export interface TeamCapacity {
  userId: string;
  workspaceId: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  totalCapacity: number; // hours
  allocatedHours: number;
  availableHours: number;
  overallocation: number;
  assignments: CapacityAssignment[];
  timeOff: TimeOffPeriod[];
  lastUpdated: Date;
}

export interface CapacityAssignment {
  taskId: string;
  projectId: string;
  estimatedHours: number;
  actualHours: number;
  priority: number;
  deadline?: Date;
}

export interface TimeOffPeriod {
  id: string;
  type: 'vacation' | 'sick' | 'holiday' | 'personal' | 'training';
  startDate: Date;
  endDate: Date;
  isApproved: boolean;
  approvedBy?: string;
  note?: string;
}

// Sharing and Permissions
export interface ShareSettings {
  id: string;
  entityType: 'project' | 'task' | 'checklist' | 'template' | 'workspace';
  entityId: string;
  workspaceId: string;
  sharedBy: string;
  shareType: 'internal' | 'external' | 'public' | 'link';
  permissions: SharePermission[];
  linkSharing?: LinkSharingSettings;
  externalSharing?: ExternalSharingSettings;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  lastAccessed?: Date;
}

export interface SharePermission {
  userId?: string;
  email?: string;
  role: 'viewer' | 'commenter' | 'editor' | 'admin';
  permissions: string[];
  grantedAt: Date;
  grantedBy: string;
  lastAccessed?: Date;
}

export interface LinkSharingSettings {
  enabled: boolean;
  token: string;
  requireAuth: boolean;
  allowComments: boolean;
  allowDownload: boolean;
  passwordProtected: boolean;
  password?: string;
  accessCount: number;
  maxAccess?: number;
}

export interface ExternalSharingSettings {
  allowedDomains: string[];
  requireApproval: boolean;
  defaultPermissions: string[];
  notifyOnAccess: boolean;
}

export {
  // Re-export existing enterprise types
  type Workspace,
  type CustomField,
  type Workflow,
  type BoardConfiguration,
  type EnterpriseProject,
  type EnterpriseTask,
  type Dashboard,
  type SyncOperation,
  type ViewType,
  type EntityType,
} from './enterprise';
