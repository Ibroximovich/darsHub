import { defineStore } from "pinia";
import http from "../utils/http";
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
            const responsive = await http.post('/api/auth/verify-code',data)
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