// Workflow and approval system

import { ApprovalWorkflow, ApprovalStep, SubmissionStatus } from '../../types/media';
import { UserRole } from '../../types/user';

export class WorkflowEngine {
  static createApprovalWorkflow(
    submissionId: string,
    submitterRole: UserRole,
    organizationId?: string
  ): ApprovalWorkflow {
    const steps = this.getApprovalSteps(submitterRole);
    
    return {
      id: crypto.randomUUID(),
      submissionId,
      steps,
      currentStep: 0,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private static getApprovalSteps(submitterRole: UserRole): ApprovalStep[] {
    const steps: ApprovalStep[] = [];
    
    switch (submitterRole) {
      case 'user':
        // User submissions need manager approval
        steps.push({
          id: crypto.randomUUID(),
          order: 1,
          approverId: '', // Will be assigned based on team structure
          approverRole: 'manager',
          status: 'pending'
        });
        break;
        
      case 'manager':
        // Manager submissions need supervisor approval for high-value items
        steps.push({
          id: crypto.randomUUID(),
          order: 1,
          approverId: '',
          approverRole: 'supervisor',
          status: 'pending'
        });
        break;
        
      default:
        // Administrators and supervisors auto-approve
        break;
    }
    
    return steps;
  }

  static async processApproval(
    workflowId: string,
    approverId: string,
    decision: 'approved' | 'rejected',
    notes?: string
  ): Promise<{ status: SubmissionStatus; nextStep?: ApprovalStep }> {
    // Implementation would update the workflow in database
    // For now, return simplified response
    
    if (decision === 'rejected') {
      return { status: 'rejected' };
    }
    
    return { status: 'approved' };
  }

  static calculateEscalation(step: ApprovalStep): Date | null {
    if (!step.deadline) return null;
    
    const now = new Date();
    const deadline = new Date(step.deadline);
    
    // Escalate 24 hours before deadline
    const escalationTime = new Date(deadline.getTime() - (24 * 60 * 60 * 1000));
    
    return now > escalationTime ? now : escalationTime;
  }

  static getRequiredApprovers(submissionType: string, value?: number): UserRole[] {
    const approvers: UserRole[] = [];
    
    // Business rules for approval requirements
    if (value && value > 10000) {
      approvers.push('administrator');
    } else if (value && value > 1000) {
      approvers.push('supervisor');
    } else {
      approvers.push('manager');
    }
    
    return approvers;
  }

  static canUserApprove(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      user: 1,
      manager: 2,
      supervisor: 3,
      administrator: 4,
      auditor: 0
    };
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  static getWorkflowStatus(steps: ApprovalStep[]): SubmissionStatus {
    if (steps.length === 0) return 'approved';
    
    const hasRejected = steps.some(step => step.status === 'rejected');
    if (hasRejected) return 'rejected';
    
    const allApproved = steps.every(step => 
      step.status === 'approved' || step.status === 'skipped'
    );
    if (allApproved) return 'approved';
    
    const hasPending = steps.some(step => step.status === 'pending');
    if (hasPending) return 'under_review';
    
    return 'submitted';
  }
}
