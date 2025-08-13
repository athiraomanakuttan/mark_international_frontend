import { LeadBasicType, LeadFilterType } from '@/types/lead-type'
import axiosInstance from '../axiosInstance'
import { FinalProcessedLead } from '@/types/lead-import';

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

export const bulkLeadUpload = async (leadData: FinalProcessedLead[])=>{
    try {
        const response = await axiosInstance.post('/admin/leads/upload', leadData)
        return response.data
    } catch (error) {
        throw error
    }
}

export const updateLead = async (id: string, leadData: Partial<LeadBasicType>)=>{
    try{
        const response = await axiosInstance.patch(`/admin/leads/${id}`,leadData)
        return response.data
    }catch(err){
        throw err
    }
}

export const trannsferLead = async (staffId:string, leadList:string[])=>{
    try {
        const response = await axiosInstance.patch('/admin/leads/transfer',{staffId, leadList})
            return response.data
    } catch (error) {
        throw error
    }
} 

export const deletelead = async (leadStatus:number= 0, leadList:string[])=>{
    try{
        const response = await axiosInstance.patch('/admin/leads/delete',{leadStatus, leadList})
        return response.data
    }catch(err){
        throw err
    }
}

export const getUnassignedLeads = async (status:string="1", page:number=1, limit:number=10,filterData?:LeadFilterType, search?:string)=>{
    try {
        const filter = JSON.stringify(filterData)
        const response =  await axiosInstance.get(`/admin/leads/unassigned?status=${status}&page=${page}&limit=${limit}&filter=${filter}&search=${search}`)
        return response.data
    } catch (error) {
        console.error('Error getting lead:', error);
        throw error;
    }
}

export const assignLeads = async (leadList:string[], staffId:string)=>{
    try{
        const response =  await axiosInstance.patch('/admin/leads/assign',{leadList, staffId})
        return response.data
    }catch(err){
        throw err
    }
}