import { LeadBasicType, LeadFilterType } from "@/types/lead-type";
import axiosInstance from "../axiosInstance";
import { FinalProcessedLead } from "@/types/lead-import";

export const getLeads = async (status:string="1", page:number=1, limit:number=10,filterData?:LeadFilterType, search?:string)=>{
    try {
        const filter = JSON.stringify(filterData)
        const response =  await axiosInstance.get(`/staff/leads?status=${status}&page=${page}&limit=${limit}&filter=${filter}&search=${search}`)
        return response.data
    } catch (error) {
        console.error('Error getting lead:', error);
        throw error;
    }
}

export const deletelead = async (leadStatus:number= 0, leadList:string[])=>{
    try{
        const response = await axiosInstance.patch('/staff/leads/delete',{leadStatus, leadList})
        return response.data
    }catch(err){
        throw err
    }
}

export const createLead = async (leadData: LeadBasicType) => {
    try {
        const response = await axiosInstance.post('/staff/leads', leadData);
        return response.data;
    } catch (error) {
        console.error('Error creating lead:', error);
        throw error;
    }
}

export const bulkLeadUpload = async (leadData: FinalProcessedLead[])=>{
    try {
        const response = await axiosInstance.post('/staff/leads/upload', leadData)
        return response.data
    } catch (error) {
        throw error
    }
}


export const updateLead = async (id: string, leadData: Partial<LeadBasicType>)=>{
    console.log("leadData", leadData)
    try{
        const response = await axiosInstance.patch(`/staff/leads/${id}`,leadData)
        return response.data
    }catch(err){
        throw err
    }
}

export const getExportLeads = async (
  filterData?: LeadFilterType,
  search?: string
) => {
  try {
    const filter = JSON.stringify(filterData);
    const response = await axiosInstance.get(
      `/staff/leads/export-lead?filter=${filter}&search=${search}`,
      { responseType: "blob" } // 👈 IMPORTANT
    );
    return response;
  } catch (error) {
    console.error("Error getting lead:", error);
    throw error;
  }
}
