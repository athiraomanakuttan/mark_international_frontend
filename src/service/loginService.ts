import { BASICRESPONSE } from "@/constance/BasicResponseType";
import { LoginType } from "@/types/formTypes";
import axios from "axios";
const NEXT_PUBLIC_BACKEND_URI = process.env.NEXT_PUBLIC_BACKEND_URI;

export const loginUser = async (data : LoginType)=>{
try {
    console.log("working",data)
    const response = await axios.post(`${NEXT_PUBLIC_BACKEND_URI}/auth/login`,{phoneNumber:data.userName,password:data.password});
    return response.data
} catch (error) {
    console.log(error)
    return BASICRESPONSE
}
}