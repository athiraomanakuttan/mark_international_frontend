import { DesignationBasicType, DesignationFilterType } from '@/types/designation-types';
import axiosInstance from '../axiosInstance';

export const createDesignation = async (designationData: DesignationBasicType) => {
    try {
        const response = await axiosInstance.post('/admin/designations', designationData);
        return response.data;
    } catch (error) {
        console.error('Error creating designation:', error);
        throw error;
    }
}

export const getDesignations = async (
    page: number = 1, 
    limit: number = 10, 
    filterData?: DesignationFilterType, 
    search?: string
) => {
    try {
        const filter = JSON.stringify(filterData || {});
        const response = await axiosInstance.get(
            `/admin/designations?page=${page}&limit=${limit}&filter=${filter}&search=${search || ''}`
        );
        console.log('Designation service response:', response.data.data); 
        return response.data;
    } catch (error) {
        console.error('Error getting designations:', error);
        throw error;
    }
}

export const getDesignationById = async (designationId: string) => {
    try {
        const response = await axiosInstance.get(`/admin/designations/${designationId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting designation:', error);
        throw error;
    }
}

export const updateDesignation = async (designationId: string, designationData: Partial<DesignationBasicType>) => {
    try {
        const response = await axiosInstance.put(`/admin/designations/${designationId}`, designationData);
        return response.data;
    } catch (error) {
        console.error('Error updating designation:', error);
        throw error;
    }
}

export const deleteDesignation = async (designationId: string) => {
    try {
        const response = await axiosInstance.delete(`/admin/designations/${designationId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting designation:', error);
        throw error;
    }
}

export const getAllActiveDesignations = async () => {
    try {
        const response = await axiosInstance.get('/admin/designations/active');
        return response.data;
    } catch (error) {
        console.error('Error getting active designations:', error);
        throw error;
    }
}