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



      const response = await axiosInstance.get('/admin/terminations', {
        params: requestParams,
      });


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

      const response = await axiosInstance.get(`/admin/terminations/${id}`);

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


      const response = await axiosInstance.post('/admin/terminations', terminationData);


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

      const response = await axiosInstance.get('/admin/terminations/active-staff');

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

      const response = await axiosInstance.get('/admin/terminations/active-employees');

      return response.data;
    } catch (error) {
      console.error('❌ Error fetching active employees:', error);
      throw error;
    }
  }
}

export default TerminationService;
