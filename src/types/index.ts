// Types for The Pre-Work App - Checklist
import { ReactNode, ButtonHTMLAttributes } from 'react';

// User Profile and Authentication Types
export * from './user';
export * from './auth';
export * from './media';

// Template and Category System
export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  version: string;
  tags: string[];
  isBuiltIn: boolean;
  createdBy?: string;
  createdAt: Date;
  lastModified: Date;
  sections: TemplateSectionDefinition[];
  estimatedDuration?: number; // in minutes
  difficulty?: 'easy' | 'medium' | 'hard';
  requiredSkills?: string[];
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  parentCategoryId?: string;
  isActive: boolean;
}

export interface TemplateSectionDefinition {
  id: string;
  title: string;
  description: string;
  isOptional: boolean;
  order: number;
  items: TemplateItemDefinition[];
  preConditions?: PreCondition[];
}

export interface TemplateItemDefinition {
  id: string;
  title: string;
  description?: string;
  isRequired: boolean;
  isOptional: boolean;
  order: number;
  estimatedTime?: number; // in minutes
  requiresPhoto: boolean;
  requiresNotes: boolean;
  preConditions?: PreCondition[];
  tags: string[];
  instructions?: string;
  warningMessage?: string;
  dependencies?: string[]; // IDs of other items that must be completed first
}

export interface PreCondition {
  id: string;
  type: 'item_completed' | 'section_completed' | 'time_elapsed' | 'custom';
  description: string;
  targetId?: string; // ID of item/section if applicable
  value?: any; // For time_elapsed or custom conditions
  errorMessage: string;
}

// Priority type for reuse
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface ChecklistItem {
  id: string;
  text: string;  // Changed from title to text for consistency
  description?: string;
  isRequired: boolean;
  isOptional?: boolean;
  isCompleted: boolean;
  priority?: Priority;  // Added priority field
  notes: string;
  attachments?: Attachment[];  // Changed from imageUrls to attachments
  timestamp?: Date;
  completedAt?: Date;
  estimatedTime?: number;
  actualTime?: number;
  requiresPhoto?: boolean;
  requiresNotes?: boolean;
  tags?: string[];
  instructions?: string;
  warningMessage?: string;
  dependencies?: string[];
  templateItemId?: string; // Reference to original template item
  validationErrors?: string[];
  skippedReason?: string;
  isSkipped?: boolean;
  isCustom?: boolean;  // Added to track custom items
  customFields?: Record<string, any>;  // Added for custom fields
  dueDate?: Date;  // Added due date
}

export interface ChecklistSection {
  id: string;
  title: string;
  description?: string;  // Made optional
  items: ChecklistItem[];
  isCollapsed?: boolean;  // Made optional with default false
  completedCount: number;
  totalCount: number;
  isOptional: boolean;
  order: number;
  preConditions?: PreCondition[];
  templateSectionId?: string; // Reference to original template section
  estimatedTime?: number;
  actualTime?: number;
}

export interface PreWorkChecklist {
  id: string;
  title: string;
  description: string;
  sections: ChecklistSection[];
  createdAt: Date;
  lastModified: Date;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  templateId?: string; // Reference to template used
  templateVersion?: string;
  category?: TemplateCategory;
  tags: string[];
  assignedTo?: string;
  assignedBy?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration?: number;
  actualDuration?: number;
  startedAt?: Date;
  location?: string;
  weatherConditions?: string;
  equipment?: string[];
  safetyNotes?: string;
}

export interface ChecklistProgress {
  totalItems: number;
  completedItems: number;
  requiredItems: number;
  completedRequiredItems: number;
  optionalItems: number;
  completedOptionalItems: number;
  skippedItems: number;
  percentage: number;
  requiredPercentage: number;
  optionalPercentage: number;
  estimatedTimeRemaining?: number;
  sectionsCompleted: number;
  totalSections: number;
  criticalItemsCompleted: number;
  totalCriticalItems: number;
}

export interface TemplateLibrary {
  categories: TemplateCategory[];
  templates: ChecklistTemplate[];
  userTemplates: ChecklistTemplate[];
  recentlyUsed: string[]; // Template IDs
  favorites: string[]; // Template IDs
  searchHistory: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermission[];
  preferences: UserPreferences;
  avatarUrl?: string;
  department?: string;
  location?: string;
  skills: string[];
  certifications: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  teamId?: string;
}

export type UserRole = 'admin' | 'manager' | 'supervisor' | 'field_worker' | 'viewer' | 'auditor' | 'client';

