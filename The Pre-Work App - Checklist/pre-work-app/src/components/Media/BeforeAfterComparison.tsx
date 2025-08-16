"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Attachment } from '../../types';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

interface BeforeAfterComparisonProps {
  beforeMedia: Attachment[];
  afterMedia: Attachment[];
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  beforeMedia,
  afterMedia,
  isOpen,
  onClose,
  title = "Before & After Comparison"
}) => {
  const [currentPair, setCurrentPair] = useState(0);
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'slider' | 'overlay'>('side-by-side');
  const [sliderPosition, setSliderPosition] = useState(50);

  const maxPairs = Math.max(beforeMedia.length, afterMedia.length);

  const getCurrentBefore = () => beforeMedia[currentPair] || null;
  const getCurrentAfter = () => afterMedia[currentPair] || null;

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getLocationDisplay = (attachment: Attachment) => {
    if (!attachment.metadata?.location) return null;
    const { latitude, longitude } = attachment.metadata.location;
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  };

  const renderSideBySide = () => {
    const before = getCurrentBefore();
    const after = getCurrentAfter();

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            Before
          </h3>
          {before ? (
            <div className="relative">
              {before.type === 'image' ? (
                <img
                  src={before.url}
                  alt="Before"
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              ) : (
                <video
                  src={before.url}
                  controls
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              )}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {formatTimestamp(before.uploadedAt)}
              </div>
              {before.metadata?.location && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  📍 {getLocationDisplay(before)}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">No before media</p>
            </div>
          )}
        </div>

        {/* After */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            After
          </h3>
          {after ? (
            <div className="relative">
              {after.type === 'image' ? (
                <img
                  src={after.url}
                  alt="After"
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              ) : (
                <video
                  src={after.url}
                  controls
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              )}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {formatTimestamp(after.uploadedAt)}
              </div>
              {after.metadata?.location && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  📍 {getLocationDisplay(after)}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">No after media</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSlider = () => {
    const before = getCurrentBefore();
    const after = getCurrentAfter();

    if (!before || !after || before.type !== 'image' || after.type !== 'image') {
      return (
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Slider comparison requires both before and after images</p>
        </div>
      );
    }

    return (
      <div className="relative w-full h-96 overflow-hidden rounded-lg shadow-md">
        {/* After Image (background) */}
        <img
          src={after.url}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Before Image (overlay) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={before.url}
            alt="Before"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Slider Control */}
        <div className="absolute inset-0 flex items-center">
          <div
            className="relative w-full h-1 bg-white bg-opacity-50 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = (x / rect.width) * 100;
              setSliderPosition(Math.max(0, Math.min(100, percentage)));
            }}
          >
            <div
              className="absolute top-1/2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-grab active:cursor-grabbing -mt-3 shadow-lg"
              style={{ left: `${sliderPosition}%`, marginLeft: '-12px' }}
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startPosition = sliderPosition;
                const sliderElement = e.currentTarget.parentElement;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  if (!sliderElement) return;
                  const rect = sliderElement.getBoundingClientRect();
                  
                  const deltaX = moveEvent.clientX - startX;
                  const deltaPercentage = (deltaX / rect.width) * 100;
                  const newPosition = startPosition + deltaPercentage;
                  setSliderPosition(Math.max(0, Math.min(100, newPosition)));
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-red-500 text-white text-sm px-2 py-1 rounded">
          Before
        </div>
        <div className="absolute top-4 right-4 bg-green-500 text-white text-sm px-2 py-1 rounded">
          After
        </div>
      </div>
    );
  };

  const renderOverlay = () => {
    const before = getCurrentBefore();
    const after = getCurrentAfter();

    if (!before || !after || before.type !== 'image' || after.type !== 'image') {
      return (
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Overlay comparison requires both before and after images</p>
        </div>
      );
    }

    return (
      <div className="relative w-full h-96 overflow-hidden rounded-lg shadow-md">
        {/* Before Image (background) */}
        <img
          src={before.url}
          alt="Before"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* After Image (overlay with transparency) */}
        <motion.img
          src={after.url}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.5 }}
          whileHover={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-sm px-3 py-1 rounded">
          Hover to reveal before image
        </div>
      </div>
    );
  };

  const nextPair = () => {
    setCurrentPair((prev) => (prev + 1) % maxPairs);
  };

  const prevPair = () => {
    setCurrentPair((prev) => (prev - 1 + maxPairs) % maxPairs);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="xl"
      className="before-after-modal"
    >
      <div className="space-y-6">
        {/* Mode Selector */}
        <div className="flex justify-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setComparisonMode('side-by-side')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              comparisonMode === 'side-by-side'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Side by Side
          </button>
          <button
            onClick={() => setComparisonMode('slider')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              comparisonMode === 'slider'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Slider
          </button>
          <button
            onClick={() => setComparisonMode('overlay')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              comparisonMode === 'overlay'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Overlay
          </button>
        </div>

        {/* Navigation */}
        {maxPairs > 1 && (
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={prevPair}>
              ← Previous
            </Button>
            <span className="text-sm text-gray-600">
              {currentPair + 1} of {maxPairs}
            </span>
            <Button variant="outline" size="sm" onClick={nextPair}>
              Next →
            </Button>
          </div>
        )}

        {/* Comparison View */}
        <div className="comparison-container">
          {comparisonMode === 'side-by-side' && renderSideBySide()}
          {comparisonMode === 'slider' && renderSlider()}
          {comparisonMode === 'overlay' && renderOverlay()}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          {getCurrentBefore() && (
            <div className="bg-red-50 p-3 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Before Details</h4>
              <p>Captured: {formatTimestamp(getCurrentBefore()!.uploadedAt)}</p>
              {getCurrentBefore()!.metadata?.location && (
                <p>Location: {getLocationDisplay(getCurrentBefore()!)}</p>
              )}
              <p>Size: {(getCurrentBefore()!.fileSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
          {getCurrentAfter() && (
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">After Details</h4>
              <p>Captured: {formatTimestamp(getCurrentAfter()!.uploadedAt)}</p>
              {getCurrentAfter()!.metadata?.location && (
                <p>Location: {getLocationDisplay(getCurrentAfter()!)}</p>
              )}
              <p>Size: {(getCurrentAfter()!.fileSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary">
            Export Comparison
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BeforeAfterComparison;
