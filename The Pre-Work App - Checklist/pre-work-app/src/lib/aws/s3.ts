import { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  HeadObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKETS } from '../database/config';
import { Media, MediaSchema } from '../database/schemas';
import { v4 as uuidv4 } from 'uuid';

export class S3MediaService {
  // Generate presigned URL for direct upload
  static async getUploadUrl(
    fileName: string, 
    fileType: string,
    userId: string
  ): Promise<{ uploadUrl: string; key: string }> {
    const key = `users/${userId}/uploads/${uuidv4()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: S3_BUCKETS.MEDIA,
      Key: key,
      ContentType: fileType,
      Metadata: {
        userId: userId,
        uploadedAt: new Date().toISOString(),
      },
    });

    try {
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return { uploadUrl, key };
    } catch (error) {
      console.error('Error generating upload URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  // Upload file directly (for server-side uploads)
  static async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string,
    userId: string
  ): Promise<string> {
    const key = `users/${userId}/uploads/${uuidv4()}-${fileName}`;

    try {
      await s3Client.send(new PutObjectCommand({
        Bucket: S3_BUCKETS.MEDIA,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: {
          userId: userId,
          uploadedAt: new Date().toISOString(),
        },
      }));

      return key;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  // Generate thumbnail for images (simplified - you'd typically use Lambda for this)
  static async generateThumbnail(
    originalKey: string,
    userId: string
  ): Promise<string> {
    try {
      // For now, return a placeholder. In production, this would:
      // 1. Download the original image from S3
      // 2. Generate a thumbnail using sharp or similar
      // 3. Upload the thumbnail to the thumbnails bucket
      
      const thumbnailKey = `users/${userId}/thumbnails/${uuidv4()}-thumb.jpg`;
      
      // Placeholder implementation - you'd implement actual thumbnail generation here
      console.log(`Would generate thumbnail for ${originalKey} -> ${thumbnailKey}`);
      
      return thumbnailKey;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw new Error('Failed to generate thumbnail');
    }
  }

  // Get download URL
  static async getDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKETS.MEDIA,
      Key: key,
    });

    try {
      return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  // Delete file
  static async deleteFile(key: string): Promise<void> {
    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: S3_BUCKETS.MEDIA,
        Key: key,
      }));
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Check if file exists
  static async fileExists(key: string): Promise<boolean> {
    try {
      await s3Client.send(new HeadObjectCommand({
        Bucket: S3_BUCKETS.MEDIA,
        Key: key,
      }));
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get file metadata
  static async getFileMetadata(key: string): Promise<any> {
    try {
      const result = await s3Client.send(new HeadObjectCommand({
        Bucket: S3_BUCKETS.MEDIA,
        Key: key,
      }));
      
      return {
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        lastModified: result.LastModified,
        metadata: result.Metadata,
      };
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error('Failed to get file metadata');
    }
  }
}
