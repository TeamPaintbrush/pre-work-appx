/**
 * Backend Service for Checklist Integration
 * Connects frontend to DynamoDB without S3 dependencies
 */

interface ChecklistData {
  title: string;
  sections: any[];
  userId?: string;
}

interface SaveChecklistResponse {
  success: boolean;
  checklistId?: string;
  error?: string;
}

interface LoadChecklistsResponse {
  success: boolean;
  checklists?: any[];
  error?: string;
}

export class BackendService {
  private static instance: BackendService;

  static getInstance(): BackendService {
    if (!BackendService.instance) {
      BackendService.instance = new BackendService();
    }
    return BackendService.instance;
  }

  /**
   * Save checklist to DynamoDB
   */
  async saveChecklist(checklistData: ChecklistData, userId: string = 'demo-user'): Promise<SaveChecklistResponse> {
    try {
      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          checklistData,
          title: checklistData.title || 'Untitled Checklist'
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save checklist');
      }

      return result;
    } catch (error) {
      console.error('Backend save error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Load user's checklists from DynamoDB
   */
  async loadChecklists(userId: string = 'demo-user'): Promise<LoadChecklistsResponse> {
    try {
      const response = await fetch(`/api/checklists?userId=${encodeURIComponent(userId)}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load checklists');
      }

      return result;
    } catch (error) {
      console.error('Backend load error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test backend connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('/api/checklists?userId=test-connection');
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const backendService = BackendService.getInstance();
