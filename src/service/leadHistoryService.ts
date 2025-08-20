import axiosInstance from "./axiosInstance";

export const getLeadHistory = async (leadId: string) => {
  try {
    const response = await axiosInstance.get(`/lead-history/${leadId}`);
    return response.data
  } catch (error) {
    console.error('Error fetching lead history:', error);
    throw error;
  }
}

export const getLeadDataById = async (leadId: string)=>{
  try{
    const response = await axiosInstance.get(`/lead-history/lead/${leadId}`);
    return response.data
  }catch(err){
    throw err
  }
}