import { FollowUpType, LeadBasicType } from "@/types/lead-type";
import { updateLead } from "./staff/leadService";
import axiosInstance from "./axiosInstance";

export const updatedFollowupType = async (id: string, formData: LeadBasicType & FollowUpType) => {
    const { call_result,called_date, leadType, priority, remarks, status, followup_date, } = formData
    try{
        const updateData = await updateLead(id, { call_result, called_date, leadType, priority, remarks, status } as Partial<LeadBasicType>);
        console.log("updateData", updateData)
        // if a fllowup added
        if(status === 2){
            const newfollowup =  createFollowup( {leadId: id, followup_date} as FollowUpType)
        }
        return updateData
    }catch(err){
        console.error("Error updating follow-up type:", err);
        throw new Error("Failed to update follow-up type");
    }
}

export const createFollowup = async ( data: FollowUpType) => {
    try {
        const response = await axiosInstance.post('/followup',data)
        return response.data
    } catch (error) {
        console.error("Error creating follow-up:", error);
        throw error;
    }
}