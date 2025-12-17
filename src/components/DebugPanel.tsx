// Debug panel for monitoring network issues and logs in real-time
'use client';
import React, { useState, useEffect } from 'react';
import { logger, LogLevel } from '@/lib/logger';

interface DebugPanelProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ 
  isVisible = false, 
  onToggle 
}) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [requestLogs, setRequestLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'logs' | 'requests' | 'errors'>('logs');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!isVisible || !autoRefresh) return;

    const interval = setInterval(() => {
      setLogs(logger.getLogs());
      setRequestLogs(logger.getRequestLogs());
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, autoRefresh]);

  const errorLogs = logs.filter(log => log.level === LogLevel.ERROR);
  const timeoutErrors = logger.getTimeoutErrors();

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg z-50"
        style={{ fontSize: '12px' }}
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white w-[90%] h-[80%] rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">Debug Panel - Network Monitor</h2>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto Refresh
            </label>
            <button
              onClick={() => {
                logger.clearLogs();
                setLogs([]);
                setRequestLogs([]);
              }}
              className="bg-yellow-600 px-3 py-1 rounded text-sm"
            >
              Clear Logs
            </button>
            <button
              onClick={() => {
                const exportData = logger.exportLogs();
                const blob = new Blob([exportData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `debug-logs-${new Date().toISOString()}.json`;
                a.click();
              }}
              className="bg-green-600 px-3 py-1 rounded text-sm"
            >
              Export
            </button>
            <button
              onClick={onToggle}
              className="bg-red-600 px-3 py-1 rounded text-sm"
            >
              ✕ Close
            </button>
          </div>
        </div>
        
        <div className="flex h-[calc(100%-60px)]">
          <div className="w-1/4 bg-gray-100 border-r">
            <div className="p-4">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`w-full p-2 text-left rounded ${
                    activeTab === 'logs' ? 'bg-blue-500 text-white' : 'bg-white'
                  }`}
                >
                  All Logs ({logs.length})
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`w-full p-2 text-left rounded ${
                    activeTab === 'requests' ? 'bg-blue-500 text-white' : 'bg-white'
                  }`}
                >
                  API Requests ({requestLogs.length})
                </button>
                <button
                  onClick={() => setActiveTab('errors')}
                  className={`w-full p-2 text-left rounded ${
                    activeTab === 'errors' ? 'bg-red-500 text-white' : 'bg-white'
                  }`}
                >
                  Errors ({errorLogs.length})
                </button>
              </div>

              {/* Quick Stats */}
              <div className="mt-4 p-3 bg-white rounded">
                <h4 className="font-bold text-sm mb-2">Quick Stats</h4>
                <div className="text-xs space-y-1">
                  <div>Timeout Errors: {timeoutErrors.length}</div>
                  <div>Failed Requests: {requestLogs.filter(r => r.error).length}</div>
                  <div>Avg Response Time: {
                    requestLogs.length > 0 
                      ? (requestLogs
                          .filter(r => r.duration)
                          .reduce((sum, r) => sum + (r.duration || 0), 0) / 
                         requestLogs.filter(r => r.duration).length).toFixed(0)
                      : 0
                  }ms</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'logs' && (
              <div className="space-y-2">
                <h3 className="font-bold">All Logs</h3>
                {logs.slice(-50).reverse().map((log, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-sm ${
                      log.level === LogLevel.ERROR
                        ? 'bg-red-50 border-l-4 border-red-500'
                        : log.level === LogLevel.WARN
                        ? 'bg-yellow-50 border-l-4 border-yellow-500'
                        : 'bg-gray-50 border-l-4 border-gray-300'
                    }`}
                  >
                    <div className="font-mono text-xs text-gray-500">
                      {log.timestamp}
                    </div>
                    <div className="font-semibold">{log.message}</div>
                    {log.context && (
                      <pre className="text-xs mt-1 text-gray-600 overflow-auto">
                        {JSON.stringify(log.context, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-2">
                <h3 className="font-bold">API Requests</h3>
                {requestLogs.slice(-30).reverse().map((req, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border ${
                      req.error
                        ? 'bg-red-50 border-red-200'
                        : req.status && req.status >= 200 && req.status < 300
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                          {req.method}
                        </span>
                        <span className="ml-2 font-semibold">{req.url}</span>
                      </div>
                      <div className="text-right text-sm">
                        <div>Status: {req.status || 'Failed'}</div>
                        <div>Duration: {req.duration?.toFixed(0) || '?'}ms</div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <div>Page: {req.page}</div>
                      {req.component && <div>Component: {req.component}</div>}
                      {req.error && (
                        <div className="text-red-600 font-semibold mt-1">
                          Error: {req.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'errors' && (
              <div className="space-y-2">
                <h3 className="font-bold text-red-600">Error Logs</h3>
                {errorLogs.slice(-20).reverse().map((log, index) => (
                  <div key={index} className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                    <div className="font-mono text-xs text-gray-500">
                      {log.timestamp}
                    </div>
                    <div className="font-bold text-red-800">{log.message}</div>
                    {log.context && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-semibold">
                          Error Details
                        </summary>
                        <pre className="text-xs mt-1 text-gray-700 overflow-auto bg-white p-2 rounded">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;