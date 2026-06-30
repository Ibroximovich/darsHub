
import { defineStore } from "pinia";
import http from "../utils/http";
import router from "../routes";
import { toast } from "vue3-toastify";




const useResetPasswordStore = defineStore('resetPassword',{


    actions:{
      async  resetRequestPassword(data:{email:string,code:string,new_password:string}){
            const response = await http.post('/api/auth/reset-password',data)
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