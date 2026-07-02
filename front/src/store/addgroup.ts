import { defineStore } from "pinia";
import { addGroupType} from "../@types";
import http from "../utils/http";
import { toast } from "vue3-toastify";


const useAddGroupStore = defineStore("addGroup",{

    state:() => ({
        isLoading:false
    }),

    actions:{
      async  addGroupFn (group:addGroupType){
        this.isLoading = true
        try{
             await http.post("/api/groups",group)
            this.isLoading = false
           toast.success("Muvaffaqqiyatli qo'shildi")
           return true
        }catch(err){
            console.log(err); 
            toast.error("Ma'lumot qo'shilmadi ")
            return false
        }


        }
    }

})


export default useAddGroupStore