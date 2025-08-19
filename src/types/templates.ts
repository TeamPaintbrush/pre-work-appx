// Enhanced Template System Types
export interface TemplateVersion {
  id: string;
  templateId: string;
  version: string;
  versionName?: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  isPublished: boolean;
  changelog?: VersionChange[];
  parentVersionId?: string;
  template: ChecklistTemplate;
}

export interface VersionChange {
  id: string;
  type: 'added' | 'modified' | 'removed' | 'moved';
  target: 'template' | 'section' | 'item' | 'metadata';
  targetId?: string;
  description: string;
  details?: any;
  timestamp: Date;
  userId: string;
}

export interface TemplateBuilder {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  sections: BuilderSection[];
  metadata: TemplateMetadata;
  settings: BuilerSettings;
  isDraft: boolean;
  lastSaved: Date;
}

export interface BuilderSection {
  id: string;
  title: string;
  description: string;
  isOptional: boolean;
  order: number;
  items: BuilderItem[];
  isCollapsed?: boolean;
  validationRules?: ValidationRule[];
}

export interface BuilderItem {
  id: string;
  title: string;
  description?: string;
  isRequired: boolean;
  order: number;
  type: ItemType;
  properties: ItemProperties;
  validationRules?: ValidationRule[];
  previewData?: any;
}

export type ItemType = 
  | 'text' 
  | 'checkbox' 
  | 'photo' 
  | 'notes' 
  | 'measurement' 
  | 'signature' 
  | 'timer' 
  | 'location' 
  | 'conditional' 
  | 'custom';

export interface ItemProperties {
  requiresPhoto?: boolean;
  requiresNotes?: boolean;
  estimatedTime?: number;
  instructions?: string;
  warningMessage?: string;
  dependencies?: string[];
  tags?: string[];
  customFields?: CustomField[];
  conditionalLogic?: ConditionalLogic;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  isRequired: boolean;
  options?: string[];
  validation?: FieldValidation;
}

export interface ConditionalLogic {
  conditions: LogicCondition[];
  action: 'show' | 'hide' | 'require' | 'disable';
  operator: 'and' | 'or';
}

export interface LogicCondition {
  itemId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface ValidationRule {
  id: string;
  type: 'required' | 'min_length' | 'max_length' | 'pattern' | 'custom';
  value?: any;
  message: string;
  isActive: boolean;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  customValidator?: string;
}

export interface TemplateMetadata {
  estimatedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  requiredSkills: string[];
  tags: string[];
  industry: string[];
  compliance: ComplianceRequirement[];
  resources: TemplateResource[];
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  standard: string; // ISO, OSHA, etc.
  documentationRequired: boolean;
}

export interface TemplateResource {
  id: string;
  name: string;
  type: 'document' | 'video' | 'image' | 'link' | 'manual';
  url?: string;
  description?: string;
  isRequired: boolean;
}

export interface BuilerSettings {
  allowCustomItems: boolean;
  allowSkipping: boolean;
  requireSignature: boolean;
  requirePhotos: boolean;
  enableTimeTracking: boolean;
  enableGeolocation: boolean;
  autoSave: boolean;
  maxDuration?: number;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  onCompletion: boolean;
  onOverdue: boolean;
  onError: boolean;
  emailRecipients: string[];
  slackWebhook?: string;
}

export interface TemplateShare {
  id: string;
  templateId: string;
  sharedBy: string;
  sharedWith: ShareTarget[];
  permissions: SharePermissions;
  createdAt: Date;
  expiresAt?: Date;
  accessCount: number;
  isActive: boolean;
  shareLink?: string;
}

export interface ShareTarget {
  type: 'user' | 'team' | 'organization' | 'public';
  id: string;
  name: string;
  email?: string;
}

export interface SharePermissions {
  canView: boolean;
  canUse: boolean;
  canEdit: boolean;
  canShare: boolean;
  canVersion: boolean;
  restrictedAccess?: AccessRestriction[];
}

export interface AccessRestriction {
  type: 'time' | 'location' | 'device' | 'ip';
  value: string;
  description: string;
}

export interface TemplateUsageAnalytics {
  templateId: string;
  totalUsage: number;
  lastUsed: Date;
  avgCompletionTime: number;
  completionRate: number;
  userFeedback: UserFeedback[];
  performanceMetrics: PerformanceMetrics;
  popularItems: ItemUsageStats[];
}

export interface UserFeedback {
  id: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  improvements?: string[];
  timestamp: Date;
}

export interface PerformanceMetrics {
  avgItemTime: number;
  bottleneckItems: string[];
  skipRate: number;
  errorRate: number;
  qualityScore: number;
}

export interface ItemUsageStats {
  itemId: string;
  title: string;
  usageCount: number;
  avgTime: number;
  skipRate: number;
  errorRate: number;
}

export interface IndustryTemplate {
  id: string;
  industryId: string;
  industryName: string;
  templates: ChecklistTemplate[];
  isExpanded?: boolean;
  subcategories?: IndustrySubcategory[];
  description: string;
  icon: string;
  color: string;
  totalTemplates: number;
  popularTemplates: string[];
}

export interface IndustrySubcategory {
  id: string;
  name: string;
  description: string;
  templateCount: number;
  templates: ChecklistTemplate[];
}

// AWS Storage Types
export interface StoredTemplate extends Omit<ChecklistTemplate, 'createdAt' | 'lastModified'> {
  createdAt: string;
  lastModified: string;
  updatedAt?: string;
  userId: string;
  isPublic?: boolean;
}

export interface TemplateSearchOptions {
  workspaceId?: string;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  author?: string;
  organization?: string;
  limit?: number;
  sortBy?: 'title' | 'createdAt' | 'lastModified' | 'category';
  sortOrder?: 'asc' | 'desc';
}

// Import base types
import { ChecklistTemplate, TemplateCategory } from './index';
