'use client';

import React from 'react';
import { ModernDashboardLayout } from '@/components/navbar/modern-dashboard-navbar';
import AdminResignationTable from '@/components/admin/resignation/AdminResignationTable';

const AdminResignationsPage: React.FC = () => {
  return (
    <ModernDashboardLayout>
      <div className="p-6">
        <AdminResignationTable />
      </div>
    </ModernDashboardLayout>
  );
};

export default AdminResignationsPage;
