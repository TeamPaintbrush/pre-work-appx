"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAccessibility } from '../../hooks/useAccessibility';

interface AccessibilitySettings {
  // Visual settings
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  focusVisible: boolean;
  
  // Screen reader settings
  announceProgress: boolean;
  verboseDescriptions: boolean;
  readOrderPreference: 'natural' | 'priority' | 'manual';
  
  // Keyboard navigation
  keyboardShortcuts: boolean;
  tabTrapEnabled: boolean;
  skipLinksEnabled: boolean;
  
  // Motor accessibility
  stickyFocus: boolean;
  clickDelay: number; // ms
  dragSensitivity: 'low' | 'medium' | 'high';
  
  // Color and contrast
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  customColors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
  };
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  checkContrast: (foreground: string, background: string) => {
    ratio: number;
    passesAA: boolean;
    passesAAA: boolean;
    passesAALarge: boolean;
  };
  addSkipLink: (text: string, targetId: string) => void;
  isAccessibilityMode: boolean;
}

const defaultSettings: AccessibilitySettings = {
  // Visual settings
  highContrast: false,
  reducedMotion: false,
  fontSize: 'medium',
  focusVisible: true,
  
  // Screen reader settings
  announceProgress: true,
  verboseDescriptions: false,
  readOrderPreference: 'natural',
  
  // Keyboard navigation
  keyboardShortcuts: true,
  tabTrapEnabled: true,
  skipLinksEnabled: true,
  
  // Motor accessibility
  stickyFocus: false,
  clickDelay: 0,
  dragSensitivity: 'medium',
  
  // Color and contrast
  colorBlindMode: 'none',
  customColors: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);
  
  const { preferences, announce, checkContrast, addSkipLink } = useAccessibility();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.warn('Failed to parse saved accessibility settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply system preferences
  useEffect(() => {
    if (preferences.prefersHighContrast && !settings.highContrast) {
      setSettings(prev => ({ ...prev, highContrast: true }));
    }
    if (preferences.prefersReducedMotion && !settings.reducedMotion) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }
  }, [preferences, settings.highContrast, settings.reducedMotion]);

  // Detect if accessibility mode is active
  useEffect(() => {
    const hasAccessibilityFeatures = 
      settings.highContrast ||
      settings.reducedMotion ||
      settings.fontSize !== 'medium' ||
      settings.announceProgress ||
      settings.verboseDescriptions ||
      settings.colorBlindMode !== 'none';
    
    setIsAccessibilityMode(hasAccessibilityFeatures);
  }, [settings]);

  // Apply CSS custom properties for accessibility
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size
    const fontSizeMap = {
      'small': '0.875rem',
      'medium': '1rem',
      'large': '1.125rem',
      'extra-large': '1.25rem'
    };
    root.style.setProperty('--font-size-base', fontSizeMap[settings.fontSize]);
    
    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Color blind mode
    root.className = root.className.replace(/color-blind-\w+/g, '');
    if (settings.colorBlindMode !== 'none') {
      root.classList.add(`color-blind-${settings.colorBlindMode}`);
    }
    
    // Custom colors
    root.style.setProperty('--color-primary', settings.customColors.primary);
    root.style.setProperty('--color-secondary', settings.customColors.secondary);
    root.style.setProperty('--color-success', settings.customColors.success);
    root.style.setProperty('--color-warning', settings.customColors.warning);
    root.style.setProperty('--color-error', settings.customColors.error);
    
  }, [settings]);

  // Keyboard shortcuts setup
  useEffect(() => {
    if (!settings.keyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + 1: Skip to main content
      if (event.altKey && event.key === '1') {
        event.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          announce('Navigated to main content');
        }
      }
      
      // Alt + 2: Skip to navigation
      if (event.altKey && event.key === '2') {
        event.preventDefault();
        const nav = document.querySelector('nav') || document.getElementById('navigation');
        if (nav) {
          (nav as HTMLElement).focus();
          announce('Navigated to navigation');
        }
      }
      
      // Alt + H: Toggle high contrast
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
        announce(settings.highContrast ? 'High contrast disabled' : 'High contrast enabled');
      }
      
      // Alt + M: Toggle reduced motion
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
        announce(settings.reducedMotion ? 'Animations enabled' : 'Animations reduced');
      }
      
      // Alt + Plus: Increase font size
      if (event.altKey && event.key === '=') {
        event.preventDefault();
        const sizes = ['small', 'medium', 'large', 'extra-large'] as const;
        const currentIndex = sizes.indexOf(settings.fontSize);
        if (currentIndex < sizes.length - 1) {
          const newSize = sizes[currentIndex + 1];
          setSettings(prev => ({ ...prev, fontSize: newSize }));
          announce(`Font size increased to ${newSize}`);
        }
      }
      
      // Alt + Minus: Decrease font size
      if (event.altKey && event.key === '-') {
        event.preventDefault();
        const sizes = ['small', 'medium', 'large', 'extra-large'] as const;
        const currentIndex = sizes.indexOf(settings.fontSize);
        if (currentIndex > 0) {
          const newSize = sizes[currentIndex - 1];
          setSettings(prev => ({ ...prev, fontSize: newSize }));
          announce(`Font size decreased to ${newSize}`);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings, announce]);

  const updateSettings = useCallback((updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    announce('Accessibility settings reset to defaults');
  }, [announce]);

  const value: AccessibilityContextType = {
    settings,
    updateSettings,
    resetSettings,
    announce,
    checkContrast,
    addSkipLink,
    isAccessibilityMode,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      
      {/* Skip Links */}
      {settings.skipLinksEnabled && (
        <div id="skip-links" className="sr-only">
          <a
            href="#main-content"
            className="skip-link focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-2 focus:bg-black focus:text-white focus:no-underline"
          >
            Skip to main content
          </a>
          <a
            href="#navigation"
            className="skip-link focus:not-sr-only focus:absolute focus:top-0 focus:left-24 focus:z-50 focus:p-2 focus:bg-black focus:text-white focus:no-underline"
          >
            Skip to navigation
          </a>
        </div>
      )}
      
      {/* Accessibility Status Indicator */}
      {isAccessibilityMode && (
        <div
          className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg text-xs"
          role="status"
          aria-live="polite"
        >
          🔧 Accessibility mode active
        </div>
      )}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
};

