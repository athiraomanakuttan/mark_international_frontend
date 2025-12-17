// Debug provider for development environments
'use client';
import React, { useState, useEffect } from 'react';
import DebugPanel from '@/components/DebugPanel';

interface DebugProviderProps {
  children: React.ReactNode;
  enableInProduction?: boolean;
}

export const DebugProvider: React.FC<DebugProviderProps> = ({ 
  children, 
  enableInProduction = false 
}) => {
  const [showDebug, setShowDebug] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Only enable in development or if explicitly enabled
    const isDev = process.env.NODE_ENV === 'development';
    setIsEnabled(isDev || enableInProduction);

    // Listen for keyboard shortcut (Ctrl+Shift+D) to toggle debug panel
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDebug(prev => !prev);
      }
    };

    if (isEnabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enableInProduction]);

  if (!isEnabled) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <DebugPanel
        isVisible={showDebug}
        onToggle={() => setShowDebug(!showDebug)}
      />
      
      {/* Help text */}
      {!showDebug && (
        <div className="fixed bottom-4 left-4 bg-gray-800 text-white text-xs p-2 rounded opacity-50 z-40">
          Press Ctrl+Shift+D to toggle debug panel
        </div>
      )}
    </>
  );
};

export default DebugProvider;