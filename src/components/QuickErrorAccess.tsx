// Quick access component that can be added to any page for error dashboard access
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const QuickErrorAccess: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);
  const router = useRouter();

  const handleQuickAccess = () => {
    setClickCount(prev => prev + 1);
    
    // Triple click to access error dashboard
    if (clickCount >= 2) {
      router.push('/error-dashboard');
      setClickCount(0);
    }
    
    // Reset counter after 2 seconds
    setTimeout(() => setClickCount(0), 2000);
  };

  // Only show in production or if there are errors
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  return (
    <button
      onClick={handleQuickAccess}
      className="fixed bottom-2 left-2 w-4 h-4 bg-transparent border-none opacity-10 hover:opacity-30 transition-opacity"
      title="Triple-click for error dashboard"
      style={{ zIndex: 9999 }}
    >
      <div className="w-full h-full bg-gray-400 rounded-full"></div>
    </button>
  );
};

export default QuickErrorAccess;