// Enhanced accessibility settings panel component
export const AccessibilitySettingsPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings, checkContrast } = useAccessibilityContext();
  
  if (!isOpen) return null;

  const fontSizeOptions = [
    { value: 'small', label: 'Small (14px)' },
    { value: 'medium', label: 'Medium (16px)' },
    { value: 'large', label: 'Large (18px)' },
    { value: 'extra-large', label: 'Extra Large (20px)' }
  ];

  const colorBlindOptions = [
    { value: 'none', label: 'None' },
    { value: 'protanopia', label: 'Protanopia (Red-blind)' },
    { value: 'deuteranopia', label: 'Deuteranopia (Green-blind)' },
    { value: 'tritanopia', label: 'Tritanopia (Blue-blind)' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Accessibility Settings</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>

            <div className="space-y-8">
              {/* Visual Settings */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">High Contrast Mode</span>
                    <input
                      type="checkbox"
                      checked={settings.highContrast}
                      onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Reduce Motion</span>
                    <input
                      type="checkbox"
                      checked={settings.reducedMotion}
                      onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                    <select
                      value={settings.fontSize}
                      onChange={(e) => updateSettings({ fontSize: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {fontSizeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color Blind Support</label>
                    <select
                      value={settings.colorBlindMode}
                      onChange={(e) => updateSettings({ colorBlindMode: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {colorBlindOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Screen Reader Settings */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Screen Reader</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Announce Progress</span>
                    <input
                      type="checkbox"
                      checked={settings.announceProgress}
                      onChange={(e) => updateSettings({ announceProgress: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Verbose Descriptions</span>
                    <input
                      type="checkbox"
                      checked={settings.verboseDescriptions}
                      onChange={(e) => updateSettings({ verboseDescriptions: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </section>

              {/* Keyboard Navigation */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyboard Navigation</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Enable Keyboard Shortcuts</span>
                    <input
                      type="checkbox"
                      checked={settings.keyboardShortcuts}
                      onChange={(e) => updateSettings({ keyboardShortcuts: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Skip Links</span>
                    <input
                      type="checkbox"
                      checked={settings.skipLinksEnabled}
                      onChange={(e) => updateSettings({ skipLinksEnabled: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </section>

              {/* Keyboard Shortcuts Help */}
              {settings.keyboardShortcuts && (
                <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Available Keyboard Shortcuts</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div><kbd className="px-1 py-0.5 bg-blue-200 rounded">Alt + 1</kbd> Skip to main content</div>
                    <div><kbd className="px-1 py-0.5 bg-blue-200 rounded">Alt + 2</kbd> Skip to navigation</div>
                    <div><kbd className="px-1 py-0.5 bg-blue-200 rounded">Alt + H</kbd> Toggle high contrast</div>
                    <div><kbd className="px-1 py-0.5 bg-blue-200 rounded">Alt + M</kbd> Toggle reduced motion</div>
                    <div><kbd className="px-1 py-0.5 bg-blue-200 rounded">Alt + +</kbd> Increase font size</div>
                    <div><kbd className="px-1 py-0.5 bg-blue-200 rounded">Alt + -</kbd> Decrease font size</div>
                  </div>
                </section>
              )}

              {/* Reset Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={resetSettings}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityProvider;
