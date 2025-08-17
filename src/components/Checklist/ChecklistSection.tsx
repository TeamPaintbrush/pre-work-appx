"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChecklistSectionProps } from '../../types';
import ChecklistItem from './ChecklistItem';
import ProgressBar from './ProgressBar';
import Button from '../UI/Button';
import { calculateProgress } from '../../data/presetChecklists';
import { useMobileDetection } from '../../hooks/useMobile';

const ChecklistSection: React.FC<ChecklistSectionProps> = ({ 
  section, 
  onToggleSection, 
  onUpdateItem, 
  onToggleComplete,
  onAddItem
}) => {
  const { isTouch, isMobile } = useMobileDetection();
  
  const sectionProgress = calculateProgress({
    id: section.id,
    title: section.title,
    description: '',
    sections: [section],
    createdAt: new Date(),
    lastModified: new Date(),
    progress: 0,
    isCompleted: false,
    tags: [],
    priority: 'medium'
  });

  const completedCount = section.items.filter(item => item.isCompleted).length;
  const requiredCount = section.items.filter(item => item.isRequired).length;
  const completedRequiredCount = section.items.filter(item => item.isRequired && item.isCompleted).length;

  return (
    <motion.div 
      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Section Header */}
      <motion.div 
        className={`px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
          isTouch ? 'min-h-[60px]' : ''
        }`}
        onClick={() => onToggleSection(section.id)}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-grow">
            <div className="flex items-center space-x-3">
              <motion.button 
                className={`focus:outline-none ${isTouch ? 'p-2' : 'p-1'}`}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    section.isCollapsed ? '' : 'rotate-90'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
              <div className="min-w-0 flex-1">
                <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>
                  {section.title}
                </h3>
                <p className={`text-gray-600 mt-1 ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>
                  {section.description}
                </p>
              </div>
            </div>
          </div>
          
          {/* Section Progress Indicator */}
          <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
            <div className="text-right">
              <div className={`font-medium text-gray-900 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {completedCount}/{section.items.length}
              </div>
              {!isMobile && (
                <div className="text-xs text-gray-500">
                  {requiredCount > 0 && (
                    <span className="text-red-600">
                      {completedRequiredCount}/{requiredCount} required
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Mini Progress Ring */}
            <div className={`relative ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}>
              <svg className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} transform -rotate-90`} viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${
                    sectionProgress.percentage === 100 ? 'text-green-500' : 'text-blue-500'
                  }`}
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${sectionProgress.percentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`font-medium text-gray-700 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  {sectionProgress.percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section Content */}
      {!section.isCollapsed && (
        <motion.div 
          className="divide-y divide-gray-100"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Progress Bar */}
          <div className={`bg-gray-25 ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
            <ProgressBar progress={sectionProgress} />
          </div>
          
          {/* Items List */}
          <div className={`space-y-4 ${isMobile ? 'p-4' : 'p-6'}`}>
            {section.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p>No tasks in this section yet.</p>
                {onAddItem && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddItem(section.id)}
                    className="mt-4"
                  >
                    + Add First Task
                  </Button>
                )}
              </div>
            ) : (
              <>
                {section.items.map((item) => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    sectionId={section.id}
                    onUpdate={(itemId, updates) => onUpdateItem(section.id, itemId, updates)}
                    onToggleComplete={(itemId) => onToggleComplete(section.id, itemId)}
                  />
                ))}
                {onAddItem && (
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddItem(section.id)}
                      className="w-full"
                    >
                      + Add Custom Task
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Section Footer (when collapsed) */}
      {section.isCollapsed && completedCount === section.items.length && section.items.length > 0 && (
        <motion.div 
          className="px-6 py-2 bg-green-50 border-t border-green-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center text-green-700">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Section Complete!</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChecklistSection;
