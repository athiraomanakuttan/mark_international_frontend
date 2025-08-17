import axiosInstance from "../axiosInstance";

export const leadDashboardData = async ()=>{
    console.log("calling")
    try {
        const responce = await axiosInstance.get('/staff/dashboard/lead')
        return responce.data
    } catch (error) {
        throw error
    }
}

export const getStaffWiseReport = async (fromDate:Date , toDate:Date)=>{
try{
    const response = await axiosInstance.get(`/staff/dashboard/staff-lead?from=${fromDate}&to=${toDate}`)
    return response.data
}catch(err){
    throw err
}
}

