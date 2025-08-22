import { FollowUpType, LeadBasicType } from "@/types/lead-type";
import { updateLead } from "./staff/leadService";
import axiosInstance from "./axiosInstance";

export const updatedFollowupType = async (id: string, formData: LeadBasicType & FollowUpType, assignedAgentId:string) => {
    const { call_result,called_date, leadType, priority, remarks, status, followup_date, } = formData
    try{
        const finalData = {call_result, called_date, leadType, priority} as Partial<LeadBasicType>
        if(remarks!=="")
            finalData["remarks"] = remarks
        if(Number(status)>1 && Number(status)<5)
            finalData["status"] = status
        console.log("final data", finalData)
        const updateData = await updateLead(id, finalData);
        console.log("updateData", updateData)
        // if a fllowup added
        if(status === 3){
            const newfollowup =  createFollowup( {leadId: id, followup_date, assignedAgentId, remarks} as FollowUpType)
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