'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, FileText, AlertCircle } from 'lucide-react';
import { Resignation } from '@/types/resignation-types';
import ResignationService from '@/service/resignationService';
import ResignationForm from '@/components/staff/application/ResignationForm';
import ResignationDetails from '@/components/staff/application/ResignationDetails';
import { ModernDashboardLayout } from '@/components/staff/modern-dashboard-navbar';

const ResignationPage: React.FC = () => {
  const [resignation, setResignation] = useState<Resignation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadResignation();
  }, []);

  const loadResignation = async () => {
    setIsLoading(true);
    try {
      const response = await ResignationService.getUserResignation();
      
      if (response.status && response.data) {
        setResignation(response.data);
        setShowForm(false);
      } else {
        // No resignation found, show form
        setResignation(null);
        setShowForm(true);
      }
    } catch (error: any) {
      console.error('Error loading resignation:', error);
      // If 404, no resignation exists - show form
      if (error?.response?.status === 404) {
        setResignation(null);
        setShowForm(true);
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load resignation';
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSuccess = () => {
    if (isEditing) {
      toast.success('Resignation updated successfully!');
    } else {
      toast.success('Resignation submitted successfully!');
    }
    setIsEditing(false);
    loadResignation(); // Reload to show the submitted resignation
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = () => {
    setResignation(null);
    setShowForm(true);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white dark:bg-gray-800 shadow-md">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Loading resignation details...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <ModernDashboardLayout>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 flex items-center justify-center gap-2">
              <FileText className="w-8 h-8" />
              Resignation Application
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {resignation 
                ? 'View and manage your resignation application' 
                : 'Submit your resignation application'}
            </p>
          </div>

          {/* Content */}
          {showForm ? (
            <div className="space-y-4">
              {isEditing && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-blue-700">
                      <AlertCircle className="w-5 h-5" />
                      <p className="font-medium">Editing Resignation</p>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      You are editing your existing resignation. Changes will update your current application.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              <ResignationForm 
                onSuccess={handleFormSuccess}
                onCancel={isEditing ? handleCancelEdit : undefined}
                initialData={isEditing && resignation ? resignation : undefined}
                isEditMode={isEditing}
              />
            </div>
          ) : resignation ? (
            <ResignationDetails 
              resignation={resignation}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showActions={true}
            />
          ) : (
            <Card className="bg-white dark:bg-gray-800 shadow-md">
              <CardContent className="p-8">
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">
                    No Resignation Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    You haven't submitted a resignation application yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Information Card */}
          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                    Important Information
                  </h3>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• Resignation applications are subject to management approval</li>
                    <li>• You can edit or delete your application while it's in pending status</li>
                    <li>• Please ensure your notice period complies with company policy</li>
                    <li>• Supporting documents help in faster processing of your application</li>
                    <li>• Contact HR department for any queries regarding the resignation process</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  </ModernDashboardLayout>
  );
};

export default ResignationPage;