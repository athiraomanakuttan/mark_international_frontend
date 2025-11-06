'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  Employee, 
  EmployeeFormData, 
  EmployeeFormErrors, 
  EMPLOYEE_STATUS,
  EMPLOYEE_STATUS_LABELS 
} from '@/types/employee-types';
import { DesignationBasicType, DesignationResponse } from '@/types/designation-types';
import EmployeeService from '@/service/employeeService';
import { getDesignations } from '@/service/admin/designationService';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee?: Employee;
  mode: 'add' | 'edit';
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employee,
  mode
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [designations, setDesignations] = useState<DesignationResponse[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    phoneNumber: '',
    designation: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    address: '',
    status: EMPLOYEE_STATUS.ACTIVE,
  });
  
  const [errors, setErrors] = useState<EmployeeFormErrors>({});

  // Load designations on component mount
  useEffect(() => {
    if (isOpen) {
      loadDesignations();
    }
  }, [isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        designation: employee.designation._id,
        dateOfJoining: new Date(employee.dateOfJoining).toISOString().split('T')[0],
        address: employee.address || '',
        status: employee.status,
      });
      
      // Set image preview if exists
      if (employee.profilePicture) {
        setImagePreview(`${process.env.NEXT_PUBLIC_API_URL}/${employee.profilePicture}`);
      }
    } else {
      // Reset form for add mode
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        designation: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
        address: '',
        status: EMPLOYEE_STATUS.ACTIVE,
      });
      setImagePreview('');
    }
    setErrors({});
  }, [mode, employee]);

  const loadDesignations = async () => {
    try {
      const response = await getDesignations(1, 100);
      if (response.status) {
        setDesignations(response.data.designations);
      } else {
        toast.error('Failed to load designations');
      }
    } catch (error) {
      console.error('Error loading designations:', error);
      toast.error('Failed to load designations. Please try again.');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: EmployeeFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.designation) {
      newErrors.designation = 'Designation is required';
    }

    // salary is not used in the registration form

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof EmployeeFormData, value: string | number | File) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field as keyof EmployeeFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'Please select a valid image file (JPG, PNG, GIF)'
        }));
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'Image size should be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.profilePicture) {
        setErrors(prev => ({
          ...prev,
          profilePicture: undefined
        }));
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      profilePicture: undefined
    }));
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        designation: formData.designation,
        dateOfJoining: formData.dateOfJoining,
        address: formData.address,
        status: formData.status,
        profilePicture: formData.profilePicture,
      };

      if (mode === 'add') {
        await EmployeeService.createEmployee(submitData);
        toast.success('Employee created successfully!');
      } else {
        await EmployeeService.updateEmployee(employee!._id, submitData);
        toast.success('Employee updated successfully!');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save employee';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Employee' : 'Edit Employee'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Label
                  htmlFor="profilePicture"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  JPG, PNG, GIF up to 5MB
                </p>
              </div>
            </div>
            {errors.profilePicture && (
              <p className="text-sm text-red-500">{errors.profilePicture}</p>
            )}
          </div>

          {/* Employee Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Enter phone number"
                className={errors.phoneNumber ? 'border-red-500' : ''}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Select
                value={formData.designation}
                onValueChange={(value) => handleInputChange('designation', value)}
              >
                <SelectTrigger className={errors.designation ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {designations.map((designation) => (
                    <SelectItem key={designation.id || 'unknown'} value={designation.id || 'unknown'}>
                      {designation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.designation && (
                <p className="text-sm text-red-500">{errors.designation}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfJoining">Date of Joining</Label>
              <Input
                id="dateOfJoining"
                type="date"
                value={formData.dateOfJoining}
                onChange={(e) => handleInputChange('dateOfJoining', e.target.value)}
              />
            </div>

            

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status.toString()}
                onValueChange={(value) => handleInputChange('status', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EMPLOYEE_STATUS.ACTIVE.toString()}>
                    {EMPLOYEE_STATUS_LABELS[EMPLOYEE_STATUS.ACTIVE]}
                  </SelectItem>
                  <SelectItem value={EMPLOYEE_STATUS.INACTIVE.toString()}>
                    {EMPLOYEE_STATUS_LABELS[EMPLOYEE_STATUS.INACTIVE]}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter address"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[100px]"
            >
              {isLoading ? 'Saving...' : mode === 'add' ? 'Create Employee' : 'Update Employee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeFormModal;