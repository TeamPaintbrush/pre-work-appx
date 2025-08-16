"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ChecklistContainer from '../components/Checklist/ChecklistContainer';
import BackendStatus from '../components/Backend/BackendStatus';
import { pageVariants, pageTransition, containerVariants, itemVariants } from '../components/Animation/AnimationProvider';

export default function HomePage() {
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
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              variants={itemVariants}
            >
              The Pre-Work App
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto"
              variants={itemVariants}
            >
              Streamline your cleaning and maintenance pre-work processes with comprehensive checklist management
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
              variants={itemVariants}
            >
              <motion.div 
                className="flex items-center justify-center space-x-2 text-blue-100"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>React Server Only</span>
              </motion.div>
              <motion.div 
                className="flex items-center justify-center space-x-2 text-blue-100"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>LocalStorage Persistence</span>
              </motion.div>
              <motion.div 
                className="flex items-center justify-center space-x-2 text-blue-100"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Mobile Optimized</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Pre-Work Management
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage cleaning and maintenance pre-work efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mobile Workforce Management</h3>
              <p className="text-gray-600">Advanced mobile interface with GPS tracking and offline capabilities</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-green-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assurance System</h3>
              <p className="text-gray-600">AI-powered quality scoring and photo analysis for enhanced work standards</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Resource Planning</h3>
              <p className="text-gray-600">Resource allocation, cost tracking, and capacity planning for optimal efficiency</p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-red-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Room Assessment</h3>
              <p className="text-gray-600">Systematic room-by-room evaluation and requirements tracking</p>
            </div>

            {/* Feature 5 */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-yellow-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600">Real-time progress monitoring with detailed completion metrics</p>
            </div>

            {/* Feature 6 */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-gray-600">Multi-user access, role management, and real-time team coordination</p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Professional Templates
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Choose from our extensive library of pre-built templates for every industry
            </p>
            <Link href="/templates">
              <motion.button
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Template Gallery
              </motion.button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Template Preview Cards */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🧹</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Cleaning</h3>
              <p className="text-sm text-gray-600">Professional cleaning checklists for every environment</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Safety</h3>
              <p className="text-sm text-gray-600">OSHA-compliant safety inspection templates</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Maintenance</h3>
              <p className="text-sm text-gray-600">Equipment and facility maintenance protocols</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎪</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Events</h3>
              <p className="text-sm text-gray-600">Event setup and coordination checklists</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Checklist Application */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Start Your Pre-Work Checklist
            </h2>
            <p className="text-lg text-gray-600">
              Begin with our comprehensive cleaning pre-work template
            </p>
          </div>
          
          {/* Backend Integration Status */}
          <div className="mb-8">
            <BackendStatus />
          </div>
          
          <ChecklistContainer />
        </div>
      </section>
    </motion.div>
  );
}