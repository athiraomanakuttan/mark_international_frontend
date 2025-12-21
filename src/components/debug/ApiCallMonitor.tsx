'use client';
import React, { useEffect, useState } from 'react';

interface ApiCall {
  timestamp: number;
  url: string;
  method: string;
  duration?: number;
  status?: number;
}

let apiCalls: ApiCall[] = [];

// Intercept all axios calls
const originalAxios = require('axios');
const axiosInstance = require('@/service/axiosInstance').default;

export const ApiCallMonitor: React.FC = () => {
  const [calls, setCalls] = useState<ApiCall[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Track calls
    const interval = setInterval(() => {
      setCalls([...apiCalls]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const recentCalls = calls.slice(-20);
  const concurrentCalls = calls.filter(call => 
    Date.now() - call.timestamp < 5000 && !call.duration
  ).length;

  const suspiciousPatterns = {
    staffCallsInLast10s: calls.filter(call => 
      call.url.includes('/admin/staff/get-all-active') && 
      Date.now() - call.timestamp < 10000
    ).length,
    parallelCalls: concurrentCalls,
    timeouts: calls.filter(call => !call.status && call.duration && call.duration > 30000).length
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded"
        style={{ zIndex: 9999 }}
      >
        API Monitor ({concurrentCalls} active)
      </button>
    );
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-4xl max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">API Call Monitor</h3>
          <button 
            onClick={() => setIsVisible(false)}
            className="bg-gray-500 text-white px-3 py-1 rounded"
          >
            Close
          </button>
        </div>
        
        {/* Suspicious Patterns Alert */}
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <h4 className="font-semibold text-red-700">⚠️ Potential Issues:</h4>
          <ul className="text-sm text-red-600">
            <li>Staff API calls in last 10s: {suspiciousPatterns.staffCallsInLast10s}</li>
            <li>Current parallel calls: {suspiciousPatterns.parallelCalls}</li>
            <li>Timeout errors: {suspiciousPatterns.timeouts}</li>
          </ul>
        </div>

        {/* Recent Calls */}
        <div className="space-y-2">
          <h4 className="font-semibold">Recent API Calls:</h4>
          {recentCalls.map((call, idx) => (
            <div 
              key={idx} 
              className={`p-2 rounded text-xs ${
                !call.duration ? 'bg-yellow-100' : 
                call.status && call.status < 400 ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <div>{new Date(call.timestamp).toLocaleTimeString()} - {call.method} {call.url}</div>
              <div>Status: {call.status || 'Pending'} | Duration: {call.duration || 'In Progress'}ms</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Track calls globally
if (typeof window !== 'undefined') {
  const originalCreate = axiosInstance.constructor.create;
  
  // Intercept request start
  axiosInstance.interceptors.request.use((config: any) => {
    const call: ApiCall = {
      timestamp: Date.now(),
      url: config.url,
      method: config.method.toUpperCase(),
    };
    apiCalls.push(call);
    config._callIndex = apiCalls.length - 1;
    return config;
  });

  // Intercept response/error
  axiosInstance.interceptors.response.use(
    (response: any) => {
      const callIndex = response.config._callIndex;
      if (callIndex !== undefined && apiCalls[callIndex]) {
        apiCalls[callIndex].status = response.status;
        apiCalls[callIndex].duration = Date.now() - apiCalls[callIndex].timestamp;
      }
      return response;
    },
    (error: any) => {
      const callIndex = error.config?._callIndex;
      if (callIndex !== undefined && apiCalls[callIndex]) {
        apiCalls[callIndex].status = error.response?.status || 0;
        apiCalls[callIndex].duration = Date.now() - apiCalls[callIndex].timestamp;
      }
      return Promise.reject(error);
    }
  );
}

export { apiCalls };