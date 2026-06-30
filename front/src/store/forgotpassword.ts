import axios from "axios";
import { defineStore } from "pinia";
import BASE_URL from "../config";
import { toast } from "vue3-toastify";
import router from "../routes";



const useForgotPasswordStore = defineStore('forgotPassword',{

    state:() => ({
        isloading:false,
        email:''
    }),
    actions:{
      async  requestForgotPassword(email:string){
        this.email = email
        this.isloading = true
        try{
         const response = await axios.post(`${BASE_URL}/api/auth/forgot-password`,{email})
         console.log(response.data);
         this.isloading = false
         if(response.data.success){
             toast.success(response.data.message)
             router.push("/otp-code")
         }
         else{
            toast.info(response.data.message)
            return
         }
        }catch(err){
            console.log(err);
             this.isloading = false
            
        }

        }
    }


})


export default useForgotPasswordStore