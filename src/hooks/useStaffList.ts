'use client';
import { useEffect, useState } from 'react';
import { StaffBasicType } from "@/types/staff-type";
import { staffDataManager } from '@/lib/staffDataManager';

export const useStaffList = () => {
  const [staffList, setStaffList] = useState<StaffBasicType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to staff data updates
    const unsubscribe = staffDataManager.subscribe(setStaffList);

    const fetchStaff = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await staffDataManager.getStaffList();
        setStaffList(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch staff list');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();

    return unsubscribe;
  }, []);

  const refreshStaffList = async () => {
    staffDataManager.invalidateCache();
    setLoading(true);
    setError(null);
    try {
      const data = await staffDataManager.getStaffList();
      setStaffList(data);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh staff list');
    } finally {
      setLoading(false);
    }
  };

  return {
    staffList,
    loading,
    error,
    refreshStaffList
  };
};