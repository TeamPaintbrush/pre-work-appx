"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaCaptureConfig, Attachment, MediaMetadata, GeolocationData } from '../../types';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

interface MediaCaptureProps {
  config: MediaCaptureConfig;
  onCapture: (attachment: Attachment) => void;
  onClose: () => void;
  isOpen: boolean;
  itemId?: string;
  sectionId?: string;
  checklistId: string;
  captureType?: 'before' | 'after' | 'during' | 'reference';
}

const MediaCapture: React.FC<MediaCaptureProps> = ({
  config,
  onCapture,
  onClose,
  isOpen,
  itemId,
  sectionId,
  checklistId,
  captureType = 'during'
}) => {
  const [currentMode, setCurrentMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Get user location if required
  useEffect(() => {
    if (config.requireLocation && isOpen) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: new Date()
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
          if (config.requireLocation) {
            setError('Location access is required for this capture');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  }, [config.requireLocation, isOpen]);

  // Initialize camera stream
  useEffect(() => {
    if (isOpen) {
      initializeCamera();
    } else {
      cleanupStream();
    }

    return () => cleanupStream();
  }, [isOpen]);

  const initializeCamera = async () => {
    try {
      setError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Use back camera by default
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: currentMode === 'video'
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Camera access denied or not available');
      console.error('Camera initialization error:', err);
    }
  };

  const cleanupStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !stream) return;

    setIsCapturing(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Canvas context not available');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Failed to create image blob');

        const attachment = await createAttachment(blob, 'image/jpeg');
        setCapturedMedia(URL.createObjectURL(blob));
        onCapture(attachment);
      }, 'image/jpeg', getQualityValue());

    } catch (err) {
      setError('Failed to capture photo');
      console.error('Photo capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  }, [stream, onCapture]);

  const startVideoRecording = useCallback(async () => {
    if (!stream) return;

    try {
      chunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const attachment = await createAttachment(blob, 'video/webm');
        setCapturedMedia(URL.createObjectURL(blob));
        onCapture(attachment);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (config.videoMaxDuration && newTime >= config.videoMaxDuration) {
            stopVideoRecording();
          }
          return newTime;
        });
      }, 1000);

    } catch (err) {
      setError('Failed to start video recording');
      console.error('Video recording error:', err);
    }
  }, [stream, onCapture]);

  const stopVideoRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  }, [isRecording]);

  const createAttachment = async (blob: Blob, mimeType: string): Promise<Attachment> => {
    const metadata: MediaMetadata = {
      timestamp: new Date(),
      location: location || undefined,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenSize: {
          width: window.screen.width,
          height: window.screen.height
        }
      },
      cameraSettings: {
        facingMode: 'environment',
        resolution: `${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`
      },
      quality: config.photoQuality
    };

    if (currentMode === 'video') {
      metadata.duration = recordingTime;
    }

    if (videoRef.current) {
      metadata.dimensions = {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      };
      metadata.orientation = videoRef.current.videoWidth > videoRef.current.videoHeight ? 'landscape' : 'portrait';
    }

    return {
      id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filename: `${captureType}_${currentMode}_${new Date().toISOString()}.${mimeType.split('/')[1]}`,
      originalName: `${captureType}_${currentMode}_${Date.now()}`,
      fileSize: blob.size,
      mimeType,
      url: URL.createObjectURL(blob),
      uploadedAt: new Date(),
      uploadedBy: 'current_user', // TODO: Get from user context
      itemId,
      sectionId,
      checklistId,
      description: `${captureType} ${currentMode} captured in app`,
      tags: [captureType, currentMode, 'in-app-capture'],
      metadata,
      type: currentMode === 'photo' ? 'image' : 'video',
      captureType,
      isRequired: true,
      capturedInApp: true
    };
  };

  const getQualityValue = (): number => {
    switch (config.photoQuality) {
      case 'low': return 0.6;
      case 'medium': return 0.8;
      case 'high': return 0.9;
      case 'ultra': return 1.0;
      default: return 0.8;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const switchCamera = async () => {
    cleanupStream();
    // TODO: Implement camera switching (front/back)
    await initializeCamera();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Capture ${captureType} ${currentMode}`}
      size="lg"
      className="media-capture-modal"
    >
      <div className="media-capture-container">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
          {config.allowPhoto && (
            <button
              onClick={() => setCurrentMode('photo')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                currentMode === 'photo'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📷 Photo
            </button>
          )}
          {config.allowVideo && (
            <button
              onClick={() => setCurrentMode('video')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                currentMode === 'video'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🎥 Video
            </button>
          )}
        </div>

        {/* Camera View */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Recording Indicator */}
          {isRecording && (
            <motion.div
              className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-sm font-medium">REC {formatTime(recordingTime)}</span>
            </motion.div>
          )}

          {/* Capture Type Badge */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {captureType.toUpperCase()}
          </div>

          {/* Location Indicator */}
          {location && (
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              📍 Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center space-x-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={switchCamera}
            disabled={isRecording}
          >
            🔄 Switch
          </Button>

          {currentMode === 'photo' ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={capturePhoto}
              disabled={isCapturing || !stream}
              className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
            >
              {isCapturing ? (
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className="w-12 h-12 bg-blue-600 rounded-full"></div>
              )}
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopVideoRecording : startVideoRecording}
              disabled={!stream}
              className={`w-16 h-16 border-4 border-gray-300 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 ${
                isRecording ? 'bg-red-600' : 'bg-white'
              }`}
            >
              {isRecording ? (
                <div className="w-6 h-6 bg-white rounded-sm"></div>
              ) : (
                <div className="w-12 h-12 bg-red-600 rounded-full"></div>
              )}
            </motion.button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isRecording}
          >
            Cancel
          </Button>
        </div>

        {/* Quality Info */}
        <div className="mt-4 text-center text-xs text-gray-500">
          Quality: {config.photoQuality} • 
          {location ? ' Location: ✓' : ' Location: ✗'} • 
          Timestamp: ✓
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </Modal>
  );
};

export default MediaCapture;
