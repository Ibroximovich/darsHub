import { defineStore } from "pinia";
import { dataType } from "../@types";
import http from "../utils/http";
import Cookies from "js-cookie";
import router from "../routes";
import { toast } from "vue3-toastify";




const useLoginStore = defineStore("login",{

       state:() =>({
        isLoading:false
       }),
        actions:{
           async loginRequest(data:dataType){
             this.isLoading = true
                try{
                    const response = await http.post('/api/auth/login',data)
                    this.isLoading = false
                    if(response.data.success == false){
                        toast.error(response.data.message)

                    }else{
                        Cookies.set("token",response.data.token)
                        localStorage.setItem("data",JSON.stringify(response.data.user))
                        router.push('/dashboard')
                    }
                    
                } catch(err){
                   
                    
                    
                    
                }
                

            }
        }
})


export default useLoginStore