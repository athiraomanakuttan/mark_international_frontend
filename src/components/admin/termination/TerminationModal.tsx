'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserX } from 'lucide-react';
import {
  TerminationType,
  StaffEmployee,
  CreateTerminationRequest,
  TERMINATION_TYPE_LABELS
} from '@/types/termination-types';
import TerminationService from '@/service/terminationService';

interface TerminationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TerminationModal: React.FC<TerminationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [type, setType] = useState<TerminationType>('staff');
  const [personId, setPersonId] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [staffList, setStaffList] = useState<StaffEmployee[]>([]);
  const [employeeList, setEmployeeList] = useState<StaffEmployee[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setType('staff');
      setPersonId('');
      setReason('');
      loadStaffList();
    }
  }, [isOpen]);

  // Load appropriate list when type changes
  useEffect(() => {
    if (isOpen) {
      setPersonId(''); // Reset person selection
      if (type === 'staff') {
        loadStaffList();
      } else {
        loadEmployeeList();
      }
    }
  }, [type, isOpen]);

  const loadStaffList = async () => {
    setIsLoadingList(true);
    try {
      const response = await TerminationService.getActiveStaff();
      if (response.status) {
        setStaffList(response.data);
      } else {
        toast.error('Failed to load staff list');
      }
    } catch (error: any) {
      console.error('Error loading staff:', error);
      toast.error('Failed to load staff list');
    } finally {
      setIsLoadingList(false);
    }
  };

  const loadEmployeeList = async () => {
    setIsLoadingList(true);
    try {
      const response = await TerminationService.getActiveEmployees();
      if (response.status) {
        setEmployeeList(response.data);
      } else {
        toast.error('Failed to load employee list');
      }
    } catch (error: any) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employee list');
    } finally {
      setIsLoadingList(false);
    }
  };

  const validateForm = (): boolean => {
    if (!type) {
      toast.error('Please select type (Staff or Employee)');
      return false;
    }

    if (!personId) {
      toast.error(`Please select a ${type}`);
      return false;
    }

    if (!reason || reason.trim().length < 10) {
      toast.error('Reason must be at least 10 characters');
      return false;
    }

    if (reason.trim().length > 1000) {
      toast.error('Reason must not exceed 1000 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const terminationData: CreateTerminationRequest = {
        type,
        personId,
        reason: reason.trim(),
      };

      const response = await TerminationService.createTermination(terminationData);

      if (response.status) {
        toast.success(response.message || 'Termination created successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Failed to create termination');
      }
    } catch (error: any) {
      console.error('Error creating termination:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create termination';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentList = type === 'staff' ? staffList : employeeList;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-red-600" />
            Add Termination
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={type} onValueChange={(value) => setType(value as TerminationType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">{TERMINATION_TYPE_LABELS.staff}</SelectItem>
                <SelectItem value="employee">{TERMINATION_TYPE_LABELS.employee}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Person Selection */}
          <div className="space-y-2">
            <Label htmlFor="personId">
              {type === 'staff' ? 'Office Staff' : 'Employee'} *
            </Label>
            <Select 
              value={personId} 
              onValueChange={setPersonId}
              disabled={isLoadingList}
            >
              <SelectTrigger>
                <SelectValue 
                  placeholder={
                    isLoadingList 
                      ? 'Loading...' 
                      : `Select ${type === 'staff' ? 'staff member' : 'employee'}`
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {currentList.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500 text-center">
                    No active {type === 'staff' ? 'staff members' : 'employees'} found
                  </div>
                ) : (
                  currentList.map((person) => (
                    <SelectItem key={person._id} value={person._id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{person.name}</span>
                        {person.email && (
                          <span className="text-xs text-gray-500">{person.email}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Termination *</Label>
            <Textarea
              id="reason"
              placeholder="Enter detailed reason for termination (minimum 10 characters)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={6}
              maxLength={1000}
              disabled={isSubmitting}
              className="resize-none"
            />
            <p className="text-sm text-gray-500">
              {reason.length}/1000 characters (minimum 10 required)
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4 mr-2" />
                  Terminate
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TerminationModal;
