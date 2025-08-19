// Mobile-Optimized Template Interface
// Responsive design with touch-friendly interactions and mobile-specific features

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { FeatureGate } from '../../AdvancedFeatures/FeatureToggleProvider';
import { AdvancedTemplate } from '../../../types/templates/advanced';
import { advancedTemplateService } from '../../../services/templates/AdvancedTemplateService';
import {
  Menu,
  X,
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Share,
  Bookmark,
  BookmarkCheck,
  Download,
  Settings,
  Eye,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Clock,
  Target,
  Users,
  Star,
  Heart,
  MessageCircle,
  Send,
  Camera,
  Mic,
  Image,
  MapPin,
  Calendar,
  Bell,
  BellOff,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Sun,
  Moon,
  Zap,
  Shield,
  Award,
  TrendingUp,
  Activity,
  Layers,
  Smartphone,
  Tablet,
  Monitor,
  Navigation,
  Home,
  User,
  FileText,
  BarChart3,
  HelpCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface MobileTemplateInterfaceProps {
  template?: AdvancedTemplate;
  workspaceId: string;
  userId: string;
  onTemplateSelect?: (template: AdvancedTemplate) => void;
  onTemplateComplete?: (templateId: string, results: any) => void;
  className?: string;
}

interface TouchGesture {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  isSwipe: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
}

export const MobileTemplateInterface: React.FC<MobileTemplateInterfaceProps> = ({
  template: initialTemplate,
  workspaceId,
  userId,
  onTemplateSelect,
  onTemplateComplete,
  className = ''
}) => {
  const [template, setTemplate] = useState<AdvancedTemplate | null>(initialTemplate || null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'card' | 'focus'>('card');
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVoiceControl, setShowVoiceControl] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [connectionStrength, setConnectionStrength] = useState(4);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const swipeStartRef = useRef<TouchGesture | null>(null);

  useEffect(() => {
    // Device and network status monitoring
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    // Battery API (if supported)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', (e) => setReduceMotion(e.matches));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    swipeStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      isSwipe: false,
      direction: null
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeStartRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeStartRef.current.startX;
    const deltaY = touch.clientY - swipeStartRef.current.startY;

    swipeStartRef.current.currentX = touch.clientX;
    swipeStartRef.current.currentY = touch.clientY;
    swipeStartRef.current.deltaX = deltaX;
    swipeStartRef.current.deltaY = deltaY;

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      swipeStartRef.current.direction = deltaX > 0 ? 'right' : 'left';
    } else {
      swipeStartRef.current.direction = deltaY > 0 ? 'down' : 'up';
    }

    // Mark as swipe if movement exceeds threshold
    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
      swipeStartRef.current.isSwipe = true;
    }
  };

  const handleTouchEnd = () => {
    if (!swipeStartRef.current || !swipeStartRef.current.isSwipe) {
      swipeStartRef.current = null;
      return;
    }

    const { direction, deltaX, deltaY } = swipeStartRef.current;

    // Handle swipe gestures
    if (direction === 'left' && Math.abs(deltaX) > 100) {
      // Swipe left - next step
      if (template && currentStep < template.items.length - 1) {
        setCurrentStep(currentStep + 1);
        triggerHaptic('light');
      }
    } else if (direction === 'right' && Math.abs(deltaX) > 100) {
      // Swipe right - previous step
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
        triggerHaptic('light');
      }
    } else if (direction === 'up' && Math.abs(deltaY) > 100) {
      // Swipe up - mark complete
      handleStepComplete(currentStep);
    } else if (direction === 'down' && Math.abs(deltaY) > 100) {
      // Swipe down - show menu
      setShowMenu(true);
    }

    swipeStartRef.current = null;
  };

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!hapticEnabled || !('vibrate' in navigator)) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50]
    };

    navigator.vibrate(patterns[type]);
  };

  const handleStepComplete = (stepIndex: number) => {
    if (!template) return;

    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
      triggerHaptic('medium');
    }
    setCompletedSteps(newCompleted);

    // Auto-advance to next step if not the last one
    if (!newCompleted.has(stepIndex) && stepIndex < template.items.length - 1) {
      setTimeout(() => setCurrentStep(stepIndex + 1), 300);
    }
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      triggerHaptic('light');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      
      // Voice commands
      if (transcript.includes('next')) {
        if (template && currentStep < template.items.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      } else if (transcript.includes('previous')) {
        if (currentStep > 0) {
          setCurrentStep(currentStep - 1);
        }
      } else if (transcript.includes('complete')) {
        handleStepComplete(currentStep);
      } else if (transcript.includes('menu')) {
        setShowMenu(true);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const getThemeClasses = () => {
    const base = isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900';
    const contrast = highContrast ? ' high-contrast' : '';
    return base + contrast;
  };

  if (!template) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${getThemeClasses()}`}>
        <div className="text-center p-6">
          <Smartphone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-bold mb-2">No Template Selected</h2>
          <p className="text-gray-600 mb-4">Select a template to begin</p>
          <button
            onClick={() => setShowSearch(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <FeatureGate feature="aiDashboard" fallback={null}>
      <div
        ref={containerRef}
        className={`min-h-screen relative overflow-hidden ${getThemeClasses()} ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Status Bar */}
        <div className={`flex items-center justify-between px-4 py-2 text-xs ${
          isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="font-medium">9:41</span>
            {isOffline && (
              <div className="flex items-center space-x-1 text-red-500">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className={`w-1 h-2 rounded-sm ${
                    i < connectionStrength ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
              ))}
            </div>
            <Wifi className="w-3 h-3" />
            <div className="flex items-center space-x-1">
              <Battery className="w-3 h-3" />
              <span>{batteryLevel}%</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={() => setShowMenu(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 mx-4">
            <h1 className={`font-bold truncate ${getFontSizeClass()}`}>{template.title}</h1>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
              <span>{currentStep + 1} of {template.items.length}</span>
              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / template.items.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowVoiceControl(!showVoiceControl)}
              className={`p-2 rounded-lg transition-colors ${
                showVoiceControl ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {isListening ? <Mic className="w-5 h-5 text-red-500" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setViewMode(viewMode === 'focus' ? 'card' : 'focus')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {viewMode === 'focus' ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Voice Control Panel */}
        <AnimatePresence>
          {showVoiceControl && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`p-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Voice Commands</h3>
                <button
                  onClick={startVoiceRecognition}
                  disabled={isListening}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isListening
                      ? 'bg-red-500 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isListening ? 'Listening...' : 'Start Listening'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>"Next" - Next step</div>
                <div>"Previous" - Previous step</div>
                <div>"Complete" - Mark complete</div>
                <div>"Menu" - Open menu</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {viewMode === 'focus' ? (
              <motion.div
                key="focus"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="h-full flex items-center justify-center p-6"
              >
                <div className="text-center max-w-md">
                  <div className={`text-4xl font-bold mb-4 ${
                    completedSteps.has(currentStep) ? 'text-green-600' : ''
                  }`}>
                    {currentStep + 1}
                  </div>
                  
                  <h2 className={`text-xl font-bold mb-4 leading-tight ${getFontSizeClass()}`}>
                    {template.items[currentStep]?.text}
                  </h2>

                  {template.items[currentStep]?.description && (
                    <p className={`text-gray-600 mb-6 ${getFontSizeClass()}`}>
                      {template.items[currentStep].description}
                    </p>
                  )}

                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                      className="p-4 bg-gray-200 dark:bg-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                      onClick={() => handleStepComplete(currentStep)}
                      className={`p-6 rounded-full transition-all transform active:scale-95 ${
                        completedSteps.has(currentStep)
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {completedSteps.has(currentStep) ? <Check className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
                    </button>

                    <button
                      onClick={() => setCurrentStep(Math.min(template.items.length - 1, currentStep + 1))}
                      disabled={currentStep === template.items.length - 1}
                      className="p-4 bg-gray-200 dark:bg-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="mt-8 text-xs text-gray-500">
                    Swipe left/right to navigate • Swipe up to complete
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full overflow-y-auto"
              >
                <div className="p-4 space-y-3">
                  {template.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        index === currentStep
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : completedSteps.has(index)
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      } ${reduceMotion ? '' : 'transform active:scale-98'}`}
                      onClick={() => setCurrentStep(index)}
                    >
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStepComplete(index);
                          }}
                          className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            completedSteps.has(index)
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                          }`}
                        >
                          {completedSteps.has(index) && <Check className="w-4 h-4" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs text-gray-500 ${getFontSizeClass()}`}>
                              Step {index + 1}
                            </span>
                            {item.required && (
                              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          
                          <h3 className={`font-medium ${getFontSizeClass()} ${
                            completedSteps.has(index) ? 'line-through text-gray-500' : ''
                          }`}>
                            {item.text}
                          </h3>

                          {item.description && (
                            <p className={`text-gray-600 mt-1 text-sm ${getFontSizeClass()}`}>
                              {item.description}
                            </p>
                          )}

                          {item.estimatedTime && (
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {item.estimatedTime} min
                            </div>
                          )}
                        </div>

                        {index === currentStep && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"
                          />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Completion Summary */}
                {completedSteps.size === template.items.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 m-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center"
                  >
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
                      Template Completed!
                    </h3>
                    <p className="text-green-700 dark:text-green-300 mb-4">
                      Great job! You've completed all steps.
                    </p>
                    <button
                      onClick={() => onTemplateComplete?.(template.id, { completedSteps: Array.from(completedSteps) })}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Finish & Save
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <div className={`flex items-center justify-between p-4 border-t ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${getFontSizeClass()}`}>
              {completedSteps.size} / {template.items.length}
            </span>
            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSteps.size / template.items.length) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setCurrentStep(Math.min(template.items.length - 1, currentStep + 1))}
            disabled={currentStep === template.items.length - 1}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Side Menu */}
        <AnimatePresence>
          {showMenu && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setShowMenu(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 20 }}
                className={`fixed top-0 left-0 h-full w-80 z-50 ${getThemeClasses()} shadow-xl`}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Menu</h2>
                    <button
                      onClick={() => setShowMenu(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Template Info */}
                  <div>
                    <h3 className="font-medium mb-3">Template Info</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{template.estimatedTime} minutes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4" />
                        <span className="capitalize">{template.difficulty}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>{template.items.length} steps</span>
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div>
                    <h3 className="font-medium mb-3">Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Dark Mode</span>
                        <button
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            isDarkMode ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            isDarkMode ? 'transform translate-x-6' : ''
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Haptic Feedback</span>
                        <button
                          onClick={() => setHapticEnabled(!hapticEnabled)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            hapticEnabled ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            hapticEnabled ? 'transform translate-x-6' : ''
                          }`} />
                        </button>
                      </div>

                      <div>
                        <span className="text-sm block mb-2">Font Size</span>
                        <div className="flex space-x-2">
                          {(['small', 'medium', 'large'] as const).map((size) => (
                            <button
                              key={size}
                              onClick={() => setFontSize(size)}
                              className={`px-3 py-1 text-xs rounded transition-colors ${
                                fontSize === size
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h3 className="font-medium mb-3">Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <Share className="w-5 h-5" />
                        <span>Share Template</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <Download className="w-5 h-5" />
                        <span>Download Offline</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <HelpCircle className="w-5 h-5" />
                        <span>Help & Support</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Offline Indicator */}
        <AnimatePresence>
          {isOffline && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-4 left-4 right-4 bg-orange-500 text-white p-3 rounded-lg shadow-lg z-30"
            >
              <div className="flex items-center space-x-2">
                <WifiOff className="w-5 h-5" />
                <span className="text-sm font-medium">You're offline. Changes will sync when reconnected.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading States and Gestures */}
        {!reduceMotion && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-0"
            initial={false}
            animate={{
              background: isDarkMode 
                ? 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
                : 'radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%)'
            }}
          />
        )}
      </div>
    </FeatureGate>
  );
};

export default MobileTemplateInterface;
