import { BASICRESPONSE } from "@/constance/BasicResponseType";
import { LoginType } from "@/types/formTypes";
import axios from "axios";
const BACKEND_URI = process.env.BACKEND_URI

export const loginUser = async (data : LoginType)=>{
try {
    const response = await axios.post(`${BACKEND_URI}`,data)
    return response.data
} catch (error) {
    console.log(error)
    return BASICRESPONSE
}
}