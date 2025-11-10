import axiosInstance from './axiosInstance';
import { 
  Resignation,
  ResignationResponse,
  ResignationsResponse,
  DeleteResignationResponse,
  CreateResignationRequest,
  UpdateResignationRequest,
  ReviewResignationRequest,
  GetResignationsParams
} from '@/types/resignation-types';

export class ResignationService {
  /**
   * Get user's resignation (for staff)
   */
  static async getUserResignation(): Promise<ResignationResponse> {
    try {
      console.log('🔍 Fetching user resignation...');
      const response = await axiosInstance.get('/staff/resignation');
      console.log('✅ User resignation fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching user resignation:', error);
      // If no resignation found, return a proper response
      if (error?.response?.status === 404) {
        return {
          status: false,
          message: 'No resignation found',
          data: null as any
        };
      }
      throw error;
    }
  }

  /**
   * Create new resignation (for staff)
   */
  static async createResignation(resignationData: CreateResignationRequest): Promise<ResignationResponse> {
    try {
      const formData = new FormData();

      formData.append('startDate', resignationData.startDate);
      formData.append('reason', resignationData.reason);

      if (resignationData.document) {
        formData.append('document', resignationData.document);
      }

      console.log('📝 Creating resignation with data:', {
        startDate: resignationData.startDate,
        reason: resignationData.reason,
        hasDocument: !!resignationData.document
      });

      const response = await axiosInstance.post('/staff/resignation', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('✅ Resignation created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating resignation:', error);
      throw error;
    }
  }

  /**
   * Update existing resignation (for staff - only if pending)
   */
  static async updateResignation(id: string, resignationData: UpdateResignationRequest): Promise<ResignationResponse> {
    try {
      const formData = new FormData();

      if (resignationData.startDate !== undefined) formData.append('startDate', resignationData.startDate);
      if (resignationData.reason !== undefined) formData.append('reason', resignationData.reason);
      if (resignationData.document) formData.append('document', resignationData.document);


      const response = await axiosInstance.put(`/staff/resignation/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error updating resignation:', error);
      throw error;
    }
  }

  /**
   * Delete resignation (for staff - only if pending)
   */
  static async deleteResignation(id: string): Promise<DeleteResignationResponse> {
    try {
      console.log('🗑️ Deleting resignation:', id);
      const response = await axiosInstance.delete(`/staff/resignation/${id}`);
      console.log('✅ Resignation deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting resignation:', error);
      throw error;
    }
  }

  /**
   * Get all resignations with pagination (for admin)
   */
  static async getResignations(params: GetResignationsParams = {}): Promise<ResignationsResponse> {
    try {
      const { page = 1, limit = 10, search = '', status } = params;

      const requestParams: any = {
        page,
        limit,
        search: search.trim(),
      };

      if (status !== undefined) {
        requestParams.status = status;
      }

      console.log('📋 Fetching resignations with params:', requestParams);

      const response = await axiosInstance.get('/admin/resignations', {
        params: requestParams,
      });

      console.log('✅ Resignations fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching resignations:', error);
      throw error;
    }
  }

  /**
   * Get resignation by ID (for admin)
   */
  static async getResignationById(id: string): Promise<ResignationResponse> {
    try {
      console.log('🔍 Fetching resignation by ID:', id);
      const response = await axiosInstance.get(`/admin/resignations/${id}`);
      console.log('✅ Resignation fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching resignation:', error);
      throw error;
    }
  }

  /**
   * Review resignation (for admin - approve/reject)
   */
  static async reviewResignation(id: string, reviewData: ReviewResignationRequest): Promise<ResignationResponse> {
    try {
      console.log('👨‍💼 Reviewing resignation:', id, reviewData);

      const response = await axiosInstance.patch(`/admin/resignations/${id}/review`, reviewData);

      console.log('✅ Resignation reviewed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error reviewing resignation:', error);
      throw error;
    }
  }

  /**
   * Download resignation document
   */
  static async downloadDocument(resignationId: string): Promise<Blob> {
    try {
      console.log('📄 Downloading resignation document:', resignationId);

      const response = await axiosInstance.get(`/resignation/${resignationId}/document`, {
        responseType: 'blob',
      });

      console.log('✅ Document downloaded successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error downloading document:', error);
      throw error;
    }
  }
}

export default ResignationService;