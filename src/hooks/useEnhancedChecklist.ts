/**
 * Enhanced Checklist Hook
 * Combines local storage, backend integration, progress tracking, and real-time updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PreWorkChecklist, ChecklistItem, ChecklistSection } from '../types';
import { storageService } from '../lib/storage/localStorage';
import { progressTracker, ProgressStats, Milestone } from '../lib/services/progressTracking';
import { backendService } from '../lib/services/backendService';

interface UseChecklistOptions {
  autoSave?: boolean;
  autoSaveInterval?: number; // in milliseconds
  trackProgress?: boolean;
  enableMilestones?: boolean;
  onMilestoneReached?: (milestone: Milestone) => void;
  onProgressUpdate?: (stats: ProgressStats) => void;
  onError?: (error: Error) => void;
}

interface UseChecklistReturn {
  checklist: PreWorkChecklist | null;
  progress: ProgressStats | null;
  milestones: Milestone[];
  isLoading: boolean;
  error: string | null;
  actions: {
    loadChecklist: (checklistId: string) => Promise<boolean>;
    saveChecklist: () => Promise<boolean>;
    toggleItem: (sectionId: string, itemId: string) => void;
    addItem: (sectionId: string, item: Omit<ChecklistItem, 'id'>) => void;
    updateItem: (sectionId: string, itemId: string, updates: Partial<ChecklistItem>) => void;
    deleteItem: (sectionId: string, itemId: string) => void;
    addSection: (section: Omit<ChecklistSection, 'id'>) => void;
    updateSection: (sectionId: string, updates: Partial<ChecklistSection>) => void;
    deleteSection: (sectionId: string) => void;
    resetChecklist: () => void;
    startSession: () => void;
    endSession: () => void;
    exportData: () => string;
    importData: (jsonData: string) => boolean;
  };
}

export function useEnhancedChecklist(
  initialChecklist?: PreWorkChecklist,
  options: UseChecklistOptions = {}
): UseChecklistReturn {
  const {
    autoSave = true,
    autoSaveInterval = 30000, // 30 seconds
    trackProgress = true,
    enableMilestones = true,
    onMilestoneReached,
    onProgressUpdate,
    onError
  } = options;

  // State
  const [checklist, setChecklist] = useState<PreWorkChecklist | null>(initialChecklist || null);
  const [progress, setProgress] = useState<ProgressStats | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const autoSaveIntervalRef = useRef<number | null>(null);
  const lastSaveRef = useRef<Date>(new Date());

  // Generate unique ID
  const generateId = useCallback(() => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Auto-save functionality
  const performAutoSave = useCallback(async () => {
    if (!checklist || !autoSave) return false;

    try {
      const success = storageService.saveChecklist(checklist.id, checklist);
      if (success) {
        lastSaveRef.current = new Date();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Auto-save failed:', err);
      onError?.(err as Error);
      return false;
    }
  }, [checklist, autoSave, onError]);

  // Setup auto-save interval
  useEffect(() => {
    if (autoSave && checklist) {
      const saveFunction = async () => {
        if (!checklist || !autoSave) return false;
        
        try {
          const success = storageService.saveChecklist(checklist.id, checklist);
          if (success) {
            lastSaveRef.current = new Date();
            return true;
          }
          return false;
        } catch (err) {
          console.error('Auto-save failed:', err);
          onError?.(err as Error);
          return false;
        }
      };

      autoSaveIntervalRef.current = window.setInterval(saveFunction, autoSaveInterval);
      return () => {
        if (autoSaveIntervalRef.current) {
          window.clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [autoSave, checklist?.id, autoSaveInterval, onError]);

  // Update progress when checklist changes
  useEffect(() => {
    if (checklist && trackProgress) {
      try {
        const newProgress = progressTracker.calculateProgress(checklist);
        setProgress(newProgress);

        // Check milestones
        if (enableMilestones) {
          const reachedMilestones = progressTracker.checkMilestones(newProgress.percentage);
          if (reachedMilestones.length > 0) {
            setMilestones(progressTracker.getMilestones());
            reachedMilestones.forEach(milestone => {
              onMilestoneReached?.(milestone);
            });
          }
        }

        // Notify progress update
        onProgressUpdate?.(newProgress);
      } catch (err) {
        console.error('Error updating progress:', err);
        onError?.(err as Error);
      }
    }
  }, [checklist?.id, checklist?.sections?.length, trackProgress, enableMilestones]);

  // Actions
  const loadChecklist = useCallback(async (checklistId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedChecklist = storageService.getChecklist(checklistId);
      if (loadedChecklist) {
        setChecklist(loadedChecklist);
        if (trackProgress) {
          progressTracker.startSession();
        }
        return true;
      } else {
        setError('Checklist not found');
        return false;
      }
    } catch (err) {
      const errorMessage = 'Failed to load checklist';
      setError(errorMessage);
      onError?.(err as Error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [trackProgress, onError]);

  const saveChecklist = useCallback(async (): Promise<boolean> => {
    if (!checklist) return false;

    setIsLoading(true);
    setError(null);

    try {
      // Save to local storage first (for offline functionality)
      const localSuccess = storageService.saveChecklist(checklist.id, checklist);
      
      // Try to save to backend
      const backendResult = await backendService.saveChecklist(checklist, 'demo-user');
      
      if (localSuccess) {
        lastSaveRef.current = new Date();
        
        // Log backend result but don't fail if backend is unavailable
        if (!backendResult.success) {
          console.warn('Backend save failed, but local save succeeded:', backendResult.error);
        }
        
        return true;
      } else {
        setError('Failed to save checklist locally');
        return false;
      }
    } catch (err) {
      const errorMessage = 'Save operation failed';
      setError(errorMessage);
      onError?.(err as Error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checklist, onError]);

  const toggleItem = useCallback((sectionId: string, itemId: string) => {
    if (!checklist) return;

    setChecklist(prevChecklist => {
      if (!prevChecklist) return null;

      const updatedSections = prevChecklist.sections.map(section => {
        if (section.id === sectionId) {
          const updatedItems = section.items.map(item => {
            if (item.id === itemId) {
              const isCompleted = !item.isCompleted;
              return {
                ...item,
                isCompleted,
                completedAt: isCompleted ? new Date() : undefined
              };
            }
            return item;
          });

          return {
            ...section,
            items: updatedItems,
            completedCount: updatedItems.filter(item => item.isCompleted).length
          };
        }
        return section;
      });

      const updated = {
        ...prevChecklist,
        sections: updatedSections,
        lastModified: new Date()
      };

      return updated;
    });
  }, [checklist]);

  const addItem = useCallback((sectionId: string, item: Omit<ChecklistItem, 'id'>) => {
    if (!checklist) return;

    const newItem: ChecklistItem = {
      ...item,
      id: generateId(),
      isCompleted: false
    };

    setChecklist(prevChecklist => {
      if (!prevChecklist) return null;

      const updatedSections = prevChecklist.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: [...section.items, newItem],
            totalCount: section.items.length + 1
          };
        }
        return section;
      });

      return {
        ...prevChecklist,
        sections: updatedSections,
        lastModified: new Date()
      };
    });
  }, [checklist, generateId]);

  const updateItem = useCallback((sectionId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    if (!checklist) return;

    setChecklist(prevChecklist => {
      if (!prevChecklist) return null;

      const updatedSections = prevChecklist.sections.map(section => {
        if (section.id === sectionId) {
          const updatedItems = section.items.map(item => {
            if (item.id === itemId) {
              return { ...item, ...updates };
            }
            return item;
          });

          return {
            ...section,
            items: updatedItems,
            completedCount: updatedItems.filter(item => item.isCompleted).length
          };
        }
        return section;
      });

      return {
        ...prevChecklist,
        sections: updatedSections,
        lastModified: new Date()
      };
    });
  }, [checklist]);

  const deleteItem = useCallback((sectionId: string, itemId: string) => {
    if (!checklist) return;

    setChecklist(prevChecklist => {
      if (!prevChecklist) return null;

      const updatedSections = prevChecklist.sections.map(section => {
        if (section.id === sectionId) {
          const updatedItems = section.items.filter(item => item.id !== itemId);
          return {
            ...section,
            items: updatedItems,
            totalCount: updatedItems.length,
            completedCount: updatedItems.filter(item => item.isCompleted).length
          };
        }
        return section;
      });

      return {
        ...prevChecklist,
        sections: updatedSections,
        lastModified: new Date()
      };
    });
  }, [checklist]);

  const addSection = useCallback((section: Omit<ChecklistSection, 'id'>) => {
    if (!checklist) return;

    const newSection: ChecklistSection = {
      ...section,
      id: generateId(),
      items: section.items || [],
      totalCount: section.items?.length || 0,
      completedCount: 0,
      isCollapsed: false
    };

    setChecklist(prevChecklist => {
      if (!prevChecklist) return null;

      return {
        ...prevChecklist,
        sections: [...prevChecklist.sections, newSection],
        lastModified: new Date()
      };
    });
  }, [checklist, generateId]);

  const updateSection = useCallback((sectionId: string, updates: Partial<ChecklistSection>) => {
    if (!checklist) return;

    setChecklist(prevChecklist => {
      if (!prevChecklist) return null;

      const updatedSections = prevChecklist.sections.map(section => {
        if (section.id === sectionId) {
          return { ...section, ...updates };
        }
        return section;
      });

      return {
        ...prevChecklist,
        sections: updatedSections,
        lastModified: new Date()
      };
    });
  }, [checklist]);

  const deleteSection = useCallback((sectionId: string) => {
    if (!checklist) return;

    setChecklist(prevChecklist => {
      if (!prevChecklist) return null;

      const updatedSections = prevChecklist.sections.filter(section => section.id !== sectionId);

      return {
        ...prevChecklist,
        sections: updatedSections,
        lastModified: new Date()
      };
    });
  }, [checklist]);

  const resetChecklist = useCallback(() => {
    if (!checklist) return;

    setChecklist(prevChecklist => {
      if (!prevChecklist) return null;

      const resetSections = prevChecklist.sections.map(section => ({
        ...section,
        items: section.items.map(item => ({
          ...item,
          isCompleted: false,
          completedAt: undefined
        })),
        completedCount: 0
      }));

      progressTracker.resetMilestones();
      setMilestones([]);

      return {
        ...prevChecklist,
        sections: resetSections,
        progress: 0,
        isCompleted: false,
        lastModified: new Date()
      };
    });
  }, [checklist]);

  const startSession = useCallback(() => {
    if (trackProgress) {
      progressTracker.startSession();
    }
  }, [trackProgress]);

  const endSession = useCallback(() => {
    if (trackProgress) {
      const sessionData = progressTracker.endSession();
      if (sessionData && checklist) {
        storageService.addRecentActivity({
          id: generateId(),
          action: 'session_completed',
          timestamp: new Date(),
          details: {
            checklistId: checklist.id,
            duration: sessionData.totalDuration,
            progress: progress?.percentage || 0
          }
        });
      }
    }
  }, [trackProgress, checklist, progress, generateId]);

  const exportData = useCallback(() => {
    if (!checklist) return '';

    const exportData = {
      checklist,
      progress,
      milestones,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    return JSON.stringify(exportData, null, 2);
  }, [checklist, progress, milestones]);

  const importData = useCallback((jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.checklist) {
        setChecklist(data.checklist);
        if (data.progress) setProgress(data.progress);
        if (data.milestones) setMilestones(data.milestones);
        return true;
      }
      return false;
    } catch (err) {
      onError?.(err as Error);
      return false;
    }
  }, [onError]);

  return {
    checklist,
    progress,
    milestones,
    isLoading,
    error,
    actions: {
      loadChecklist,
      saveChecklist,
      toggleItem,
      addItem,
      updateItem,
      deleteItem,
      addSection,
      updateSection,
      deleteSection,
      resetChecklist,
      startSession,
      endSession,
      exportData,
      importData
    }
  };
}

export default useEnhancedChecklist;
