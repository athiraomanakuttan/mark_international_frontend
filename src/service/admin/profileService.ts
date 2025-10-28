import axiosInstance from '../axiosInstance'


export  const changePassword  = async (password: string)=>{
    try {
        const data = await axiosInstance.put('/admin/profile/reset-password',{password})
        if(data)
            return true
    } catch (error) {
        return {status: false, message: "unable to reset password"}
    }
}