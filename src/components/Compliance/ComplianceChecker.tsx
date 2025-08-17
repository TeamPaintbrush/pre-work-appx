"use client";

import React, { useMemo } from 'react';
import { PreWorkChecklist, ComplianceReport, ComplianceCheck, ComplianceCheckResult } from '../../types';

interface ComplianceCheckerProps {
  checklist: PreWorkChecklist;
  onComplianceUpdate?: (report: ComplianceReport) => void;
  autoCheck?: boolean;
  showDetails?: boolean;
}

const ComplianceChecker: React.FC<ComplianceCheckerProps> = ({
  checklist,
  onComplianceUpdate,
  autoCheck = true,
  showDetails = false
}) => {
  // Define compliance checks
  const complianceChecks: ComplianceCheck[] = useMemo(() => [
    {
      id: 'required-items',
      type: 'required_items',
      rule: 'All required checklist items must be completed',
      description: 'Ensures all mandatory tasks are finished before completion',
      severity: 'critical',
      isBlocking: true,
      checkFunction: (checklist: PreWorkChecklist) => {
        const requiredItems = checklist.sections.flatMap((section) =>
          section.items.filter((item) => item.isRequired)
        );
        const incompleteRequired = requiredItems.filter((item) => !item.isCompleted);
        
        return {
          passed: incompleteRequired.length === 0,
          message: incompleteRequired.length > 0 
            ? `${incompleteRequired.length} required items not completed`
            : 'All required items completed',
          affectedItems: incompleteRequired.map((item) => item.id)
        };
      }
    }
  ], []);

  // Generate compliance report
  const complianceReport: ComplianceReport = useMemo(() => {
    const now = new Date();
    const checkResults: ComplianceCheckResult[] = complianceChecks.map(check => {
      const result = check.checkFunction ? check.checkFunction(checklist) : { passed: true, message: 'No check function defined' };
      return {
        checkId: check.id,
        result,
        timestamp: now
      };
    });

    const failedResults = checkResults.filter(result => !result.result.passed);
    const blockers = failedResults.filter(result => {
      const check = complianceChecks.find(c => c.id === result.checkId);
      return check?.isBlocking;
    });

    const overallStatus = blockers.length > 0 ? 'non_compliant' : 'compliant';

    return {
      checklistId: checklist.id,
      checkDate: now,
      overallStatus,
      checks: checkResults,
      blockers: blockers.map(b => b.checkId),
      warnings: [],
      recommendations: []
    };
  }, [checklist, complianceChecks]);

  // Auto-update compliance when checklist changes
  React.useEffect(() => {
    if (autoCheck && onComplianceUpdate) {
      onComplianceUpdate(complianceReport);
    }
  }, [complianceReport, autoCheck, onComplianceUpdate]);

  if (!showDetails && complianceReport.overallStatus === 'compliant') {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <span className="text-sm">✅ All compliance checks passed</span>
      </div>
    );
  }

  return (
    <div className="compliance-checker space-y-4">
      <div className={`p-4 rounded-lg border ${
        complianceReport.overallStatus === 'compliant' 
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${
              complianceReport.overallStatus === 'compliant' 
                ? 'bg-green-500'
                : 'bg-red-500'
            }`} />
            <div>
              <h3 className="font-medium">
                {complianceReport.overallStatus === 'compliant' 
                  ? 'Fully Compliant'
                  : 'Non-Compliant'
                }
              </h3>
              <p className="text-sm text-gray-600">
                {complianceReport.checks.filter(c => c.result.passed).length}/{complianceReport.checks.length} checks passed
              </p>
            </div>
          </div>
          
          {complianceReport.blockers.length > 0 && (
            <div className="text-right">
              <div className="text-sm font-medium text-red-600">
                Cannot Complete
              </div>
              <div className="text-xs text-red-500">
                {complianceReport.blockers.length} blocking issue(s)
              </div>
            </div>
          )}
        </div>

        {complianceReport.blockers.length > 0 && (
          <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded">
            <div className="font-medium text-red-800 text-sm">
              Blocking Issues (Must be resolved):
            </div>
            <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
              {complianceReport.blockers.map(blockerId => {
                const result = complianceReport.checks.find(c => c.checkId === blockerId);
                return (
                  <li key={blockerId}>{result?.result.message || 'Unknown issue'}</li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceChecker;
