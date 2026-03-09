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

      const response = await axiosInstance.get('/staff/resignation');

      return response.data;
    } catch (error: any) {
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

      formData.append('reason', resignationData.reason);

      if (resignationData.document) {
        formData.append('document', resignationData.document);
      }


      const response = await axiosInstance.post('/staff/resignation', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });


      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update existing resignation (for staff - only if pending)
   */
  static async updateResignation(id: string, resignationData: UpdateResignationRequest): Promise<ResignationResponse> {
    try {
      const formData = new FormData();

      if (resignationData.reason !== undefined) formData.append('reason', resignationData.reason);
      if (resignationData.document) formData.append('document', resignationData.document);


      const response = await axiosInstance.put(`/staff/resignation/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete resignation (for staff - only if pending)
   */
  static async deleteResignation(id: string): Promise<DeleteResignationResponse> {
    try {
      const response = await axiosInstance.delete(`/staff/resignation/${id}`);
      return response.data;
    } catch (error) {
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


      const response = await axiosInstance.get('/admin/resignations', {
        params: requestParams,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get resignation by ID (for admin)
   */
  static async getResignationById(id: string): Promise<ResignationResponse> {
    try {
      const response = await axiosInstance.get(`/admin/resignations/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Review resignation (for admin - approve/reject)
   */
  static async reviewResignation(id: string, reviewData: ReviewResignationRequest): Promise<ResignationResponse> {
    try {

      const response = await axiosInstance.patch(`/admin/resignations/${id}/review`, reviewData);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Download resignation document
   */
  static async downloadDocument(resignationId: string): Promise<Blob> {
    try {

      const response = await axiosInstance.get(`/resignation/${resignationId}/document`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default ResignationService;