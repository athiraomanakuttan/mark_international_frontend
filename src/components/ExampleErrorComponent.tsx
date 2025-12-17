// Example component showing how to use the new error handling system
'use client';
import React, { useState } from 'react';
import { useApiLogger, useUserErrorHandler } from '@/hooks/useLogger';
import axiosInstance from '@/service/axiosInstance';

const ExampleComponent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { logApiCall, logApiSuccess, logApiError } = useApiLogger('ExampleComponent');
  const { showTimeoutError, showNetworkError, showGeneralError } = useUserErrorHandler('ExampleComponent');

  const handleApiCall = async () => {
    setLoading(true);
    logApiCall('fetchData');

    try {
      const response = await axiosInstance.get('/some-endpoint');
      logApiSuccess('fetchData', { dataLength: response.data?.length });
      // Handle success
    } catch (error: any) {
      logApiError('fetchData', error);
      // Error will be automatically shown to user via useApiLogger
    } finally {
      setLoading(false);
    }
  };

  const handleManualError = () => {
    // You can also manually show errors
    showGeneralError('This is a manual error message for testing');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Error Handling Example</h2>
      
      <div className="space-x-2">
        <button
          onClick={handleApiCall}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Test API Call'}
        </button>
        
        <button
          onClick={handleManualError}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Test Manual Error
        </button>
        
        <button
          onClick={() => showTimeoutError()}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Test Timeout Error
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>• API errors will automatically show user-friendly messages</p>
        <p>• All errors are logged for debugging</p>
        <p>• Press Ctrl+Shift+D to open debug panel (dev mode)</p>
      </div>
    </div>
  );
};

export default ExampleComponent;