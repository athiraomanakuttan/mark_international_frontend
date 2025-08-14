import { LeadFilterType } from "@/types/lead-type";
import axiosInstance from "../axiosInstance";

 export const getTransferLeads = async (status:string="1", page:number=1, limit:number=10,filterData?:LeadFilterType, search?:string)=>{
     try {
         const filter = JSON.stringify(filterData)
         const response =  await axiosInstance.get(`/admin/transfer?status=${status}&page=${page}&limit=${limit}&filter=${filter}&search=${search}`)
         return response.data
     } catch (error) {
         console.error('Error getting lead:', error);
         throw error;
     }
 } 

 