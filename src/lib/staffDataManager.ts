// Singleton cache for staff data to prevent excessive API calls
'use client';

import { StaffBasicType } from "@/types/staff-type";
import axiosInstance from '@/service/axiosInstance';

class StaffDataManager {
  private static instance: StaffDataManager;
  private staffList: StaffBasicType[] = [];
  private lastFetch: number = 0;
  private isLoading: boolean = false;
  private subscribers: Array<(data: StaffBasicType[]) => void> = [];
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): StaffDataManager {
    if (!StaffDataManager.instance) {
      StaffDataManager.instance = new StaffDataManager();
    }
    return StaffDataManager.instance;
  }

  public subscribe(callback: (data: StaffBasicType[]) => void): () => void {
    this.subscribers.push(callback);
    
    // Immediately call with cached data if available
    if (this.staffList.length > 0) {
      callback(this.staffList);
    }

    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.staffList));
  }

  public async getStaffList(): Promise<StaffBasicType[]> {
    const now = Date.now();
    
    // Return cached data if fresh
    if (this.staffList.length > 0 && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.staffList;
    }

    // If already loading, wait for the existing request
    if (this.isLoading) {
      return new Promise((resolve) => {
        const checkLoading = () => {
          if (!this.isLoading) {
            resolve(this.staffList);
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
    }

    this.isLoading = true;
    
    try {
      console.log('🔄 Fetching staff list from API (singleton)');
      const response = await axiosInstance.get("/admin/staff/get-all-active");
      this.staffList = response?.data?.data || [];
      this.lastFetch = now;
      this.notifySubscribers();
      return this.staffList;
    } catch (error) {
      console.error('❌ Error fetching staff list:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  public invalidateCache() {
    this.lastFetch = 0;
    console.log('🗑️ Staff cache invalidated');
  }

  public getStats() {
    return {
      cacheSize: this.staffList.length,
      lastFetch: new Date(this.lastFetch).toLocaleTimeString(),
      subscriberCount: this.subscribers.length,
      isLoading: this.isLoading
    };
  }
}

export const staffDataManager = StaffDataManager.getInstance();