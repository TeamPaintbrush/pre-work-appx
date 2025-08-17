// Media and submission types

export type MediaType = 'image' | 'video' | 'document' | 'audio';

export type SubmissionStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'requires_changes';

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  metadata: MediaMetadata;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number;
  location?: GeolocationCoordinates;
  deviceInfo?: string;
  checksum: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  checklistId: string;
  submittedBy: string;
  assignedTo?: string;
  status: SubmissionStatus;
  mediaFiles: MediaFile[];
  notes?: string;
  completedAt: Date;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  location?: GeolocationCoordinates;
}

export interface ApprovalWorkflow {
  id: string;
  submissionId: string;
  steps: ApprovalStep[];
  currentStep: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalStep {
  id: string;
  order: number;
  approverId: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  notes?: string;
  approvedAt?: Date;
  deadline?: Date;
}

export interface SubmissionReview {
  id: string;
  submissionId: string;
  reviewerId: string;
  status: SubmissionStatus;
  feedback: string;
  requiresChanges: boolean;
  suggestedActions: string[];
  reviewedAt: Date;
}

export interface MediaUploadProgress {
  fileId: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}
