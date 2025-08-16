// Custom hook for media upload and management

'use client';

import { useState, useCallback } from 'react';
import { MediaFile, MediaUploadProgress } from '../types/media';
import { MediaUtils } from '../lib/media/upload';

interface UseMediaUploadOptions {
  maxFiles?: number;
  onUploadComplete?: (files: MediaFile[]) => void;
  onUploadError?: (error: string) => void;
}

export const useMediaUpload = (options: UseMediaUploadOptions = {}) => {
  const [uploadProgress, setUploadProgress] = useState<MediaUploadProgress[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    const { maxFiles = 10 } = options;
    if (files.length > maxFiles) {
      options.onUploadError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);
    const progressItems: MediaUploadProgress[] = files.map(file => ({
      fileId: crypto.randomUUID(),
      filename: file.name,
      progress: 0,
      status: 'uploading'
    }));

    setUploadProgress(progressItems);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const progressItem = progressItems[index];
        
        // Validate file
        const validation = MediaUtils.validateFile(file);
        if (!validation.isValid) {
          setUploadProgress(prev => prev.map(item => 
            item.fileId === progressItem.fileId 
              ? { ...item, status: 'failed', error: validation.errors.join(', ') }
              : item
          ));
          throw new Error(validation.errors.join(', '));
        }

        // Compress if needed
        let processedFile = file;
        if (file.type.startsWith('image/')) {
          setUploadProgress(prev => prev.map(item => 
            item.fileId === progressItem.fileId 
              ? { ...item, status: 'processing', progress: 25 }
              : item
          ));
          processedFile = await MediaUtils.compressImage(file);
        }

        // Extract metadata
        const metadata = await MediaUtils.extractMetadata(processedFile);
        
        setUploadProgress(prev => prev.map(item => 
          item.fileId === progressItem.fileId 
            ? { ...item, progress: 50 }
            : item
        ));

        // Generate thumbnail
        const thumbnailUrl = await MediaUtils.generateThumbnail(processedFile);
        
        setUploadProgress(prev => prev.map(item => 
          item.fileId === progressItem.fileId 
            ? { ...item, progress: 75 }
            : item
        ));

        // Upload file (mock implementation)
        const uploadedFile = await uploadFileToServer(processedFile, metadata, thumbnailUrl);
        
        setUploadProgress(prev => prev.map(item => 
          item.fileId === progressItem.fileId 
            ? { ...item, progress: 100, status: 'completed' }
            : item
        ));

        return uploadedFile;
      });

      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<MediaFile> => result.status === 'fulfilled')
        .map(result => result.value);

      setUploadedFiles(prev => [...prev, ...successfulUploads]);
      options.onUploadComplete?.(successfulUploads);

      // Handle failed uploads
      const failedUploads = results.filter(result => result.status === 'rejected');
      if (failedUploads.length > 0) {
        const errorMessage = `${failedUploads.length} file(s) failed to upload`;
        options.onUploadError?.(errorMessage);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      options.onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [options]);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setUploadProgress(prev => prev.filter(progress => progress.fileId !== fileId));
  }, []);

  const clearAll = useCallback(() => {
    setUploadedFiles([]);
    setUploadProgress([]);
  }, []);

  const retryUpload = useCallback(async (fileId: string) => {
    const failedProgress = uploadProgress.find(p => p.fileId === fileId && p.status === 'failed');
    if (!failedProgress) return;

    // In a real implementation, you would retry the upload
    // For now, just reset the status
    setUploadProgress(prev => prev.map(item => 
      item.fileId === fileId 
        ? { ...item, status: 'uploading', progress: 0, error: undefined }
        : item
    ));
  }, [uploadProgress]);

  return {
    uploadFiles,
    removeFile,
    clearAll,
    retryUpload,
    uploadProgress,
    uploadedFiles,
    isUploading
  };
};

// Mock implementation - replace with actual API call
async function uploadFileToServer(
  file: File, 
  metadata: any, 
  thumbnailUrl: string | null
): Promise<MediaFile> {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mediaType = MediaUtils.getMediaType(file.type);
  if (!mediaType) throw new Error('Unsupported file type');

  return {
    id: crypto.randomUUID(),
    filename: `uploads/${Date.now()}-${file.name}`,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    type: mediaType,
    url: URL.createObjectURL(file), // In real app, this would be server URL
    thumbnailUrl: thumbnailUrl || undefined,
    metadata,
    uploadedBy: 'current-user-id', // Would come from auth context
    uploadedAt: new Date()
  };
}
