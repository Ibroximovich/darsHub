import { defineStore } from "pinia";
import { addStudentType } from "../@types";
import http from "../utils/http";
import { toast } from "vue3-toastify";

const useAddStudentStore = defineStore("addStudent", {
  state: () => ({
    isLoading: false,
  }),

  actions: {
    async addStudentFn(student: addStudentType, groupId?: number | null) {
      this.isLoading = true;
      try {
        const response = await http.post("/api/students", student);
        const createdStudent = response.data.data;

        if (groupId) {
          await http.post(`/api/students/${createdStudent.id}/groups/${groupId}`);
        }

        toast.success("O'quvchi muvaffaqiyatli qo'shildi");
        return true;
      } catch (err) {
        console.log(err);
        toast.error("O'quvchi qo'shilmadi");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async updateStudentFn(
      id: number,
      student: addStudentType,
      groupId: number | null,
      currentGroupIds: number[] = []
    ) {
      this.isLoading = true;
      try {
        await http.put(`/api/students/${id}`, student);

        if (groupId) {
          const groupsToRemove = currentGroupIds.filter((g) => g !== groupId);
          for (const gId of groupsToRemove) {
            await http.delete(`/api/students/${id}/groups/${gId}`);
          }
          if (!currentGroupIds.includes(groupId)) {
            await http.post(`/api/students/${id}/groups/${groupId}`);
          }
        }

        toast.success("O'quvchi muvaffaqiyatli yangilandi");
        return true;
      } catch (err) {
        console.log(err);
        toast.error("Ma'lumot yangilanmadi");
        return false;
      } finally {
        this.isLoading = false;
      }
    },
  },
});

export default useAddStudentStore;
