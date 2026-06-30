
import axios from "axios";
import { defineStore } from "pinia";
import BASE_URL from "../config";
import router from "../routes";
import { toast } from "vue3-toastify";




const useResetPasswordStore = defineStore('resetPassword',{


    actions:{
      async  resetRequestPassword(data:{email:string,code:string,new_password:string}){
            const response = await axios.post(`${BASE_URL}/api/auth/reset-password`,data)
             if(response.data.success){
                toast.success(response.data.message)
             }
             else{
                 toast.error(response.data.message || "Xatolik yuz berdi ")
             }
            router.push("/")
        }
    }
})

export default useResetPasswordStore