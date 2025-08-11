import { LeadBasicType, LeadFilterType } from '@/types/lead-type'
import axiosInstance from '../axiosInstance'

export const createLead = async (leadData: LeadBasicType) => {
    try {
        const response = await axiosInstance.post('/admin/leads', leadData);
        return response.data;
    } catch (error) {
        console.error('Error creating lead:', error);
        throw error;
    }
}

export const getLeads = async (status:string="1", page:number=1, limit:number=10,filterData?:LeadFilterType, search?:string)=>{
    try {
        const filter = JSON.stringify(filterData)
        const response =  await axiosInstance.get(`/admin/leads?status=${status}&page=${page}&limit=${limit}&filter=${filter}&search=${search}`)
        return response.data
    } catch (error) {
        console.error('Error getting lead:', error);
        throw error;
    }
}