'use client';

import React from 'react';
import { ModernDashboardLayout } from '@/components/navbar/modern-dashboard-navbar';
import EmployeeTable from '@/components/admin/employee/EmployeeTable';

const EmployeePage: React.FC = () => {
  return (
    <ModernDashboardLayout>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-4 sm:p-6 md:p-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 w-full max-w-none overflow-hidden">
            <EmployeeTable />
          </div>
        </main>
      </div>
    </ModernDashboardLayout>
  );
};

export default EmployeePage;