export interface Team {
  id: string;
  name: string;
  description: string;
  managerId: string;
  memberIds: string[];
  location?: string;
  skills: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface Assignment {
  id: string;
  checklistId: string;
  templateId: string;
  assignedTo: string;
  assignedBy: string;
  teamId?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'overdue';
  assignedAt: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  estimatedDuration: number;
  location?: string;
  requiredSkills: string[];
  specialInstructions?: string;
}

export interface ValidationRule {
  id: string;
  type: 'required_photo' | 'required_notes' | 'min_length' | 'max_length' | 'pattern' | 'custom';
  message: string;
  value?: any;
  isActive: boolean;
}

export interface UserPermission {
  id: string;
  name: string;
  description: string;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAssign: boolean;
  canExport: boolean;
  canManageTemplates: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  defaultView: 'list' | 'cards' | 'timeline';
  autoSave: boolean;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  mobileNotifications: boolean;
  accessibilityMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  uploadedBy: string;
  itemId?: string;
  sectionId?: string;
  checklistId: string;
  description?: string;
  tags: string[];
  metadata?: MediaMetadata;
  type: 'image' | 'video' | 'document' | 'audio';
  captureType?: 'before' | 'after' | 'during' | 'reference';
  isRequired?: boolean;
  capturedInApp?: boolean;
}

export interface MediaMetadata {
  timestamp: Date;
  location?: GeolocationData;
  deviceInfo?: DeviceInfo;
  cameraSettings?: CameraSettings;
  duration?: number; // for videos in seconds
  dimensions?: {
    width: number;
    height: number;
  };
  orientation?: 'portrait' | 'landscape';
  quality?: 'low' | 'medium' | 'high' | 'ultra';
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
  address?: string; // Reverse geocoded address
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  screenSize: {
    width: number;
    height: number;
  };
  deviceMemory?: number;
  connection?: string;
}

export interface CameraSettings {
  facingMode: 'user' | 'environment';
  resolution: string;
  zoom?: number;
  flash?: boolean;
  focus?: 'auto' | 'manual';
}

export interface MediaCaptureConfig {
  allowPhoto: boolean;
  allowVideo: boolean;
  maxPhotos?: number;
  maxVideos?: number;
  maxFileSize?: number; // in MB
  videoMaxDuration?: number; // in seconds
  requireLocation: boolean;
  requireTimestamp: boolean;
  photoQuality: 'low' | 'medium' | 'high' | 'ultra';
  videoQuality: 'low' | 'medium' | 'high' | 'ultra';
  captureTypes: ('before' | 'after' | 'during' | 'reference')[];
}

export interface ComplianceCheck {
  id: string;
  type: 'required_items' | 'photo_requirements' | 'time_limits' | 'approval_required' | 'custom';
  rule: string;
  description: string;
  severity: 'warning' | 'error' | 'critical';
  isBlocking: boolean; // Prevents completion if failed
  checkFunction?: (checklist: PreWorkChecklist, item?: ChecklistItem) => ComplianceResult;
}

export interface ComplianceResult {
  passed: boolean;
  message: string;
  suggestions?: string[];
  affectedItems?: string[]; // Item IDs
}

export interface ComplianceReport {
  checklistId: string;
  checkDate: Date;
  overallStatus: 'compliant' | 'warning' | 'non_compliant';
  checks: ComplianceCheckResult[];
  blockers: string[]; // Critical issues preventing completion
  warnings: string[]; // Non-critical issues
  recommendations: string[];
}

export interface ComplianceCheckResult {
  checkId: string;
  result: ComplianceResult;
  timestamp: Date;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'pdf' | 'email' | 'web_link' | 'json' | 'csv';
  sections: ReportSection[];
  branding?: BrandingConfig;
  permissions: ReportPermission[];
  isDefault: boolean;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'summary' | 'progress' | 'items' | 'photos' | 'compliance' | 'signatures' | 'custom';
  includeInReport: boolean;
  order: number;
  config?: Record<string, any>;
}

export interface BrandingConfig {
  logoUrl?: string;
  companyName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  headerText?: string;
  footerText?: string;
}

export interface ReportPermission {
  role: UserRole;
  canGenerate: boolean;
  canShare: boolean;
  canSchedule: boolean;
  allowedFormats: ('pdf' | 'email' | 'web_link' | 'json' | 'csv')[];
}

export interface SharedReport {
  id: string;
  checklistId: string;
  reportType: 'pdf' | 'web_link';
  shareUrl: string;
  accessToken: string;
  expiresAt?: Date;
  isPublic: boolean;
  requiredAuth: boolean;
  viewCount: number;
  lastViewed?: Date;
  sharedBy: string;
  sharedAt: Date;
  permissions: SharedReportPermission[];
}

export interface SharedReportPermission {
  action: 'view' | 'download' | 'comment';
  allowed: boolean;
}

export interface JobHistory {
  id: string;
  checklistId: string;
  templateId: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  assignedTo: string;
  assignedBy: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  dueDate?: Date;
  location?: string;
  estimatedDuration: number;
  actualDuration?: number;
  complianceStatus: 'compliant' | 'warning' | 'non_compliant';
  finalReport?: string; // Report ID
  attachmentCount: number;
  photoCount: number;
  videoCount: number;
  tags: string[];
}

export interface ExportData {
  checklist: PreWorkChecklist;
  attachments?: Attachment[];
  exportedAt: Date;
  version: string;
  exportedBy: string;
  format: 'json' | 'pdf' | 'csv' | 'excel';
  includeImages: boolean;
  includeNotes: boolean;
  includeTimestamps: boolean;
}

export interface ImportData {
  checklist: PreWorkChecklist;
  attachments?: Attachment[];
  importedAt: Date;
  version: string;
  importedBy: string;
  validationErrors?: string[];
  warnings?: string[];
}

export interface NotificationData {
  id: string;
  type: 'assignment' | 'due_date' | 'completion' | 'validation_error' | 'system';
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  checklistId?: string;
  userId: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export interface AuditLog {
  id: string;
  action: 'created' | 'updated' | 'deleted' | 'completed' | 'assigned' | 'exported' | 'imported';
  entityType: 'checklist' | 'template' | 'item' | 'section' | 'user';
  entityId: string;
  userId: string;
  timestamp: Date;
  changes?: Record<string, { from: any; to: any }>;
  metadata?: Record<string, any>;
}

export interface GitHubSyncData {
  lastSyncAt?: Date;
  syncEnabled: boolean;
  repositoryUrl?: string;
  branchName?: string;
  accessToken?: string;
  syncedChecklists: string[];
  conflictResolution: 'local' | 'remote' | 'manual';
}

// Component Props Types
export interface ChecklistContainerProps {
  initialChecklist?: PreWorkChecklist;
  template?: ChecklistTemplate;
  onSave?: (checklist: PreWorkChecklist) => void;
  onExport?: (data: ExportData) => void;
  onComplete?: (checklist: PreWorkChecklist) => void;
  readOnly?: boolean;
  showProgress?: boolean;
  enableAutoSave?: boolean;
}

export interface TemplateLibraryProps {
  templates: ChecklistTemplate[];
  categories: TemplateCategory[];
  onSelectTemplate: (template: ChecklistTemplate) => void;
  onCreateTemplate?: () => void;
  onEditTemplate?: (template: ChecklistTemplate) => void;
  userPermissions?: UserPermission[];
  searchQuery?: string;
  selectedCategory?: string;
}

export interface TemplateSelectorProps {
  templates: ChecklistTemplate[];
  categories: TemplateCategory[];
  onSelect: (template: ChecklistTemplate) => void;
  onCancel: () => void;
  recentlyUsed?: string[];
  favorites?: string[];
}

export interface ChecklistSectionProps {
  section: ChecklistSection;
  onToggleSection: (sectionId: string) => void;
  onUpdateItem: (sectionId: string, itemId: string, updates: Partial<ChecklistItem>) => void;
  onToggleComplete: (sectionId: string, itemId: string) => void;
  onAddItem?: (sectionId: string) => void;  // Added for custom item creation
  onAddAttachment?: (sectionId: string, itemId: string, file: File) => void;
  readOnly?: boolean;
  showProgress?: boolean;
}

export interface ChecklistItemProps {
  item: ChecklistItem;
  sectionId: string;
  onUpdate: (itemId: string, updates: Partial<ChecklistItem>) => void;
  onToggleComplete: (itemId: string) => void;
  onAddAttachment?: (itemId: string, file: File) => void;
  onRemoveAttachment?: (itemId: string, attachmentId: string) => void;
  attachments?: Attachment[];
  readOnly?: boolean;
  validationRules?: ValidationRule[];
}

export interface ProgressBarProps {
  progress: ChecklistProgress;
  className?: string;
  showDetails?: boolean;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  hideCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export interface AttachmentViewerProps {
  attachments: Attachment[];
  onRemove?: (attachmentId: string) => void;
  onDownload?: (attachment: Attachment) => void;
  readOnly?: boolean;
  maxDisplay?: number;
}

export interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  onRemove?: (url: string) => void;
  existingImages?: string[];
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string[];
  disabled?: boolean;
}

export interface NotificationCenterProps {
  notifications: NotificationData[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (notificationId: string) => void;
  maxDisplay?: number;
}

// Advanced Search and Filter Types
export interface SearchFilters {
  query?: string;
  categories?: string[];
  tags?: string[];
  priority?: ('low' | 'medium' | 'high' | 'critical')[];
  status?: ('pending' | 'in_progress' | 'completed' | 'overdue')[];
  assignedTo?: string[];
  createdBy?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasAttachments?: boolean;
  hasNotes?: boolean;
  difficulty?: ('easy' | 'medium' | 'hard')[];
  estimatedDuration?: {
    min: number;
    max: number;
  };
}

export interface SortOptions {
  field: 'title' | 'createdAt' | 'lastModified' | 'priority' | 'dueDate' | 'progress' | 'estimatedDuration';
  direction: 'asc' | 'desc';
}

// Legacy types for backward compatibility
export interface Checklist extends PreWorkChecklist {}
export interface Progress extends ChecklistProgress {}

export interface LocalStorageData {
  checklists: PreWorkChecklist[];
  templates: ChecklistTemplate[];
  categories: TemplateCategory[];
  currentChecklistId?: string;
  currentUserId?: string;
  githubSync?: GitHubSyncData;
  userPreferences?: UserPreferences;
  recentlyUsedTemplates: string[];
  favoriteTemplates: string[];
  notifications: NotificationData[];
  auditLog: AuditLog[];
}