/**
 * Progress Tracking Service
 * Handles checklist progress calculations, analytics, and reporting
 */

import { PreWorkChecklist, ChecklistItem, ChecklistSection } from '../../types';

export interface ProgressStats {
  totalItems: number;
  completedItems: number;
  percentage: number;
  remainingItems: number;
  estimatedTimeRemaining: number; // in minutes
  completionRate: number; // items per hour
  sectionsCompleted: number;
  totalSections: number;
}

export interface SectionProgress {
  sectionId: string;
  sectionTitle: string;
  totalItems: number;
  completedItems: number;
  percentage: number;
  isCompleted: boolean;
  estimatedTime: number;
}

export interface TimeTracking {
  startTime?: Date;
  endTime?: Date;
  totalDuration: number; // in minutes
  averageTimePerItem: number; // in minutes
  sessionTime: number; // current session in minutes
}

export interface Milestone {
  id: string;
  percentage: number;
  title: string;
  description: string;
  isReached: boolean;
  reachedAt?: Date;
}

class ProgressTrackingService {
  private sessionStartTime: Date | null = null;
  private milestones: Milestone[] = [
    {
      id: 'quarter',
      percentage: 25,
      title: '25% Complete',
      description: 'Great start! You\'re making good progress.',
      isReached: false
    },
    {
      id: 'half',
      percentage: 50,
      title: 'Halfway There',
      description: 'You\'re halfway through your checklist!',
      isReached: false
    },
    {
      id: 'three_quarters',
      percentage: 75,
      title: '75% Complete',
      description: 'Almost done! Keep up the great work.',
      isReached: false
    },
    {
      id: 'complete',
      percentage: 100,
      title: 'Checklist Complete!',
      description: 'Congratulations! You\'ve completed all tasks.',
      isReached: false
    }
  ];

  /**
   * Calculate overall progress statistics
   */
  calculateProgress(checklist: PreWorkChecklist): ProgressStats {
    let totalItems = 0;
    let completedItems = 0;
    let totalEstimatedTime = 0;
    let sectionsCompleted = 0;

    checklist.sections.forEach(section => {
      totalItems += section.items.length;
      const sectionCompletedItems = section.items.filter(item => item.isCompleted).length;
      completedItems += sectionCompletedItems;
      
      // Estimate time based on item difficulty and type
      section.items.forEach(item => {
        totalEstimatedTime += this.estimateItemTime(item);
      });

      // Check if section is completed
      if (sectionCompletedItems === section.items.length && section.items.length > 0) {
        sectionsCompleted++;
      }
    });

    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const remainingItems = totalItems - completedItems;
    
    // Calculate completion rate (items per hour)
    const sessionTime = this.getSessionTime();
    const completionRate = sessionTime > 0 ? (completedItems / sessionTime) * 60 : 0;
    
    // Estimate remaining time
    const estimatedTimeRemaining = completionRate > 0 ? 
      (remainingItems / completionRate) * 60 : 
      remainingItems * 5; // Default 5 minutes per item

    return {
      totalItems,
      completedItems,
      percentage,
      remainingItems,
      estimatedTimeRemaining: Math.round(estimatedTimeRemaining),
      completionRate: Math.round(completionRate * 100) / 100,
      sectionsCompleted,
      totalSections: checklist.sections.length
    };
  }

  /**
   * Calculate progress for each section
   */
  calculateSectionProgress(checklist: PreWorkChecklist): SectionProgress[] {
    return checklist.sections.map(section => {
      const completedItems = section.items.filter(item => item.isCompleted).length;
      const percentage = section.items.length > 0 ? 
        Math.round((completedItems / section.items.length) * 100) : 0;
      
      const estimatedTime = section.items.reduce((total, item) => 
        total + this.estimateItemTime(item), 0);

      return {
        sectionId: section.id,
        sectionTitle: section.title,
        totalItems: section.items.length,
        completedItems,
        percentage,
        isCompleted: percentage === 100,
        estimatedTime: Math.round(estimatedTime)
      };
    });
  }

  /**
   * Estimate time required for a checklist item
   */
  private estimateItemTime(item: ChecklistItem): number {
    let baseTime = 5; // 5 minutes default

    // Adjust based on priority
    if (item.priority === 'high') baseTime *= 1.5;
    if (item.priority === 'low') baseTime *= 0.7;

    // Adjust based on description length (complexity indicator)
    if (item.description && item.description.length > 100) baseTime *= 1.3;

    // Adjust based on tags
    if (item.tags) {
      if (item.tags.includes('complex')) baseTime *= 2;
      if (item.tags.includes('quick')) baseTime *= 0.5;
      if (item.tags.includes('review')) baseTime *= 0.3;
    }

    return Math.round(baseTime);
  }

