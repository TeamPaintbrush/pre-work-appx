"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChecklistItemProps } from '../../types';
import Button from '../UI/Button';
import { itemVariants, cardHoverVariants } from '../Animation/AnimationProvider';
import { useMobileDetection, useSwipeGesture, useLongPress, useVibration } from '../../hooks/useMobile';

const ChecklistItem: React.FC<ChecklistItemProps> = ({ 
  item, 
  sectionId, 
  onUpdate, 
  onToggleComplete 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(item.notes);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  
  const itemRef = useRef<HTMLDivElement | null>(null);
  const { isMobile, isTouch } = useMobileDetection();
  const { vibrate } = useVibration();

  // Mobile swipe gestures
  useSwipeGesture(itemRef as React.RefObject<HTMLElement>, ({ direction }) => {
    if (!isMobile) return;
    
    if (direction === 'right' && !item.isCompleted) {
      handleToggleComplete();
      vibrate(50); // Short haptic feedback
    } else if (direction === 'left') {
      setIsExpanded(!isExpanded);
    }
  });

  // Long press for mobile context menu
  const longPressProps = useLongPress(() => {
    if (isMobile) {
      vibrate(100); // Longer haptic for long press
      setIsExpanded(true);
      setShowSwipeHint(true);
      setTimeout(() => setShowSwipeHint(false), 3000);
    }
  }, 500);

  const handleToggleComplete = () => {
    if (isMobile) {
      vibrate(item.isCompleted ? 30 : 50); // Different feedback for complete/incomplete
    }
    onToggleComplete(item.id);
    if (!item.isCompleted) {
      onUpdate(item.id, { completedAt: new Date() });
    }
  };

  const handleSaveNotes = () => {
    onUpdate(item.id, { notes });
    setIsEditingNotes(false);
  };

  const handleCancelNotes = () => {
    setNotes(item.notes);
    setIsEditingNotes(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // In a real implementation, you would upload to your server
      // For now, we'll create local URLs and basic attachment objects
      const newAttachments = files.map(file => ({
        id: `attachment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        filename: file.name,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
        uploadedBy: 'current_user',
        checklistId: 'current_checklist',
        tags: [],
        type: file.type.startsWith('image/') ? 'image' as const : 'document' as const,
        capturedInApp: true
      }));
      
      const currentAttachments = item.attachments || [];
      onUpdate(item.id, { 
        attachments: [...currentAttachments, ...newAttachments]
      });
    }
  };

  const removeImage = (attachmentId: string) => {
    const currentAttachments = item.attachments || [];
    const updatedAttachments = currentAttachments.filter(att => att.id !== attachmentId);
    onUpdate(item.id, { 
      attachments: updatedAttachments
    });
  };

  return (
    <motion.div 
      ref={itemRef}
      className={`border rounded-lg transition-all duration-200 relative overflow-hidden ${
        item.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
      } ${item.isRequired ? 'border-l-4 border-l-red-500' : ''} ${
        isMobile ? 'p-3' : 'p-4'
      }`}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover={cardHoverVariants.hover}
      layout
      {...(isMobile ? longPressProps : {})}
    >
      
      {/* Swipe Hint for Mobile */}
      <AnimatePresence>
        {showSwipeHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10"
          >
            👆 Long press • Swipe right ✓ • Swipe left ➤
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Item Row */}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={item.isCompleted}
            onChange={handleToggleComplete}
            className={`${isTouch ? 'w-6 h-6' : 'w-5 h-5'} text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 ${
              isTouch ? 'min-h-[24px] min-w-[24px]' : ''
            }`}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`${isMobile ? 'text-base' : 'text-lg'} font-medium ${
                item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {item.text}
              </p>
              
              {item.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {item.description}
                </p>
              )}
              
              {/* Priority and Requirements indicators */}
              <div className="flex items-center space-x-2 mt-2 flex-wrap">
                {item.isRequired && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Required
                  </span>
                )}
                
                {item.priority && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.priority}
                  </span>
                )}
                
                {item.isCustom && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Custom
                  </span>
                )}
              </div>
              
              {item.timestamp && (
                <p className="text-xs text-gray-500 mt-1">
                  {item.isCompleted ? 'Completed' : 'Created'}: {new Date(item.timestamp).toLocaleString()}
                </p>
              )}
            </div>
            
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`ml-2 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md ${
                isTouch ? 'min-h-[44px] min-w-[44px]' : ''
              }`}
              whileTap={{ scale: 0.95 }}
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              <svg 
                className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-4"
          >
            {/* Notes Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                {!isEditingNotes && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingNotes(true)}
                  >
                    {item.notes ? 'Edit' : 'Add'} Notes
                  </Button>
                )}
              </div>
              
              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <Button variant="primary" size="sm" onClick={handleSaveNotes}>
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancelNotes}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  {item.notes || 'No notes added yet.'}
                </p>
              )}
            </div>

            {/* Photo Upload Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Photos ({(item.attachments || []).filter(att => att.type === 'image').length})
                </h4>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id={`upload-${item.id}`}
                  />
                  <label
                    htmlFor={`upload-${item.id}`}
                    className="cursor-pointer inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                  >
                    📷 Add Photos
                  </label>
                </div>
              </div>
              
              {/* Photo Gallery */}
              {(item.attachments || []).filter(att => att.type === 'image').length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(item.attachments || []).filter(att => att.type === 'image').map((attachment, index) => (
                    <div key={attachment.id} className="relative group">
                      <img
                        src={attachment.url}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        onClick={() => removeImage(attachment.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChecklistItem;