// Task submission component with media upload

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TaskSubmission, MediaFile, SubmissionStatus } from '../../types/media';
import { MediaUpload } from '../Media/MediaUpload';
import { useAuth } from '../../hooks/useAuth';

interface TaskSubmissionFormProps {
  taskId: string;
  checklistId: string;
  onSubmit: (submission: Partial<TaskSubmission>) => Promise<void>;
  onCancel?: () => void;
}

export const TaskSubmissionForm: React.FC<TaskSubmissionFormProps> = ({
  taskId,
  checklistId,
  onSubmit,
  onCancel
}) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);

  const handleLocationCapture = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords);
        },
        (error) => {
          console.warn('Location capture failed:', error);
        }
      );
    }
  };

  const handleSubmit = async (status: SubmissionStatus = 'submitted') => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const submission: Partial<TaskSubmission> = {
        taskId,
        checklistId,
        submittedBy: user.id,
        status,
        mediaFiles,
        notes: notes.trim() || undefined,
        completedAt: new Date(),
        submittedAt: new Date(),
        location: location || undefined
      };

      await onSubmit(submission);
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    handleSubmit('draft');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Submit Task Completion</h3>
        <p className="text-sm text-gray-600 mt-1">
          Upload photos, videos, or documents to document task completion
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-4">
            Upload Evidence
          </label>
          <MediaUpload
            onFilesUploaded={setMediaFiles}
            maxFiles={10}
            acceptedTypes={['image/*', 'video/*', 'application/pdf']}
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-900 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Add any additional notes about the task completion..."
          />
        </div>

        {/* Location */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">Location</p>
              <p className="text-xs text-gray-500">
                {location ? 'Location captured' : 'Add location for verification'}
              </p>
            </div>
          </div>
          <motion.button
            onClick={handleLocationCapture}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              location 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!!location}
          >
            {location ? 'Captured' : 'Capture'}
          </motion.button>
        </div>

        {/* Summary */}
        {(mediaFiles.length > 0 || notes.trim() || location) && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Submission Summary</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {mediaFiles.length > 0 && (
                <li>• {mediaFiles.length} file(s) attached</li>
              )}
              {notes.trim() && (
                <li>• Notes added</li>
              )}
              {location && (
                <li>• Location captured</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="flex space-x-3">
          {onCancel && (
            <motion.button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              Cancel
            </motion.button>
          )}

          <motion.button
            onClick={handleSaveDraft}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
          >
            Save Draft
          </motion.button>
        </div>

        <motion.button
          onClick={() => handleSubmit('submitted')}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting || mediaFiles.length === 0}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting...</span>
            </div>
          ) : (
            'Submit Task'
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

// Submission review component for managers
interface SubmissionReviewProps {
  submission: TaskSubmission;
  onApprove: (notes?: string) => Promise<void>;
  onReject: (notes: string) => Promise<void>;
  onRequestChanges: (notes: string) => Promise<void>;
}

export const SubmissionReview: React.FC<SubmissionReviewProps> = ({
  submission,
  onApprove,
  onReject,
  onRequestChanges
}) => {
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | 'changes' | null>(null);

  const handleAction = async (action: 'approve' | 'reject' | 'changes') => {
    setIsProcessing(true);
    setSelectedAction(action);

    try {
      switch (action) {
        case 'approve':
          await onApprove(reviewNotes.trim() || undefined);
          break;
        case 'reject':
          if (!reviewNotes.trim()) {
            alert('Please provide a reason for rejection');
            return;
          }
          await onReject(reviewNotes.trim());
          break;
        case 'changes':
          if (!reviewNotes.trim()) {
            alert('Please specify what changes are needed');
            return;
          }
          await onRequestChanges(reviewNotes.trim());
          break;
      }
    } catch (error) {
      console.error('Review action failed:', error);
    } finally {
      setIsProcessing(false);
      setSelectedAction(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Submission</h3>

        {/* Media Files */}
        {submission.mediaFiles.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Attached Files</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {submission.mediaFiles.map((file) => (
                <div key={file.id} className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                  {file.type === 'image' ? (
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.originalName}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => window.open(file.url, '_blank')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 cursor-pointer"
                         onClick={() => window.open(file.url, '_blank')}>
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {submission.notes && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Submission Notes</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{submission.notes}</p>
            </div>
          </div>
        )}

        {/* Review Notes */}
        <div className="mb-6">
          <label htmlFor="reviewNotes" className="block text-sm font-medium text-gray-900 mb-2">
            Review Notes
          </label>
          <textarea
            id="reviewNotes"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Add your review comments..."
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <motion.button
            onClick={() => handleAction('approve')}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isProcessing}
          >
            {isProcessing && selectedAction === 'approve' ? 'Approving...' : 'Approve'}
          </motion.button>

          <motion.button
            onClick={() => handleAction('changes')}
            className="flex-1 px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 border border-orange-300 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isProcessing}
          >
            {isProcessing && selectedAction === 'changes' ? 'Requesting...' : 'Request Changes'}
          </motion.button>

          <motion.button
            onClick={() => handleAction('reject')}
            className="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isProcessing}
          >
            {isProcessing && selectedAction === 'reject' ? 'Rejecting...' : 'Reject'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
