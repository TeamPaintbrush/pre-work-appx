// User role definitions and permissions

import { UserRole } from '../../types/user';

export const USER_ROLES: Record<UserRole, { 
  name: string; 
  description: string; 
  permissions: string[];
  hierarchy: number;
}> = {
  user: {
    name: 'Standard User',
    description: 'Creates checklists, completes tasks, submits media',
    permissions: [
      'checklist:create',
      'checklist:read',
      'checklist:update',
      'task:complete',
      'media:upload',
      'submission:create',
      'profile:read',
      'profile:update'
    ],
    hierarchy: 1
  },
  manager: {
    name: 'Manager',
    description: 'Reviews submissions, approves work, manages team members',
    permissions: [
      'checklist:create',
      'checklist:read',
      'checklist:update',
      'checklist:assign',
      'task:complete',
      'task:review',
      'media:upload',
      'media:review',
      'submission:create',
      'submission:review',
      'submission:approve',
      'team:read',
      'team:manage',
      'profile:read',
      'profile:update',
      'reports:view'
    ],
    hierarchy: 2
  },
  supervisor: {
    name: 'Supervisor',
    description: 'Regional oversight, multiple team management',
    permissions: [
      'checklist:create',
      'checklist:read',
      'checklist:update',
      'checklist:assign',
      'checklist:delete',
      'task:complete',
      'task:review',
      'media:upload',
      'media:review',
      'submission:create',
      'submission:review',
      'submission:approve',
      'team:read',
      'team:manage',
      'organization:read',
      'profile:read',
      'profile:update',
      'reports:view',
      'reports:create'
    ],
    hierarchy: 3
  },
  administrator: {
    name: 'Administrator',
    description: 'Full system access, user management, system settings',
    permissions: [
      'checklist:*',
      'task:*',
      'media:*',
      'submission:*',
      'user:*',
      'team:*',
      'organization:*',
      'profile:*',
      'reports:*',
      'system:*',
      'audit:*'
    ],
    hierarchy: 4
  },
  auditor: {
    name: 'Client/Auditor',
    description: 'Read-only access for compliance verification',
    permissions: [
      'checklist:read',
      'task:read',
      'submission:read',
      'media:view',
      'reports:view',
      'audit:read'
    ],
    hierarchy: 0
  }
};

export const MEDIA_PERMISSIONS = {
  UPLOAD_MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain'],
  MAX_FILES_PER_SUBMISSION: 10
};

export const WORKFLOW_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REQUIRES_CHANGES: 'requires_changes'
} as const;

export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  SUBMISSION_RECEIVED: 'submission_received',
  APPROVAL_REQUIRED: 'approval_required',
  SUBMISSION_APPROVED: 'submission_approved',
  SUBMISSION_REJECTED: 'submission_rejected',
  CHANGES_REQUESTED: 'changes_requested'
} as const;
