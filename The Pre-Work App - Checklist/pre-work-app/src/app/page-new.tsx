"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ChecklistContainer from '../components/Checklist/ChecklistContainer';
import BackendStatus from '../components/Backend/BackendStatus';
import { pageVariants, pageTransition, containerVariants, itemVariants } from '../components/Animation/AnimationProvider';

export default function DashboardPage() {
  // Clear console on page load in development
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.clear();
      console.log('🏠 Pre-Work App - Dashboard loaded');
    }
  }, []);

  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={pageTransition}
    >
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="flex flex-col md:flex-row md:items-center md:justify-between"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div>
              <motion.h1 
                className="text-3xl md:text-4xl font-bold mb-2"
                variants={itemVariants}
              >
                Pre-Work Dashboard
              </motion.h1>
              <motion.p 
                className="text-blue-100 text-lg"
                variants={itemVariants}
              >
                Manage your cleaning and maintenance checklists
              </motion.p>
            </div>
            <motion.div 
              className="mt-4 md:mt-0 flex space-x-4"
              variants={itemVariants}
            >
              <Link href="/templates" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Browse Templates
              </Link>
              <Link href="/settings" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Settings
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🧹</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Cleaning Checklist</h3>
                <p className="text-gray-600">Start a new cleaning pre-work checklist</p>
              </div>
            </div>
            <Link href="/checklist?templateId=cleaning-maintenance" className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Start Cleaning
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔧</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Maintenance Check</h3>
                <p className="text-gray-600">Equipment and facility maintenance</p>
              </div>
            </div>
            <Link href="/checklist?templateId=equipment-maintenance" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Start Maintenance
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎪</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Event Setup</h3>
                <p className="text-gray-600">Event preparation and coordination</p>
              </div>
            </div>
            <Link href="/checklist?templateId=event-setup" className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Start Event
            </Link>
          </motion.div>
        </motion.div>

        {/* Backend Integration Status */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <BackendStatus />
        </motion.div>
        
        {/* Main Checklist Application */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Current Checklist
            </h2>
            <p className="text-gray-600 mb-6">
              Continue working on your active checklist or start a new one from a template.
            </p>
            <ChecklistContainer />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Cleaning checklist completed</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm">📋</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New template created</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-yellow-600 text-sm">⚠️</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Maintenance reminder</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
