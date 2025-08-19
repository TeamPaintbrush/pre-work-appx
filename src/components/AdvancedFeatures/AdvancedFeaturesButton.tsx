// Settings Button for Advanced Features
// Small, non-intrusive button to access feature settings

'use client';

import React, { useState } from 'react';
import { AdvancedFeaturesSettings } from './AdvancedFeaturesSettings';
import { useFeatureToggle } from './FeatureToggleProvider';

interface AdvancedFeaturesButtonProps {
  className?: string;
  position?: 'fixed' | 'relative';
}

export function AdvancedFeaturesButton({ 
  className = '',
  position = 'fixed'
}: AdvancedFeaturesButtonProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isAdvancedMode, enabledFeaturesCount } = useFeatureToggle();

  const baseClasses = position === 'fixed' 
    ? 'fixed bottom-4 right-4 z-40' 
    : 'relative inline-flex';

  return (
    <>
      <button
        onClick={() => setIsSettingsOpen(true)}
        className={`
          ${baseClasses}
          group bg-white hover:bg-gray-50 border border-gray-200 
          rounded-full shadow-lg hover:shadow-xl transition-all duration-200
          p-3 flex items-center space-x-2
          ${className}
        `}
        title={isAdvancedMode ? `${enabledFeaturesCount} advanced features enabled` : 'Enable advanced features'}
      >
        {/* Settings Icon */}
        <svg 
          className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
          />
        </svg>

        {/* Text Label (hidden on mobile) */}
        <span className="hidden sm:block text-sm font-medium text-gray-700 group-hover:text-gray-900">
          {isAdvancedMode ? 'Features' : 'Upgrade'}
        </span>

        {/* Feature Count Badge */}
        {isAdvancedMode && enabledFeaturesCount > 0 && (
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
            {enabledFeaturesCount}
          </span>
        )}

        {/* "New" Badge for non-advanced mode */}
        {!isAdvancedMode && (
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
            New
          </span>
        )}
      </button>

      {/* Settings Modal */}
      <AdvancedFeaturesSettings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}

// Alternative minimal version for inline use
export function AdvancedFeaturesIconButton({ 
  onClick,
  className = ''
}: {
  onClick?: () => void;
  className?: string;
}) {
  const { isAdvancedMode, enabledFeaturesCount } = useFeatureToggle();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsSettingsOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          relative p-2 text-gray-400 hover:text-gray-600 transition-colors
          ${className}
        `}
        title={isAdvancedMode ? `${enabledFeaturesCount} advanced features` : 'Advanced features'}
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" 
          />
        </svg>
        
        {/* Feature count indicator */}
        {isAdvancedMode && enabledFeaturesCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {enabledFeaturesCount > 9 ? '9+' : enabledFeaturesCount}
          </span>
        )}
      </button>

      {!onClick && (
        <AdvancedFeaturesSettings 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
}
