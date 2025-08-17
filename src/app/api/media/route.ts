import { NextRequest, NextResponse } from 'next/server';
import { S3MediaService } from '../../../lib/aws/s3';
import { validateAwsConfig } from '../../../lib/database/config';

export async function GET(request: NextRequest) {
  try {
    validateAwsConfig();
    
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const fileType = searchParams.get('fileType');
    const userId = searchParams.get('userId');

    if (!fileName || !fileType || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: fileName, fileType, userId' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'application/pdf', 'text/plain'
    ];

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    const { uploadUrl, key } = await S3MediaService.getUploadUrl(
      fileName,
      fileType,
      userId
    );

    return NextResponse.json({
      uploadUrl,
      key,
      message: 'Upload URL generated successfully'
    });

  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    validateAwsConfig();
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'download') {
      const body = await request.json();
      const { key } = body;

      if (!key) {
        return NextResponse.json(
          { error: 'Missing required field: key' },
          { status: 400 }
        );
      }

      const downloadUrl = await S3MediaService.getDownloadUrl(key);
      
      return NextResponse.json({
        downloadUrl,
        message: 'Download URL generated successfully'
      });
    }

    if (action === 'metadata') {
      const body = await request.json();
      const { key } = body;

      if (!key) {
        return NextResponse.json(
          { error: 'Missing required field: key' },
          { status: 400 }
        );
      }

      const metadata = await S3MediaService.getFileMetadata(key);
      
      return NextResponse.json({
        metadata,
        message: 'File metadata retrieved successfully'
      });
    }

    if (action === 'thumbnail') {
      const body = await request.json();
      const { originalKey, userId } = body;

      if (!originalKey || !userId) {
        return NextResponse.json(
          { error: 'Missing required fields: originalKey, userId' },
          { status: 400 }
        );
      }

      const thumbnailKey = await S3MediaService.generateThumbnail(originalKey, userId);
      
      return NextResponse.json({
        thumbnailKey,
        message: 'Thumbnail generated successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Supported actions: download, metadata, thumbnail' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in media API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    validateAwsConfig();
    
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required parameter: key' },
        { status: 400 }
      );
    }

    await S3MediaService.deleteFile(key);
    
    return NextResponse.json({
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
