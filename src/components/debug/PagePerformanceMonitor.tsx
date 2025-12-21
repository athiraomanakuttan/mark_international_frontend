'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PagePerformance {
  route: string;
  loadTime: number;
  apiCalls: number;
  hangingRequests: number;
  timestamp: number;
  errors: number;
}

let performanceData: PagePerformance[] = [];
let currentPageStart = Date.now();
let currentRoute = '';

export const PagePerformanceMonitor: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<PagePerformance[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updatePerformance = () => {
      setData([...performanceData]);
    };

    const interval = setInterval(updatePerformance, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Track page navigation
    const handleRouteChange = (url: string) => {
      // Record previous page performance
      if (currentRoute) {
        recordPagePerformance();
      }
      
      // Start tracking new page
      currentRoute = url;
      currentPageStart = Date.now();
    };

    // Monitor window navigation
    if (typeof window !== 'undefined') {
      const originalPushState = window.history.pushState;
      window.history.pushState = function(...args) {
        originalPushState.apply(window.history, args);
        handleRouteChange(args[2] as string || window.location.pathname);
      };
      
      // Initial page load
      currentRoute = window.location.pathname;
      currentPageStart = Date.now();
    }

    return () => {
      recordPagePerformance();
    };
  }, []);

  const recordPagePerformance = () => {
    if (!currentRoute) return;

    const loadTime = Date.now() - currentPageStart;
    
    // Get current API statistics
    const recentApiCalls = (window as any).apiCalls || [];
    const pageApiCalls = recentApiCalls.filter((call: any) => 
      call.timestamp > currentPageStart
    );
    
    const hangingRequests = pageApiCalls.filter((call: any) => !call.duration).length;
    const errors = pageApiCalls.filter((call: any) => 
      call.status && call.status >= 400
    ).length;

    const performance: PagePerformance = {
      route: currentRoute,
      loadTime,
      apiCalls: pageApiCalls.length,
      hangingRequests,
      timestamp: Date.now(),
      errors
    };

    performanceData.push(performance);
    
    // Keep only last 20 records
    if (performanceData.length > 20) {
      performanceData = performanceData.slice(-20);
    }
  };

  const slowPages = data.filter(p => p.loadTime > 10000).sort((a, b) => b.loadTime - a.loadTime);
  const problematicPages = data.filter(p => p.hangingRequests > 0 || p.errors > 0);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 bg-orange-500 text-white p-2 rounded text-xs"
        style={{ zIndex: 9999 }}
      >
        Page Perf ({slowPages.length} slow)
      </button>
    );
  }

  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-white border-l shadow-lg z-50 overflow-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Page Performance</h3>
          <button 
            onClick={() => setIsVisible(false)}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
          >
            Close
          </button>
        </div>
        
        {/* Current Page Status */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-semibold text-blue-700">Current Page:</h4>
          <div className="text-sm text-blue-600">
            <div>Route: {currentRoute}</div>
            <div>Time: {((Date.now() - currentPageStart) / 1000).toFixed(1)}s</div>
          </div>
        </div>

        {/* Slow Pages Alert */}
        {slowPages.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <h4 className="font-semibold text-red-700">🐌 Slow Pages (&gt;10s):</h4>
            {slowPages.map((page, idx) => (
              <div key={idx} className="text-sm text-red-600">
                <div>{page.route}: {(page.loadTime / 1000).toFixed(1)}s</div>
                <div className="text-xs">API calls: {page.apiCalls}, Errors: {page.errors}</div>
              </div>
            ))}
          </div>
        )}

        {/* Problematic Pages */}
        {problematicPages.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-semibold text-yellow-700">⚠️ Issues:</h4>
            {problematicPages.map((page, idx) => (
              <div key={idx} className="text-sm text-yellow-600">
                <div>{page.route}</div>
                <div className="text-xs">
                  Hanging: {page.hangingRequests}, Errors: {page.errors}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Performance */}
        <div className="space-y-2">
          <h4 className="font-semibold">Recent Pages:</h4>
          {data.slice(-10).reverse().map((page, idx) => (
            <div 
              key={idx} 
              className={`p-2 rounded text-xs ${
                page.loadTime > 10000 ? 'bg-red-100' :
                page.loadTime > 5000 ? 'bg-yellow-100' : 'bg-green-100'
              }`}
            >
              <div className="font-medium">{page.route}</div>
              <div>
                Load: {(page.loadTime / 1000).toFixed(1)}s | 
                API: {page.apiCalls} | 
                Hang: {page.hangingRequests} | 
                Err: {page.errors}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(page.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { performanceData };