  /**
   * Track session time
   */
  startSession(): void {
    this.sessionStartTime = new Date();
  }

  endSession(): TimeTracking | null {
    if (!this.sessionStartTime) return null;

    const endTime = new Date();
    const totalDuration = (endTime.getTime() - this.sessionStartTime.getTime()) / (1000 * 60); // minutes

    const tracking: TimeTracking = {
      startTime: this.sessionStartTime,
      endTime,
      totalDuration: Math.round(totalDuration),
      averageTimePerItem: 0, // Will be calculated based on completed items
      sessionTime: Math.round(totalDuration)
    };

    this.sessionStartTime = null;
    return tracking;
  }

  getSessionTime(): number {
    if (!this.sessionStartTime) return 0;
    const now = new Date();
    return (now.getTime() - this.sessionStartTime.getTime()) / (1000 * 60); // minutes
  }

  /**
   * Check and update milestones
   */
  checkMilestones(percentage: number): Milestone[] {
    const reachedMilestones: Milestone[] = [];

    this.milestones.forEach(milestone => {
      if (percentage >= milestone.percentage && !milestone.isReached) {
        milestone.isReached = true;
        milestone.reachedAt = new Date();
        reachedMilestones.push(milestone);
      }
    });

    return reachedMilestones;
  }

  getMilestones(): Milestone[] {
    return [...this.milestones];
  }

  resetMilestones(): void {
    this.milestones.forEach(milestone => {
      milestone.isReached = false;
      milestone.reachedAt = undefined;
    });
  }

  /**
   * Generate progress report
   */
  generateProgressReport(checklist: PreWorkChecklist): {
    overview: ProgressStats;
    sections: SectionProgress[];
    milestones: Milestone[];
    timeTracking: {
      sessionTime: number;
      estimatedCompletion: string;
    };
    insights: string[];
  } {
    const overview = this.calculateProgress(checklist);
    const sections = this.calculateSectionProgress(checklist);
    const milestones = this.getMilestones();
    const sessionTime = this.getSessionTime();

    // Generate insights
    const insights: string[] = [];
    
    if (overview.percentage === 0) {
      insights.push("Ready to start! Break down tasks into smaller steps for better progress tracking.");
    } else if (overview.percentage < 25) {
      insights.push("You're just getting started. Focus on completing one section at a time.");
    } else if (overview.percentage < 50) {
      insights.push("Good momentum! You're making steady progress through your checklist.");
    } else if (overview.percentage < 75) {
      insights.push("Great job! You're over halfway done. Keep up the excellent work.");
    } else if (overview.percentage < 100) {
      insights.push("Almost there! You're in the final stretch. Stay focused to finish strong.");
    } else {
      insights.push("Congratulations! You've completed your checklist successfully.");
    }

    // Add completion rate insights
    if (overview.completionRate > 10) {
      insights.push("You're working at an excellent pace!");
    } else if (overview.completionRate > 5) {
      insights.push("Your completion rate is good and steady.");
    } else if (overview.completionRate > 0) {
      insights.push("Take your time - quality is more important than speed.");
    }

    // Estimate completion time
    const estimatedCompletion = overview.estimatedTimeRemaining > 0 ? 
      this.formatTime(overview.estimatedTimeRemaining) : 
      "Complete!";

    return {
      overview,
      sections,
      milestones,
      timeTracking: {
        sessionTime: Math.round(sessionTime),
        estimatedCompletion
      },
      insights
    };
  }

  /**
   * Format time in a human-readable way
   */
  private formatTime(minutes: number): string {
    if (minutes < 1) return "Less than a minute";
    if (minutes < 60) return `${Math.round(minutes)} minutes`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    
    if (hours === 1) return `1 hour${remainingMinutes > 0 ? ` ${remainingMinutes} minutes` : ''}`;
    return `${hours} hours${remainingMinutes > 0 ? ` ${remainingMinutes} minutes` : ''}`;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(checklist: PreWorkChecklist): {
    efficiency: number; // percentage of estimated vs actual time
    accuracy: number; // percentage of items completed correctly
    consistency: number; // variance in completion times
    focus: number; // session time vs breaks
  } {
    // This would be enhanced with real-time tracking data
    const stats = this.calculateProgress(checklist);
    
    return {
      efficiency: Math.min(100, Math.max(0, 100 - (this.getSessionTime() / stats.estimatedTimeRemaining) * 100)),
      accuracy: 95, // Would be calculated based on review/correction data
      consistency: 85, // Would be calculated based on time variance
      focus: Math.min(100, (this.getSessionTime() / (this.getSessionTime() + 5)) * 100) // Assuming 5 min break time
    };
  }
}

// Export singleton instance
export const progressTracker = new ProgressTrackingService();
export default progressTracker;
