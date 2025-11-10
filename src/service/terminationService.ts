import axiosInstance from './axiosInstance';
import {
  Termination,
  TerminationResponse,
  TerminationsResponse,
  StaffEmployeeListResponse,
  CreateTerminationRequest,
  GetTerminationsParams
} from '@/types/termination-types';

export class TerminationService {
  /**
   * Get all terminations with pagination (for admin)
   */
  static async getTerminations(params: GetTerminationsParams = {}): Promise<TerminationsResponse> {
    try {
      const { page = 1, limit = 10, search = '', type } = params;

      const requestParams: any = {
        page,
        limit,
        search: search.trim(),
      };

      if (type) {
        requestParams.type = type;
      }

      console.log('📋 Fetching terminations with params:', requestParams);

      const response = await axiosInstance.get('/admin/terminations', {
        params: requestParams,
      });

      console.log('✅ Terminations fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching terminations:', error);
      throw error;
    }
  }

  /**
   * Get termination by ID (for admin)
   */
  static async getTerminationById(id: string): Promise<TerminationResponse> {
    try {
      console.log('🔍 Fetching termination by ID:', id);
      const response = await axiosInstance.get(`/admin/terminations/${id}`);
      console.log('✅ Termination fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching termination:', error);
      throw error;
    }
  }

  /**
   * Create new termination (for admin)
   */
  static async createTermination(terminationData: CreateTerminationRequest): Promise<TerminationResponse> {
    try {
      console.log('📝 Creating termination with data:', terminationData);

      const response = await axiosInstance.post('/admin/terminations', terminationData);

      console.log('✅ Termination created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating termination:', error);
      throw error;
    }
  }

  /**
   * Get active staff list (for admin)
   */
  static async getActiveStaff(): Promise<StaffEmployeeListResponse> {
    try {
      console.log('👥 Fetching active staff list...');
      const response = await axiosInstance.get('/admin/terminations/active-staff');
      console.log('✅ Active staff fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching active staff:', error);
      throw error;
    }
  }

  /**
   * Get active employees list (for admin)
   */
  static async getActiveEmployees(): Promise<StaffEmployeeListResponse> {
    try {
      console.log('👷 Fetching active employees list...');
      const response = await axiosInstance.get('/admin/terminations/active-employees');
      console.log('✅ Active employees fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching active employees:', error);
      throw error;
    }
  }
}

export default TerminationService;
