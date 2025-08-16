"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

// Hook for managing focus
export const useFocusManagement = (isOpen: boolean) => {
  const previousFocus = useRef<HTMLElement | null>(null);
  const focusableElementsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocus.current = document.activeElement as HTMLElement;
      
      // Get all focusable elements
      const focusableElements = Array.from(
        document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[];
      
      focusableElementsRef.current = focusableElements;
      
      // Focus the first focusable element
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    } else {
      // Restore focus to the previous element
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    }
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) return;

    const focusableElements = focusableElementsRef.current;
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }
  };

  return { handleKeyDown };
};

// Hook for announcing screen reader messages
export const useScreenReader = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return { announce };
};

// Hook for keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const modifiers = {
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
        meta: event.metaKey,
      };

      Object.entries(shortcuts).forEach(([shortcut, callback]) => {
        const parts = shortcut.toLowerCase().split('+');
        const requiredKey = parts[parts.length - 1];
        const requiredModifiers = parts.slice(0, -1);

        if (key === requiredKey) {
          const hasRequiredModifiers = requiredModifiers.every(modifier => {
            switch (modifier) {
              case 'ctrl': return modifiers.ctrl;
              case 'shift': return modifiers.shift;
              case 'alt': return modifiers.alt;
              case 'meta': return modifiers.meta;
              default: return false;
            }
          });

          if (hasRequiredModifiers) {
            event.preventDefault();
            callback();
          }
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Hook for color scheme and accessibility preferences
export const useAccessibilityPreferences = () => {
  const [preferences, setPreferences] = useState({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersDarkMode: false,
    prefersLargeText: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const queries = {
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      prefersHighContrast: window.matchMedia('(prefers-contrast: high)'),
      prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)'),
      prefersLargeText: window.matchMedia('(min-resolution: 120dpi)'),
    };

    const updatePreferences = () => {
      setPreferences({
        prefersReducedMotion: queries.prefersReducedMotion.matches,
        prefersHighContrast: queries.prefersHighContrast.matches,
        prefersDarkMode: queries.prefersDarkMode.matches,
        prefersLargeText: queries.prefersLargeText.matches,
      });
    };

    // Set initial values
    updatePreferences();

    // Listen for changes
    Object.values(queries).forEach(query => {
      query.addEventListener('change', updatePreferences);
    });

    return () => {
      Object.values(queries).forEach(query => {
        query.removeEventListener('change', updatePreferences);
      });
    };
  }, []);

  return preferences;
};

// Hook for ARIA live regions and announcements
export const useAriaLiveRegion = () => {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create live region if it doesn't exist
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.setAttribute('id', 'aria-live-region');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      liveRegion.style.clipPath = 'inset(50%)';
      
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return () => {
      if (liveRegionRef.current && document.body.contains(liveRegionRef.current)) {
        document.body.removeChild(liveRegionRef.current);
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!liveRegionRef.current) return;

    liveRegionRef.current.setAttribute('aria-live', priority);
    liveRegionRef.current.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = '';
      }
    }, 1000);
  }, []);

  return { announce };
};

// Enhanced focus management with focus trap
export const useFocusTrap = (isActive: boolean, containerRef?: React.RefObject<HTMLElement>) => {
  const previousFocus = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((container?: HTMLElement) => {
    const focusableSelectors = [
      'button:not([disabled]):not([aria-hidden="true"])',
      '[href]:not([disabled]):not([aria-hidden="true"])',
      'input:not([disabled]):not([aria-hidden="true"])',
      'select:not([disabled]):not([aria-hidden="true"])',
      'textarea:not([disabled]):not([aria-hidden="true"])',
      '[tabindex]:not([tabindex="-1"]):not([disabled]):not([aria-hidden="true"])',
      '[contenteditable]:not([contenteditable="false"])',
    ].join(', ');

    const searchContainer = container || containerRef?.current || document;
    return Array.from(searchContainer.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }, [containerRef]);

  useEffect(() => {
    if (isActive) {
      // Store current focus
      previousFocus.current = document.activeElement as HTMLElement;
      
      const focusableElements = getFocusableElements();
      firstFocusableRef.current = focusableElements[0] || null;
      lastFocusableRef.current = focusableElements[focusableElements.length - 1] || null;
      
      // Focus first element
      if (firstFocusableRef.current) {
        firstFocusableRef.current.focus();
      }
    } else {
      // Restore previous focus
      if (previousFocus.current && typeof previousFocus.current.focus === 'function') {
        previousFocus.current.focus();
      }
    }
  }, [isActive, getFocusableElements]);

  const handleKeyDown = useCallback((event: KeyboardEvent | React.KeyboardEvent) => {
    if (!isActive) return;

    if (event.key === 'Tab') {
      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab - moving backward
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab - moving forward
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      // Let parent handle escape
      return false;
    }
  }, [isActive, getFocusableElements]);

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isActive, handleKeyDown]);

  return {
    handleKeyDown,
    firstFocusableRef,
    lastFocusableRef,
  };
};

