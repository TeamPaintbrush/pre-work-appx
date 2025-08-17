/**
 * Backend Status Component
 * Shows connection status and allows testing backend integration
 */

"use client";

import { useState, useEffect } from 'react';
import { backendService } from '../../lib/services/backendService';

interface BackendStatusProps {
  className?: string;
}

export default function BackendStatus({ className = '' }: BackendStatusProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [message, setMessage] = useState('');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkBackendStatus = async () => {
    setStatus('checking');
    setMessage('Testing connection...');
    
    try {
      const isConnected = await backendService.testConnection();
      
      if (isConnected) {
        setStatus('connected');
        setMessage('Backend connected successfully');
      } else {
        setStatus('disconnected');
        setMessage('Backend not available (using local storage)');
      }
      
      setLastCheck(new Date());
    } catch (error) {
      setStatus('error');
      setMessage(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLastCheck(new Date());
    }
  };

  const testSaveLoad = async () => {
    try {
      setMessage('Testing save/load...');
      
      // Test save
      const testData = {
        title: 'Backend Test Checklist',
        sections: [
          {
            id: 'test-section',
            title: 'Test Section',
            items: [
              { id: 'test-item', text: 'Test Item', completed: false }
            ]
          }
        ]
      };
      
      const saveResult = await backendService.saveChecklist(testData);
      
      if (saveResult.success) {
        // Test load
        const loadResult = await backendService.loadChecklists();
        
        if (loadResult.success) {
          setMessage(`✅ Save/Load test passed! Found ${loadResult.checklists?.length || 0} checklists`);
          setStatus('connected');
        } else {
          setMessage(`❌ Load test failed: ${loadResult.error}`);
          setStatus('error');
        }
      } else {
        setMessage(`❌ Save test failed: ${saveResult.error}`);
        setStatus('error');
      }
    } catch (error) {
      setMessage(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatus('error');
    }
  };

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-50 border-green-200';
      case 'disconnected': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'checking': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return '✅';
      case 'disconnected': return '⚠️';
      case 'error': return '❌';
      case 'checking': return '🔄';
      default: return '❓';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()} ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          {getStatusIcon()} Backend Status
        </h3>
        <div className="flex gap-2">
          <button
            onClick={checkBackendStatus}
            className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 transition-colors"
            disabled={status === 'checking'}
          >
            {status === 'checking' ? 'Checking...' : 'Refresh'}
          </button>
          <button
            onClick={testSaveLoad}
            className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 transition-colors"
            disabled={status === 'checking'}
          >
            Test Save/Load
          </button>
        </div>
      </div>
      
      <p className="text-sm mb-2">{message}</p>
      
      {lastCheck && (
        <p className="text-xs opacity-75">
          Last checked: {lastCheck.toLocaleTimeString()}
        </p>
      )}
      
      <div className="mt-3 text-xs">
        <details className="cursor-pointer">
          <summary className="opacity-75 hover:opacity-100">Backend Info</summary>
          <div className="mt-2 space-y-1 text-xs">
            <div>• API Endpoint: /api/checklists</div>
            <div>• Storage: DynamoDB + Local Storage fallback</div>
            <div>• Mode: {status === 'connected' ? 'Online' : 'Offline'}</div>
          </div>
        </details>
      </div>
    </div>
  );
}
