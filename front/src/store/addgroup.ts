import { defineStore } from "pinia";
import { groupType } from "../@types";
import http from "../utils/http";


const useAddGroupStore = defineStore("addGroup",{

    actions:{
      async  addGroupFn (group:groupType){
        try{
            const response = await http.post("/api/groups",group)
            console.log(response.data);
            
        }catch(err){
            console.log(err);
            
        }


        }
    }

})


export default useAddGroupStore