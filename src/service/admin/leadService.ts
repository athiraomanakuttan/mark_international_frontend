import { LeadBasicType } from '@/types/lead-type'
import axiosInstance from '../axiosInstance'

export const createLead = async (leadData: LeadBasicType) => {
    try {
        const response = await axiosInstance.post('/leads', leadData);
        return response.data;
    } catch (error) {
        console.error('Error creating lead:', error);
        throw error;
    }
}