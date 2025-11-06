'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building, 
  UserCheck 
} from 'lucide-react';
import { 
  Employee, 
  EMPLOYEE_STATUS_LABELS,
  EmployeeStatus 
} from '@/types/employee-types';

interface EmployeeViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const EmployeeViewModal: React.FC<EmployeeViewModalProps> = ({
  isOpen,
  onClose,
  employee
}) => {
  if (!employee) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={employee.profilePicture || undefined}
                    alt={employee.name}
                  />
                  <AvatarFallback className="text-lg">
                    {getInitials(employee.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                    {employee.name}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    {employee.designation}
                  </p>
                  
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-50">
                <User className="w-5 h-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-gray-50">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-gray-50">{employee.phoneNumber}</p>
                  </div>
                </div>
              </div>
              
              {employee.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="font-medium text-gray-900 dark:text-gray-50">{employee.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-50">
                <Building className="w-5 h-5 mr-2" />
                Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Designation</p>
                    <p className="font-medium text-gray-900 dark:text-gray-50">{employee.designation}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date of Joining</p>
                    <p className="font-medium text-gray-900 dark:text-gray-50">{formatDate(employee.dateOfJoining)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-50">System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Created</p>
                  <p className="font-medium text-gray-900 dark:text-gray-50">{formatDate(employee.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="font-medium text-gray-900 dark:text-gray-50">{formatDate(employee.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeViewModal;