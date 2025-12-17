// Production error dashboard - accessible via URL in production
'use client';
import React, { useState, useEffect } from 'react';
import { productionErrorReporter } from '@/lib/productionErrorReporter';
import { logger } from '@/lib/logger';

const ProductionErrorDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [showExport, setShowExport] = useState(false);
  const [exportData, setExportData] = useState<string>('');

  useEffect(() => {
    // Update summary every 5 seconds
    const updateSummary = () => {
      setSummary(productionErrorReporter.getErrorSummary());
    };

    updateSummary();
    const interval = setInterval(updateSummary, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    const data = productionErrorReporter.exportReports();
    setExportData(data);
    setShowExport(true);
  };

  const handleDownload = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production-errors-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEmailSupport = () => {
    const subject = encodeURIComponent('Production Error Report');
    const body = encodeURIComponent(
      `Hello Support Team,

I'm experiencing connectivity issues in the production app. Here are the details:

${summary ? `
Error Summary:
- Total Errors: ${summary.totalErrors}
- Timeout Errors: ${summary.timeouts}
- Network Errors: ${summary.networkErrors}
- Server Errors: ${summary.serverErrors}
- Average Response Time: ${summary.avgResponseTime?.toFixed(0)}ms
- Most Problematic Endpoint: ${summary.mostProblematicEndpoint}
` : ''}

Current Page: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Please find the detailed error report in the attached file.

Best regards`
    );

    window.location.href = `mailto:support@markeduapp.com?subject=${subject}&body=${body}`;
  };

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading error dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Production Error Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring of application errors and connectivity issues</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{summary.totalErrors}</div>
            <div className="text-sm text-gray-600">Total Errors</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{summary.timeouts}</div>
            <div className="text-sm text-gray-600">Timeout Errors</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{summary.networkErrors}</div>
            <div className="text-sm text-gray-600">Network Errors</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">
              {summary.avgResponseTime?.toFixed(0) || 0}ms
            </div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>
        </div>

        {/* Problem Analysis */}
        {summary.totalErrors > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Issue Analysis</h2>
            
            {summary.mostProblematicEndpoint && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                <div className="font-semibold text-red-800">Most Problematic Endpoint</div>
                <div className="text-sm text-red-700 font-mono">{summary.mostProblematicEndpoint}</div>
              </div>
            )}

            {summary.timeouts > 0 && (
              <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded">
                <div className="font-semibold text-orange-800">Timeout Issues Detected</div>
                <div className="text-sm text-orange-700">
                  {summary.timeouts} timeout errors detected. This usually indicates:
                  <ul className="mt-2 ml-4 list-disc">
                    <li>Slow backend response times</li>
                    <li>Network connectivity issues</li>
                    <li>Server overload or maintenance</li>
                  </ul>
                </div>
              </div>
            )}

            {summary.networkErrors > 0 && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <div className="font-semibold text-yellow-800">Network Connection Issues</div>
                <div className="text-sm text-yellow-700">
                  {summary.networkErrors} network errors detected. Check your internet connection.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleExport}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              📊 Export Error Report
            </button>
            
            <button
              onClick={handleEmailSupport}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              📧 Email Support Team
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              🔄 Refresh Page
            </button>
          </div>

          {summary.totalErrors === 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <div className="text-green-800">✅ No errors detected in current session</div>
            </div>
          )}
        </div>

        {/* Export Modal */}
        {showExport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Error Report Export</h3>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <button
                    onClick={handleDownload}
                    className="bg-blue-600 text-white px-4 py-2 rounded mr-2 hover:bg-blue-700"
                  >
                    💾 Download JSON
                  </button>
                  
                  <button
                    onClick={() => navigator.clipboard.writeText(exportData)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    📋 Copy to Clipboard
                  </button>
                </div>
                
                <textarea
                  value={exportData}
                  readOnly
                  className="w-full h-64 p-2 border rounded font-mono text-xs"
                  placeholder="Error report data will appear here..."
                />
              </div>
              
              <div className="p-4 border-t">
                <button
                  onClick={() => setShowExport(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionErrorDashboard;