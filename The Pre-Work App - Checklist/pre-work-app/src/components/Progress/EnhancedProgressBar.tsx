"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChecklistProgress, PreWorkChecklist, ComplianceReport } from '../../types';

interface EnhancedProgressBarProps {
  progress: ChecklistProgress;
  checklist: PreWorkChecklist;
  compliance?: ComplianceReport;
  showDetails?: boolean;
  animate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onComplianceClick?: () => void;
}

const EnhancedProgressBar: React.FC<EnhancedProgressBarProps> = ({
  progress,
  checklist,
  compliance,
  showDetails = true,
  animate = true,
  size = 'md',
  onComplianceClick
}) => {
  const progressVariants = {
    initial: { width: 0 },
    animate: { width: `${progress.percentage}%` },
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const getProgressColor = () => {
    if (compliance?.overallStatus === 'non_compliant') return 'bg-red-500';
    if (compliance?.overallStatus === 'warning') return 'bg-yellow-500';
    if (progress.percentage === 100) return 'bg-green-500';
    if (progress.percentage >= 75) return 'bg-blue-500';
    if (progress.percentage >= 50) return 'bg-indigo-500';
    if (progress.percentage >= 25) return 'bg-purple-500';
    return 'bg-gray-400';
  };

  const getRequiredProgress = () => {
    return progress.requiredItems > 0 ? progress.requiredPercentage : 0;
  };

  const getOverdueItems = useMemo(() => {
    const now = new Date();
    return checklist.sections.flatMap(section =>
      section.items.filter(item => {
        if (item.isCompleted || item.isSkipped) return false;
        
        // Check if item is overdue based on checklist due date
        if (checklist.dueDate && now > checklist.dueDate) return true;
        
        // Check if item has estimated time and should be done by now
        if (item.estimatedTime && checklist.startedAt) {
          const expectedCompletionTime = new Date(checklist.startedAt.getTime() + item.estimatedTime * 60000);
          return now > expectedCompletionTime;
        }
        
        return false;
      })
    );
  }, [checklist]);

  const getSkippedItems = useMemo(() => {
    return checklist.sections.flatMap(section =>
      section.items.filter(item => item.isSkipped && item.isRequired)
    );
  }, [checklist]);

  const getTimeRemaining = () => {
    if (!checklist.dueDate) return null;
    
    const now = new Date();
    const timeLeft = checklist.dueDate.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Overdue';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    
    return `${hours}h ${minutes}m remaining`;
  };

  const getEstimatedCompletion = () => {
    if (!progress.estimatedTimeRemaining) return null;
    
    const now = new Date();
    const estimatedEnd = new Date(now.getTime() + progress.estimatedTimeRemaining * 60000);
    
    return estimatedEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="enhanced-progress-container space-y-3">
      {/* Main Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">Overall Progress</h3>
          <span className="text-sm font-semibold text-gray-900">
            {progress.completedItems}/{progress.totalItems} ({progress.percentage}%)
          </span>
        </div>
        
        <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
          <motion.div
            className={`${sizeClasses[size]} ${getProgressColor()} transition-colors duration-300`}
            variants={animate ? progressVariants : undefined}
            initial={animate ? "initial" : undefined}
            animate={animate ? "animate" : undefined}
            transition={{ duration: 1, ease: "easeOut" }}
            style={!animate ? { width: `${progress.percentage}%` } : undefined}
          />
        </div>
      </div>

      {/* Required vs Optional Progress */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-red-600 font-medium">Required Tasks</span>
              <span className="text-red-800 font-semibold">
                {progress.completedRequiredItems}/{progress.requiredItems}
              </span>
            </div>
            <div className="w-full bg-red-100 rounded-full h-2">
              <motion.div
                className="h-2 bg-red-500 rounded-full"
                initial={animate ? { width: 0 } : undefined}
                animate={animate ? { width: `${getRequiredProgress()}%` } : undefined}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                style={!animate ? { width: `${getRequiredProgress()}%` } : undefined}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-blue-600 font-medium">Optional Tasks</span>
              <span className="text-blue-800 font-semibold">
                {progress.completedOptionalItems}/{progress.optionalItems}
              </span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <motion.div
                className="h-2 bg-blue-500 rounded-full"
                initial={animate ? { width: 0 } : undefined}
                animate={animate ? { width: `${progress.optionalPercentage}%` } : undefined}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                style={!animate ? { width: `${progress.optionalPercentage}%` } : undefined}
              />
            </div>
          </div>
        </div>
      )}

      {/* Compliance Status */}
      {compliance && (
        <div 
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            compliance.overallStatus === 'compliant' 
              ? 'bg-green-50 border-green-200 hover:bg-green-100'
              : compliance.overallStatus === 'warning'
              ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
              : 'bg-red-50 border-red-200 hover:bg-red-100'
          }`}
          onClick={onComplianceClick}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                compliance.overallStatus === 'compliant' 
                  ? 'bg-green-500'
                  : compliance.overallStatus === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium">
                {compliance.overallStatus === 'compliant' 
                  ? 'Compliant'
                  : compliance.overallStatus === 'warning'
                  ? 'Needs Attention'
                  : 'Non-Compliant'
                }
              </span>
            </div>
            <span className="text-xs text-gray-500">
              Click for details
            </span>
          </div>
          
          {compliance.blockers.length > 0 && (
            <div className="mt-2 text-xs text-red-700">
              {compliance.blockers.length} blocking issue(s)
            </div>
          )}
        </div>
      )}

      {/* Issues Summary */}
      {showDetails && (getOverdueItems.length > 0 || getSkippedItems.length > 0) && (
        <div className="space-y-2">
          {getOverdueItems.length > 0 && (
            <div className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="text-sm text-orange-800">Overdue Items</span>
              </div>
              <span className="text-sm font-semibold text-orange-900">
                {getOverdueItems.length}
              </span>
            </div>
          )}

          {getSkippedItems.length > 0 && (
            <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
                <span className="text-sm text-gray-700">Skipped Required Items</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {getSkippedItems.length}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Time Information */}
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600">
          {getTimeRemaining() && (
            <div className={`text-center p-2 rounded ${
              getTimeRemaining() === 'Overdue' 
                ? 'bg-red-50 text-red-700' 
                : 'bg-blue-50 text-blue-700'
            }`}>
              <div className="font-medium">Due Date</div>
              <div className="font-semibold">{getTimeRemaining()}</div>
            </div>
          )}

          {checklist.estimatedDuration && (
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-medium">Estimated Time</div>
              <div className="font-semibold">{checklist.estimatedDuration}m</div>
            </div>
          )}

          {getEstimatedCompletion() && (
            <div className="text-center p-2 bg-green-50 text-green-700 rounded">
              <div className="font-medium">Est. Completion</div>
              <div className="font-semibold">{getEstimatedCompletion()}</div>
            </div>
          )}
        </div>
      )}

      {/* Sections Progress */}
      {showDetails && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Section Progress</h4>
          <div className="space-y-1">
            {checklist.sections.map((section) => {
              const sectionProgress = (section.completedCount / section.totalCount) * 100;
              const hasIssues = section.items.some(item => 
                (!item.isCompleted && !item.isSkipped && item.isRequired) ||
                (item.isSkipped && item.isRequired)
              );
              
              return (
                <div key={section.id} className="flex items-center space-x-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs">
                      <span className={`truncate ${hasIssues ? 'text-red-600' : 'text-gray-600'}`}>
                        {section.title}
                        {hasIssues && ' ⚠️'}
                      </span>
                      <span className="text-gray-800 font-medium">
                        {section.completedCount}/{section.totalCount}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          hasIssues ? 'bg-red-400' : 'bg-blue-400'
                        }`}
                        style={{ width: `${sectionProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedProgressBar;
