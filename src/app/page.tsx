"use client";

import React from 'react';
import Link from 'next/link';
import ChecklistContainer from '../components/Checklist/ChecklistContainer';
import BackendStatus from '../components/Backend/BackendStatus';
import { AIDashboard } from '../components/AI';
import { 
  IntegrationAnalyticsDashboard,
  WorkflowAutomation,
  RealTimeSync
} from '../components/Integrations';

export default function DashboardPage() {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.clear();
      console.log('🏠 Pre-Work App - Dashboard loaded (Simple Mode)');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Pre-Work Dashboard
              </h1>
              <p className="text-blue-100 text-lg">
                Streamline your cleaning and maintenance projects
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <Link 
                href="/templates" 
                className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm border border-white/20"
              >
                Browse Templates
              </Link>
              <Link 
                href="/settings?tab=integrations" 
                className="bg-blue-500/20 text-white hover:bg-blue-500/30 backdrop-blur-sm px-6 py-2 rounded-lg font-medium transition-all duration-200 border border-white/20"
              >
                Integrations
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Dashboard - Full Width */}
        <div className="mb-8">
          <AIDashboard
            workspaceId="default-workspace"
            userId="default-user"
            checklistId="current-checklist"
            tasks={[]}
            currentProgress={{
              percentage: 0,
              completedTasks: 0,
              totalTasks: 0,
              velocity: 0,
              timeSpent: 0
            }}
          />
        </div>

        {/* Integration Analytics Dashboard - Full Width */}
        <div className="mb-8">
          <IntegrationAnalyticsDashboard workspaceId="default-workspace" />
        </div>

        {/* Integration Features - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <WorkflowAutomation workspaceId="default-workspace" userId="default-user" />
          <RealTimeSync workspaceId="default-workspace" connections={[]} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checklist Container - Takes up 2/3 of the space */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <ChecklistContainer />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Templates Available</span>
                  <span className="font-semibold text-blue-600">200+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Integrations</span>
                  <span className="font-semibold text-green-600">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">AWS Sync</span>
                  <span className="font-semibold text-green-600">Connected</span>
                </div>
              </div>
            </div>

            {/* Backend Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <BackendStatus />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  href="/templates" 
                  className="block w-full bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 hover:text-blue-800 px-4 py-3 rounded-lg transition-all duration-200 text-center font-medium shadow-sm border border-blue-200"
                >
                  Browse Templates
                </Link>
                <Link 
                  href="/settings?tab=integrations" 
                  className="block w-full bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 hover:text-green-800 px-4 py-3 rounded-lg transition-all duration-200 text-center font-medium shadow-sm border border-green-200"
                >
                  Manage Integrations
                </Link>
                <button className="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 hover:text-gray-800 px-4 py-3 rounded-lg transition-all duration-200 font-medium shadow-sm border border-gray-200">
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
