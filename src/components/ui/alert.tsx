import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertProps {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  children: React.ReactNode;
  className?: string;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const alertVariants = {
  default: 'bg-blue-50 border-blue-200 text-blue-800',
  destructive: 'bg-red-50 border-red-200 text-red-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
};

const Alert: React.FC<AlertProps> = ({ variant = 'default', children, className }) => {
  return (
    <div className={cn('border rounded-lg p-4 flex items-start space-x-3', alertVariants[variant], className)}>
      {children}
    </div>
  );
};

const AlertDescription: React.FC<AlertDescriptionProps> = ({ children, className }) => {
  return (
    <div className={cn('text-sm flex-1', className)}>
      {children}
    </div>
  );
};

export { Alert, AlertDescription };