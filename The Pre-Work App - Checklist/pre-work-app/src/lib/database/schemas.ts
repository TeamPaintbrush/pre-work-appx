import { z } from 'zod';

// User Schema for DynamoDB
export const UserSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(50),
  role: z.enum(['user', 'manager', 'supervisor', 'administrator', 'auditor']),
  isActive: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastLoginAt: z.string().optional(),
  authProvider: z.enum(['cognito', 'apple', 'google']).optional(),
  cognitoId: z.string().optional(),
});

// Profile Schema
export const ProfileSchema = z.object({
  profileId: z.string().uuid(),
  userId: z.string().uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  jobTitle: z.string().max(200).optional(),
  department: z.string().max(100).optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().default('US'),
  }).optional(),
  preferences: z.object({
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      sms: z.boolean().default(false),
    }),
    language: z.string().default('en'),
    timezone: z.string().default('America/New_York'),
  }).default(() => ({
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    language: 'en',
    timezone: 'America/New_York',
  })),
  permissions: z.array(z.string()).default([]),
  managerId: z.string().uuid().optional(),
  teamMembers: z.array(z.string().uuid()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Media Schema for S3 metadata
export const MediaSchema = z.object({
  mediaId: z.string().uuid(),
  userId: z.string().uuid(),
  submissionId: z.string().uuid().optional(),
  fileName: z.string(),
  originalName: z.string(),
  fileType: z.enum(['image', 'video', 'audio', 'document']),
  mimeType: z.string(),
  fileSize: z.number(),
  s3Key: z.string(),
  s3Bucket: z.string(),
  thumbnailUrl: z.string().optional(),
  metadata: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    duration: z.number().optional(),
    location: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }).optional(),
    deviceInfo: z.string().optional(),
  }).optional(),
  uploadStatus: z.enum(['uploading', 'completed', 'failed']).default('uploading'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Submission Schema
export const SubmissionSchema = z.object({
  submissionId: z.string().uuid(),
  userId: z.string().uuid(),
  checklistId: z.string().uuid(),
  title: z.string().max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'requires_changes']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  mediaFiles: z.array(z.string().uuid()).default([]),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
  }).optional(),
  reviewerId: z.string().uuid().optional(),
  reviewNotes: z.string().max(1000).optional(),
  reviewedAt: z.string().optional(),
  dueDate: z.string().optional(),
  completedAt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.string(), z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Audit Log Schema
export const AuditLogSchema = z.object({
  logId: z.string().uuid(),
  userId: z.string().uuid(),
  action: z.string(),
  entityType: z.enum(['user', 'profile', 'submission', 'media', 'team', 'assignment']),
  entityId: z.string().uuid(),
  oldValues: z.record(z.string(), z.any()).optional(),
  newValues: z.record(z.string(), z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.string(),
});

export type User = z.infer<typeof UserSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type Submission = z.infer<typeof SubmissionSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
