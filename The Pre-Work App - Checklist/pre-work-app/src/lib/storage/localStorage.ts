/**
 * Local Storage Service for Pre-Work App
 * Handles all client-side data persistence
 */

interface StorageData {
  checklists: Record<string, any>;
  userPreferences: {
    theme: 'light' | 'dark' | 'system';
    viewMode: 'list' | 'grid' | 'kanban';
    autoSave: boolean;
    notifications: boolean;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: Date;
    details: any;
  }>;
  templates: Record<string, any>;
}

class LocalStorageService {
  private prefix = 'prework_app_';

  // Storage keys
  private keys = {
    CHECKLISTS: `${this.prefix}checklists`,
    USER_PREFERENCES: `${this.prefix}user_preferences`,
    RECENT_ACTIVITY: `${this.prefix}recent_activity`,
    TEMPLATES: `${this.prefix}templates`,
    CURRENT_SESSION: `${this.prefix}current_session`,
  };

  /**
   * Get data from localStorage with error handling
   */
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Set data to localStorage with error handling
   */
  private setItem(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Checklist Management
   */
  saveChecklist(checklistId: string, checklist: any): boolean {
    const checklists = this.getItem(this.keys.CHECKLISTS, {} as Record<string, any>);
    checklists[checklistId] = {
      ...checklist,
      lastSaved: new Date().toISOString(),
    };
    
    const success = this.setItem(this.keys.CHECKLISTS, checklists);
    
    if (success) {
      this.addRecentActivity({
        id: `save_${Date.now()}`,
        action: 'checklist_saved',
        timestamp: new Date(),
        details: { checklistId, title: checklist.title }
      });
    }
    
    return success;
  }

  getChecklist(checklistId: string): any | null {
    const checklists = this.getItem(this.keys.CHECKLISTS, {} as Record<string, any>);
    return checklists[checklistId] || null;
  }

  getAllChecklists(): Record<string, any> {
    return this.getItem(this.keys.CHECKLISTS, {} as Record<string, any>);
  }

  deleteChecklist(checklistId: string): boolean {
    const checklists = this.getItem(this.keys.CHECKLISTS, {} as Record<string, any>);
    if (checklists[checklistId]) {
      delete checklists[checklistId];
      const success = this.setItem(this.keys.CHECKLISTS, checklists);
      
      if (success) {
        this.addRecentActivity({
          id: `delete_${Date.now()}`,
          action: 'checklist_deleted',
          timestamp: new Date(),
          details: { checklistId }
        });
      }
      
      return success;
    }
    return false;
  }

  /**
   * User Preferences
   */
  saveUserPreferences(preferences: Partial<StorageData['userPreferences']>): boolean {
    const current = this.getUserPreferences();
    const updated = { ...current, ...preferences };
    return this.setItem(this.keys.USER_PREFERENCES, updated);
  }

  getUserPreferences(): StorageData['userPreferences'] {
    return this.getItem(this.keys.USER_PREFERENCES, {
      theme: 'system',
      viewMode: 'list',
      autoSave: true,
      notifications: true,
    });
  }

  /**
   * Recent Activity
   */
  addRecentActivity(activity: StorageData['recentActivity'][0]): boolean {
    const activities = this.getRecentActivity();
    activities.unshift(activity);
    
    // Keep only last 50 activities
    const trimmed = activities.slice(0, 50);
    
    return this.setItem(this.keys.RECENT_ACTIVITY, trimmed);
  }

  getRecentActivity(): StorageData['recentActivity'] {
    return this.getItem(this.keys.RECENT_ACTIVITY, []);
  }

  /**
   * Templates
   */
  saveTemplate(templateId: string, template: any): boolean {
    const templates = this.getItem(this.keys.TEMPLATES, {} as Record<string, any>);
    templates[templateId] = {
      ...template,
      lastSaved: new Date().toISOString(),
    };
    return this.setItem(this.keys.TEMPLATES, templates);
  }

  getTemplate(templateId: string): any | null {
    const templates = this.getItem(this.keys.TEMPLATES, {} as Record<string, any>);
    return templates[templateId] || null;
  }

  getAllTemplates(): Record<string, any> {
    return this.getItem(this.keys.TEMPLATES, {} as Record<string, any>);
  }

  /**
   * Session Management
   */
  saveCurrentSession(sessionData: any): boolean {
    return this.setItem(this.keys.CURRENT_SESSION, {
      ...sessionData,
      timestamp: new Date().toISOString(),
    });
  }

  getCurrentSession(): any | null {
    return this.getItem(this.keys.CURRENT_SESSION, null);
  }

  clearCurrentSession(): boolean {
    try {
      localStorage.removeItem(this.keys.CURRENT_SESSION);
      return true;
    } catch (error) {
      console.error('Error clearing session:', error);
      return false;
    }
  }

  /**
   * Export/Import Functions
   */
  exportAllData(): string {
    const data = {
      checklists: this.getAllChecklists(),
      userPreferences: this.getUserPreferences(),
      recentActivity: this.getRecentActivity(),
      templates: this.getAllTemplates(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.checklists) {
        this.setItem(this.keys.CHECKLISTS, data.checklists);
      }
      
      if (data.userPreferences) {
        this.setItem(this.keys.USER_PREFERENCES, data.userPreferences);
      }
      
      if (data.templates) {
        this.setItem(this.keys.TEMPLATES, data.templates);
      }
      
      this.addRecentActivity({
        id: `import_${Date.now()}`,
        action: 'data_imported',
        timestamp: new Date(),
        details: { importedAt: new Date().toISOString() }
      });
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * Utility Functions
   */
  getStorageUsage(): { used: number; available: number; percentage: number } {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith(this.prefix)) {
          totalSize += localStorage.getItem(key)?.length || 0;
        }
      }
      
      // Rough estimate of available localStorage (5MB typical)
      const availableSize = 5 * 1024 * 1024; // 5MB in bytes
      
      return {
        used: totalSize,
        available: availableSize,
        percentage: Math.round((totalSize / availableSize) * 100)
      };
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  clearAllData(): boolean {
    try {
      Object.values(this.keys).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  /**
   * Auto-save functionality
   */
  enableAutoSave(callback: () => void, intervalMs: number = 30000): number {
    return window.setInterval(callback, intervalMs);
  }

  disableAutoSave(intervalId: number): void {
    window.clearInterval(intervalId);
  }
}

// Export singleton instance
export const storageService = new LocalStorageService();
export default storageService;
