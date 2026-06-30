import axios from "axios";
import { defineStore } from "pinia";
import BASE_URL from "../config";
import { toast } from "vue3-toastify";
import router from "../routes";


const useOtpCodeStore = defineStore("otpCode",{
    state:() =>({
        code:''
    }),

    actions:{
       async otpCodeRequest (data:{email:string,code:string}){
        this.code = data.code
        
        try{
            const responsive = await axios.post(`${BASE_URL}/api/auth/verify-code`,data)
            if(responsive.data.success == true){
                toast.success(responsive.data.message)
                router.push("/reset-password")
            }else{
                toast.error(responsive.data.message)
                return 
            }
            
        }catch(err){
            console.log(err);
            
        }
        }
    }
})

export default useOtpCodeStore