// Hook for keyboard navigation patterns
export const useKeyboardNavigation = () => {
  const handleListNavigation = useCallback((
    event: React.KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void
  ) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        onIndexChange(currentIndex < items.length - 1 ? currentIndex + 1 : 0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        onIndexChange(currentIndex > 0 ? currentIndex - 1 : items.length - 1);
        break;
      case 'Home':
        event.preventDefault();
        onIndexChange(0);
        break;
      case 'End':
        event.preventDefault();
        onIndexChange(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        items[currentIndex]?.click();
        break;
    }
  }, []);

  const handleGridNavigation = useCallback((
    event: React.KeyboardEvent,
    gridItems: HTMLElement[][],
    currentRow: number,
    currentCol: number,
    onPositionChange: (row: number, col: number) => void
  ) => {
    const maxRow = gridItems.length - 1;
    const maxCol = gridItems[currentRow]?.length - 1 || 0;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        onPositionChange(currentRow < maxRow ? currentRow + 1 : 0, currentCol);
        break;
      case 'ArrowUp':
        event.preventDefault();
        onPositionChange(currentRow > 0 ? currentRow - 1 : maxRow, currentCol);
        break;
      case 'ArrowRight':
        event.preventDefault();
        onPositionChange(currentRow, currentCol < maxCol ? currentCol + 1 : 0);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onPositionChange(currentRow, currentCol > 0 ? currentCol - 1 : maxCol);
        break;
      case 'Home':
        event.preventDefault();
        onPositionChange(0, 0);
        break;
      case 'End':
        event.preventDefault();
        onPositionChange(maxRow, gridItems[maxRow]?.length - 1 || 0);
        break;
    }
  }, []);

  return {
    handleListNavigation,
    handleGridNavigation,
  };
};

// Hook for color contrast validation
export const useColorContrast = () => {
  const calculateLuminance = useCallback((color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }, []);

  const calculateContrastRatio = useCallback((color1: string, color2: string): number => {
    const lum1 = calculateLuminance(color1);
    const lum2 = calculateLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }, [calculateLuminance]);

  const checkContrast = useCallback((foreground: string, background: string) => {
    const ratio = calculateContrastRatio(foreground, background);
    return {
      ratio,
      passesAA: ratio >= 4.5,
      passesAAA: ratio >= 7,
      passesAALarge: ratio >= 3,
    };
  }, [calculateContrastRatio]);

  return {
    checkContrast,
    calculateContrastRatio,
    calculateLuminance,
  };
};

// Hook for managing skip links
export const useSkipLinks = () => {
  const skipLinksRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!skipLinksRef.current) {
      const skipLinksContainer = document.createElement('div');
      skipLinksContainer.id = 'skip-links';
      skipLinksContainer.style.position = 'absolute';
      skipLinksContainer.style.top = '-40px';
      skipLinksContainer.style.left = '6px';
      skipLinksContainer.style.background = '#000';
      skipLinksContainer.style.color = '#fff';
      skipLinksContainer.style.padding = '8px';
      skipLinksContainer.style.zIndex = '1000';
      skipLinksContainer.style.textDecoration = 'none';
      skipLinksContainer.style.borderRadius = '4px';

      // Show on focus
      skipLinksContainer.addEventListener('focus', () => {
        skipLinksContainer.style.top = '6px';
      });
      skipLinksContainer.addEventListener('blur', () => {
        skipLinksContainer.style.top = '-40px';
      });

      document.body.insertBefore(skipLinksContainer, document.body.firstChild);
      skipLinksRef.current = skipLinksContainer;
    }
  }, []);

  const addSkipLink = useCallback((text: string, targetId: string) => {
    if (!skipLinksRef.current) return;

    const link = document.createElement('a');
    link.href = `#${targetId}`;
    link.textContent = text;
    link.style.display = 'block';
    link.style.color = '#fff';
    link.style.textDecoration = 'underline';
    link.style.marginBottom = '4px';

    skipLinksRef.current.appendChild(link);
  }, []);

  return { addSkipLink };
};

// Main accessibility hook that combines all features
export const useAccessibility = () => {
  const preferences = useAccessibilityPreferences();
  const { announce } = useAriaLiveRegion();
  const { checkContrast } = useColorContrast();
  const { addSkipLink } = useSkipLinks();
  const { handleListNavigation, handleGridNavigation } = useKeyboardNavigation();

  return {
    preferences,
    announce,
    checkContrast,
    addSkipLink,
    handleListNavigation,
    handleGridNavigation,
    useFocusTrap,
  };
};
