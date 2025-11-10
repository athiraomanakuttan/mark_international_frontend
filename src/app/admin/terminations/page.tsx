'use client';

import React from 'react';
import { ModernDashboardLayout } from '@/components/navbar/modern-dashboard-navbar';
import TerminationTable from '@/components/admin/termination/TerminationTable';

const TerminationsPage = () => {
  return (
    <ModernDashboardLayout>
      <div className="p-6">
        <TerminationTable />
      </div>
    </ModernDashboardLayout>
  );
};

export default TerminationsPage;
