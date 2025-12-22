'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'react-toastify';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary specifically designed to catch and handle header-related errors
 * including the x-action-redirect header issue in Next.js 15
 */
class HeaderErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Check if this is a header-related error
    const isHeaderError = error.message?.toLowerCase().includes('header') ||
                         error.message?.toLowerCase().includes('x-action') ||
                         error.message?.toLowerCase().includes('invalid character');

    return { 
      hasError: true, 
      error: isHeaderError ? error : undefined 
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Header Error Boundary caught an error:', error, errorInfo);

    // Check if this is the specific x-action-redirect error
    if (error.message?.includes('x-action-redirect') || 
        error.message?.includes('Invalid character in header content')) {
      
      console.warn('Detected x-action-redirect header error, attempting recovery...');
      
      // Clear any problematic state
      try {
        if (typeof window !== 'undefined') {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('x-action-redirect');
            sessionStorage.removeItem('redirect');
          }
          if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('x-action-redirect');
            localStorage.removeItem('redirect');
          }
        }
      } catch (cleanupError) {
        console.warn('Failed to cleanup redirect state:', cleanupError);
      }

      // Show user-friendly error message
      toast.error('Form submission encountered an issue. Please try again.');
      
      // Attempt to recover by resetting the component state
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      }, 1000);
      
      return;
    }

    // For other errors, store them in state
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      // Provide custom fallback UI for header errors
      if (this.state.error?.message?.toLowerCase().includes('header') ||
          this.state.error?.message?.toLowerCase().includes('x-action')) {
        
        return (
          <div className="min-h-[200px] flex items-center justify-center p-8">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Temporary Issue Detected
                </h3>
                <p className="text-yellow-700 mb-4">
                  We encountered a temporary technical issue. This is usually resolved by retrying.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={this.handleRetry}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={this.handleReload}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // For other errors, use the fallback prop or a generic error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[200px] flex items-center justify-center p-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Something went wrong
              </h3>
              <p className="text-red-700 mb-4">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default HeaderErrorBoundary;