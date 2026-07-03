import { defineStore } from "pinia";
import { addGroupType} from "../@types";
import http from "../utils/http";
import { toast } from "vue3-toastify";


const useAddGroupStore = defineStore("addGroup",{

    state:() => ({
        isLoading:false
    }),

    actions:{
      async addGroupFn(group: addGroupType) {
        this.isLoading = true
        try {
          await http.post("/api/groups", group)
          toast.success("Muvaffaqiyatli qo'shildi")
          return true
        } catch (err) {
          console.log(err)
          toast.error("Ma'lumot qo'shilmadi")
          return false
        } finally {
          this.isLoading = false
        }
      },

      async updateGroupFn(id: number, group: addGroupType) {
        this.isLoading = true
        try {
          await http.put(`/api/groups/${id}`, group)
          toast.success("Muvaffaqiyatli yangilandi")
          return true
        } catch (err) {
          console.log(err)
          toast.error("Ma'lumot yangilanmadi")
          return false
        } finally {
          this.isLoading = false
        }
      }
    }

})


export default useAddGroupStore