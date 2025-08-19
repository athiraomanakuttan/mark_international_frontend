import axiosInstance from "../axiosInstance";

export const leadDashboardData = async (fromDate:Date,toDate:Date)=>{
    console.log("calling")
    try {
        const responce = await axiosInstance.get('/admin/dashboard/lead?from=' + fromDate + '&to=' + toDate)
        return responce.data
    } catch (error) {
        throw error
    }
}

export const getStaffWiseReport = async (fromDate:Date , toDate:Date)=>{
try{
    const response = await axiosInstance.get(`/admin/dashboard/staff-lead?from=${fromDate}&to=${toDate}`)
    return response.data
}catch(err){
    throw err
}
}
export const monthlyWiseCount = async ()=>{
    try {
        const response = await axiosInstance.get('/admin/dashboard/lead/month-wise-report')
        return response.data
    } catch (error) {
        throw error 
}
}

