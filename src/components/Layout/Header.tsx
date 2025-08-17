"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileDetection, useSwipeGesture, useLongPress, useVibration } from '../../hooks/useMobile';

interface HeaderProps {
  title?: string;
  showProfile?: boolean;
  onProfileClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "Pre-Work Checklist", 
  showProfile = true, 
  onProfileClick 
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isTouch, isMobile, orientation } = useMobileDetection();
  const { vibrate } = useVibration();
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  // Mobile menu toggle with haptic feedback
  const toggleMobileMenu = () => {
    if (isTouch) {
      vibrate(50); // Short vibration on touch devices
    }
    setShowMobileMenu(!showMobileMenu);
  };

  // Long press on logo for hidden features (mobile)
  const longPressHandlers = useLongPress(() => {
    if (isMobile) {
      vibrate([100, 50, 100]); // Pattern vibration
      console.log('Easter egg activated!');
    }
  }, 1000);

  // Swipe right to close mobile menu
  useSwipeGesture(mobileMenuRef as React.RefObject<HTMLElement>, (swipe) => {
    if (swipe.direction === 'right' && showMobileMenu) {
      setShowMobileMenu(false);
    }
  });

  return (
    <>
      <motion.header 
        className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 ${
          isMobile ? 'px-4 py-3' : 'px-6 py-4'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo/Title */}
            <motion.div 
              className="flex items-center space-x-3"
              whileTap={{ scale: 0.98 }}
              {...(isMobile ? longPressHandlers : {})}
            >
              <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-blue-600 rounded-lg flex items-center justify-center`}>
                <svg className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  {isMobile ? 'Pre-Work' : title}
                </h1>
                {!isMobile && (
                  <p className="text-sm text-gray-600">Your checklist companion</p>
                )}
              </div>
            </motion.div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer font-medium hover:underline"
              >
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Dashboard
                </motion.span>
              </Link>
              <Link 
                href="/templates"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer font-medium"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Templates
                </motion.div>
              </Link>
              <Link 
                href="/profile-demo"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors bg-blue-50 text-blue-700 cursor-pointer font-medium"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Demo
                </motion.div>
              </Link>
              <Link 
                href="/settings"
                className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer font-medium hover:underline"
              >
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Settings
                </motion.span>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-md"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <motion.button
                className={`p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md ${
                  isTouch ? 'min-h-[44px] min-w-[44px]' : ''
                }`}
                whileTap={{ scale: 0.9 }}
                onClick={() => isTouch && vibrate(30)}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 2v20" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h10l-5-5 5 5v5" />
                </svg>
              </motion.button>

              {/* Profile */}
              {showProfile && (
                <Link href="/profile">
                  <motion.div
                    className={`flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-md cursor-pointer ${
                      isTouch ? 'min-h-[44px]' : ''
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    {!isMobile && <span className="text-sm">Profile</span>}
                  </motion.div>
                </Link>
              )}

              {/* Mobile Menu Button */}
              {isMobile && (
                <motion.button
                  onClick={toggleMobileMenu}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md min-h-[44px] min-w-[44px]"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Toggle mobile menu"
                >
                  <motion.div
                    animate={showMobileMenu ? { rotate: 180 } : { rotate: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {showMobileMenu ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </motion.div>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowMobileMenu(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Menu Content */}
            <motion.div
              ref={mobileMenuRef}
              className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-6 pt-20">
                <nav className="space-y-4">
                  <Link href="/">
                    <motion.div
                      className="block py-3 px-4 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V3a2 2 0 012-2h4a2 2 0 012 2v4" />
                        </svg>
                        <span>Dashboard</span>
                      </div>
                    </motion.div>
                  </Link>
                  <Link href="/templates">
                    <motion.div
                      className="block py-3 px-4 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>Templates</span>
                      </div>
                    </motion.div>
                  </Link>
                  <Link href="/profile-demo">
                    <motion.div
                      className="block py-3 px-4 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer bg-blue-50"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-blue-700 font-medium">Demo</span>
                      </div>
                    </motion.div>
                  </Link>
                  <Link href="/settings">
                    <motion.div
                      className="block py-3 px-4 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Settings</span>
                      </div>
                    </motion.div>
                  </Link>
                  <Link href="/profile">
                    <motion.div
                      className="block py-3 px-4 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile</span>
                      </div>
                    </motion.div>
                  </Link>
                </nav>

                {/* Orientation indicator for development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-8 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
                    <div>Orientation: {orientation}</div>
                    <div>Touch device: {isTouch ? 'Yes' : 'No'}</div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
