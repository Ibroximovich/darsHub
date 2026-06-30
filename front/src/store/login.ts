import { defineStore } from "pinia";
import { dataType } from "../@types";
import axios from "axios";
import BASE_URL from "../config";
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
                    const response = await axios.post(`${BASE_URL}/api/auth/login`,data)
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