import { defineStore } from "pinia";
import { dataType } from "../@types";
import axios from "axios";
import BASE_URL from "../config";

import Cookies from 'js-cookie';
import { toast } from "vue3-toastify";
import router from "../routes";

const useRegisterStore = defineStore('register', {

    state:() =>({
        isLoading:false

    }),

    actions: {
        async registerRequest(data: dataType) {
            this.isLoading = true
            try {
                const res = await axios.post(`${BASE_URL}/api/auth/register`, data);
                this.isLoading = false

                if (res.data.success == false) {
                    toast.error(res.data.message || "Xatolik yuz berdi");
                } else {
                    localStorage.setItem('data', JSON.stringify(res.data.user));
                    Cookies.set('token', res.data.token);
                    router.push("/dashboard");
                }
            } catch (err: any) {
                console.log(err.message);
                toast.error(err.response?.data?.message || "Server bilan bog'lanishda xatolik yuz berdi");
            }
        }
    }

})

export default useRegisterStore