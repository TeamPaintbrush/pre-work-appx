// Media upload and processing utilities

import { MediaType, MediaFile, MediaMetadata } from '../../types/media';

export const MEDIA_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_VIDEO_DURATION: 300, // 5 minutes
  SUPPORTED_FORMATS: {
    image: ['jpeg', 'jpg', 'png', 'webp'],
    video: ['mp4', 'webm', 'mov'],
    document: ['pdf', 'txt'],
    audio: ['mp3', 'wav', 'm4a']
  },
  COMPRESSION_QUALITY: 0.8,
  THUMBNAIL_SIZE: { width: 300, height: 300 }
};

export class MediaUtils {
  static validateFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check file size
    if (file.size > MEDIA_CONFIG.MAX_FILE_SIZE) {
      errors.push(`File size must be less than ${MEDIA_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
    
    // Check file type
    const fileType = this.getMediaType(file.type);
    if (!fileType) {
      errors.push('Unsupported file format');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static getMediaType(mimeType: string): MediaType | null {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf' || mimeType === 'text/plain') return 'document';
    return null;
  }

  static async compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const { width, height } = this.calculateDimensions(img.width, img.height, 1920, 1080);
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, file.type, MEDIA_CONFIG.COMPRESSION_QUALITY);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  static calculateDimensions(
    originalWidth: number, 
    originalHeight: number, 
    maxWidth: number, 
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };
    
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  static async generateThumbnail(file: File): Promise<string | null> {
    if (!file.type.startsWith('image/')) return null;
    
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const { width, height } = this.calculateDimensions(
          img.width, 
          img.height, 
          MEDIA_CONFIG.THUMBNAIL_SIZE.width, 
          MEDIA_CONFIG.THUMBNAIL_SIZE.height
        );
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }

  static async extractMetadata(file: File): Promise<Partial<MediaMetadata>> {
    const metadata: Partial<MediaMetadata> = {
      checksum: await this.calculateChecksum(file)
    };

    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      try {
        const dimensions = await this.getMediaDimensions(file);
        metadata.width = dimensions.width;
        metadata.height = dimensions.height;
        
        if (file.type.startsWith('video/')) {
          metadata.duration = await this.getVideoDuration(file);
        }
      } catch (error) {
        console.warn('Failed to extract media metadata:', error);
      }
    }

    return metadata;
  }

  private static async calculateChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private static getMediaDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.onloadedmetadata = () => resolve({ width: video.videoWidth, height: video.videoHeight });
        video.onerror = reject;
        video.src = URL.createObjectURL(file);
      } else {
        reject(new Error('Unsupported media type'));
      }
    });
  }

  private static getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => resolve(video.duration);
      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    });
  }
}
